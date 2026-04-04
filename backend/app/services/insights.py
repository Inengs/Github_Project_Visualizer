"""
Repository insight aggregation: health score, risk flags, and high-impact narrative lines.

High-impact lines default to deterministic heuristics (snapshots, commits, contributors, PRs).
Optional OpenAI replaces those lines when `use_openai` is set and an API key is available.
"""
from __future__ import annotations

import json
import logging
import re
from datetime import datetime, timezone
from typing import Any

import httpx
from starlette.responses import Response

from app.config import OPENAI_API_KEY
from app.schemas.insights import InsightsSummaryResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.github_cache import get_commit_activity_cached

log = logging.getLogger(__name__)


def _trend_from_stars_delta(stars_delta: int) -> str:
    """Map DB snapshot star delta to a coarse activity label for the UI."""
    if stars_delta > 0:
        return "increasing"
    if stars_delta < 0:
        return "decreasing"
    return "stable"


def _calc_health_score(
    stars: int,
    forks: int,
    open_issues_count: int,
    closed_pr_count: int,
    merged_pr_count: int,
) -> int:
    """Bounded 0–100 score from public signals and sampled closed-PR merge rate."""
    score = 50
    score += min(25, stars // 100)
    score += min(10, forks // 50)
    score -= min(20, open_issues_count // 10)

    merge_rate = (merged_pr_count / closed_pr_count) if closed_pr_count > 0 else 0.0
    if merge_rate >= 0.7:
        score += 15
    elif merge_rate >= 0.4:
        score += 8
    else:
        score -= 10

    return max(0, min(100, score))


def _parse_github_dt(value: str | None) -> datetime | None:
    """Parse GitHub ISO8601 timestamps (with optional Z suffix)."""
    if not value or not isinstance(value, str):
        return None
    s = value.replace("Z", "+00:00")
    try:
        dt = datetime.fromisoformat(s)
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except ValueError:
        return None


def _weekly_totals_from_activity(activity: Any) -> list[int]:
    """Extract per-week commit totals from GitHub `stats/commit_activity` JSON."""
    if not isinstance(activity, list) or not activity:
        return []
    totals: list[int] = []
    for w in activity:
        if isinstance(w, dict) and "total" in w:
            try:
                totals.append(int(w["total"]))
            except (TypeError, ValueError):
                continue
    return totals


def _commit_window_insight(totals: list[int]) -> str | None:
    """Compare last 4 weeks vs the previous 4; needs at least 8 weeks of data."""
    if len(totals) < 8:
        return None
    recent = sum(totals[-4:])
    prior = sum(totals[-8:-4])
    if prior <= 0 and recent <= 0:
        return None
    if prior > 0 and recent < prior * 0.65:
        return "This repository’s weekly commit volume has cooled versus the prior month in GitHub’s sampled window."
    if prior > 0 and recent > prior * 1.35:
        return "Commit activity is accelerating compared to the prior weeks in GitHub’s sampled window."
    if recent == 0 and prior > 0:
        return "Recent weeks show very little commit activity compared to earlier weeks in the sample."
    return None


def _contributor_insight(contributors_payload: Any) -> str | None:
    """Detect concentration using the first page of `/contributors` (up to 100)."""
    if not isinstance(contributors_payload, list) or len(contributors_payload) < 2:
        return None
    pairs: list[tuple[str, int]] = []
    for c in contributors_payload:
        if not isinstance(c, dict):
            continue
        login = c.get("login")
        n = c.get("contributions")
        if isinstance(login, str) and isinstance(n, int):
            pairs.append((login, n))
    if len(pairs) < 2:
        return None
    pairs.sort(key=lambda x: x[1], reverse=True)
    total = sum(n for _, n in pairs)
    if total <= 0:
        return None
    top2 = pairs[0][1] + pairs[1][1]
    share = top2 / total
    if share >= 0.65:
        return (
            "Most contributions come from two developers on the sampled leaderboard "
            f"({pairs[0][0]} and {pairs[1][0]} dominate the contribution counts)."
        )
    if share >= 0.45:
        return "Contributions are moderately concentrated among the top contributors on the sampled leaderboard."
    return None


def _pr_review_time_insight(pulls_payload: list[Any]) -> str | None:
    """Median open→merge duration: first half of merged PRs vs second half (by merge time)."""
    merged: list[tuple[datetime, float]] = []
    for pr in pulls_payload:
        if not isinstance(pr, dict):
            continue
        if not pr.get("merged_at"):
            continue
        created = _parse_github_dt(pr.get("created_at") if isinstance(pr.get("created_at"), str) else None)
        merged_at = _parse_github_dt(pr.get("merged_at") if isinstance(pr.get("merged_at"), str) else None)
        if created is None or merged_at is None:
            continue
        hours = max(0.0, (merged_at - created).total_seconds() / 3600.0)
        merged.append((merged_at, hours))
    if len(merged) < 8:
        return None
    merged.sort(key=lambda x: x[0])
    hours_list = [h for _, h in merged]
    mid = len(hours_list) // 2
    first = hours_list[:mid]
    second = hours_list[mid:]
    if not first or not second:
        return None
    m1 = sorted(first)[len(first) // 2]
    m2 = sorted(second)[len(second) // 2]
    if m1 <= 0:
        return None
    if m2 > m1 * 1.2:
        return "Pull request time from open to merge appears longer for more recent merges in the sampled closed PRs."
    if m2 < m1 * 0.8:
        return "Recent merges are landing faster than earlier ones in the sampled closed pull requests."
    return None


def _stars_snapshot_insight(stars_delta: int) -> str | None:
    """Narrate star change between the two latest DB snapshots (not live star count)."""
    if stars_delta < 0:
        return "Star count dipped between the latest stored snapshots—interest may be softening."
    if stars_delta > 0:
        return "Star count grew between stored snapshots, suggesting sustained attention."
    return None


def _merge_rate_insight(closed_pr_count: int, merge_rate: float) -> str | None:
    """Comment on merge throughput only when the closed-PR sample is large enough."""
    if closed_pr_count < 8:
        return None
    if merge_rate < 0.35:
        return "A relatively low share of sampled closed PRs were merged—review or triage friction may be worth watching."
    if merge_rate >= 0.75:
        return "Most sampled closed pull requests were merged, indicating healthy integration throughput."
    return None


def _build_heuristic_high_impact(
    *,
    stars_delta: int,
    totals: list[int],
    contributors_payload: Any,
    pulls_payload: list[Any],
    closed_pr_count: int,
    merge_rate: float,
) -> list[str]:
    """Collect up to six non-duplicate heuristic sentences; order is intentional (snapshot → velocity → people → PRs)."""
    lines: list[str] = []
    for fn in (
        lambda: _stars_snapshot_insight(stars_delta),
        lambda: _commit_window_insight(totals),
        lambda: _contributor_insight(contributors_payload),
        lambda: _pr_review_time_insight(pulls_payload),
        lambda: _merge_rate_insight(closed_pr_count, merge_rate),
    ):
        s = fn()
        if s and s not in lines:
            lines.append(s)
    if not lines:
        lines.append("Not enough GitHub history in this sample for strong activity signals—fetch again after more usage.")
    return lines[:6]


async def _openai_insight_bullets(*, api_key: str, facts: str) -> list[str] | None:
    """Call OpenAI chat completions; parse JSON `insights` array. Returns None on any failure."""
    prompt = (
        "You summarize GitHub repository health for developers. Using ONLY the facts below, "
        "output 4–6 short, high-impact insight sentences (no bullet symbols). "
        "Do not invent numbers or events not implied by the facts. "
        "Respond with a single JSON object of the form {\"insights\": [\"...\", ...]} and nothing else.\n\n"
        f"Facts:\n{facts}\n"
    )
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {
                "role": "system",
                "content": "You output only valid JSON with an insights array of strings.",
            },
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.35,
        "max_tokens": 500,
    }
    try:
        async with httpx.AsyncClient(timeout=45.0) as client:
            r = await client.post(
                url,
                headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
                json=payload,
            )
            if r.status_code >= 400:
                log.warning("OpenAI insights request failed: %s %s", r.status_code, r.text[:200])
                return None
            data = r.json()
            choice = data.get("choices")
            if not isinstance(choice, list) or not choice:
                return None
            msg = choice[0].get("message", {})
            content = msg.get("content") if isinstance(msg, dict) else None
            if not isinstance(content, str) or not content.strip():
                return None
            text = content.strip()
            if text.startswith("```"):
                text = re.sub(r"^```(?:json)?\s*", "", text)
                text = re.sub(r"\s*```\s*$", "", text)
            m = re.search(r"\{[\s\S]*\}\s*$", text)
            if m:
                text = m.group(0)
            parsed = json.loads(text)
            arr = parsed.get("insights") if isinstance(parsed, dict) else None
            if not isinstance(arr, list):
                return None
            out = [str(x).strip() for x in arr if isinstance(x, str) and str(x).strip()]
            return out[:8] if out else None
    except Exception as e:
        log.warning("OpenAI insights call error: %s", e)
        return None


async def build_insights_summary(
    owner: str,
    repo: str,
    *,
    github_client: GitHubClient,
    stars_delta: int,
    use_openai: bool = False,
    openai_api_key: str | None = None,
) -> InsightsSummaryResponse:
    """
    Load live GitHub data, compute health/risk, then heuristic `high_impact_insights`.

    `stars_delta` comes from stored snapshots (see `get_repo_analytics`); PR/issue counts
    are from the latest API page (closed PRs capped at 100). If `use_openai` and a key
    exist, successful model output replaces heuristic insight lines and sets `used_openai`.
    """
    repo_payload = await github_client.request_json("GET", f"/repos/{owner}/{repo}")
    if not isinstance(repo_payload, dict):
        raise GitHubApiError(status_code=502, message="Unexpected GitHub repository response shape")

    pulls_payload = await github_client.request_json(
        "GET",
        f"/repos/{owner}/{repo}/pulls",
        params={"state": "closed", "per_page": 100},
    )
    if not isinstance(pulls_payload, list):
        raise GitHubApiError(status_code=502, message="Unexpected GitHub pull request response shape")

    closed_pr_count = len(pulls_payload)
    merged_pr_count = sum(1 for pr in pulls_payload if isinstance(pr, dict) and pr.get("merged_at"))
    merge_rate = (merged_pr_count / closed_pr_count) if closed_pr_count > 0 else 0.0

    open_issues_count = int(repo_payload.get("open_issues_count") or 0)
    stars = int(repo_payload.get("stargazers_count") or 0)
    forks = int(repo_payload.get("forks_count") or 0)

    risk_signals: list[str] = []
    if open_issues_count >= 50:
        risk_signals.append("High number of open issues")
    if closed_pr_count >= 10 and merge_rate < 0.4:
        risk_signals.append("Low PR merge rate")
    if stars_delta < 0:
        risk_signals.append("Declining star trend")
    if not risk_signals:
        risk_signals.append("No major risk signals detected")

    contributors_payload = await github_client.request_json(
        "GET",
        f"/repos/{owner}/{repo}/contributors",
        params={"per_page": 100},
    )

    totals: list[int] = []
    try:
        # Same cached path as the repo activity route; failures only weaken heuristics.
        activity = await get_commit_activity_cached(
            gh=github_client,
            owner=owner,
            repo=repo,
            token=github_client.access_token,
            response=Response(),
        )
        totals = _weekly_totals_from_activity(activity)
    except GitHubApiError:
        pass

    high_impact = _build_heuristic_high_impact(
        stars_delta=stars_delta,
        totals=totals,
        contributors_payload=contributors_payload,
        pulls_payload=pulls_payload,
        closed_pr_count=closed_pr_count,
        merge_rate=merge_rate,
    )

    used_openai = False
    if use_openai:
        # Per-request key wins over server env (mirrors README generation).
        key = (openai_api_key or "").strip() or (OPENAI_API_KEY or "").strip()
        if key:
            facts = (
                f"{owner}/{repo}: health context from snapshots stars_delta={stars_delta}, "
                f"open_issues={open_issues_count}, stars={stars}, forks={forks}, "
                f"merge_rate={merge_rate:.2f}, closed_prs_sampled={closed_pr_count}, "
                f"merged_prs={merged_pr_count}, activity_trend_stars={_trend_from_stars_delta(stars_delta)}. "
                f"Weekly commit totals (oldest→newest, up to 52): {totals[-12:] if totals else 'n/a'}."
            )
            ai_lines = await _openai_insight_bullets(api_key=key, facts=facts)
            if ai_lines:
                high_impact = ai_lines
                used_openai = True

    return InsightsSummaryResponse(
        repo_health_score=_calc_health_score(
            stars=stars,
            forks=forks,
            open_issues_count=open_issues_count,
            closed_pr_count=closed_pr_count,
            merged_pr_count=merged_pr_count,
        ),
        activity_trend=_trend_from_stars_delta(stars_delta),
        risk_signals=risk_signals,
        closed_prs_sampled=closed_pr_count,
        merged_prs_sampled=merged_pr_count,
        merge_rate=round(merge_rate, 3),
        high_impact_insights=high_impact,
        used_openai=used_openai,
    )
