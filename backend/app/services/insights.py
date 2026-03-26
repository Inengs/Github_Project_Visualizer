from __future__ import annotations

from typing import Any

from app.schemas.insights import InsightsSummaryResponse
from app.services.github import GitHubApiError, GitHubClient


def _trend_from_stars_delta(stars_delta: int) -> str:
    # We use stars delta between the latest two snapshots as a simple
    # directional activity signal for the UI.
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
    # Base score starts neutral, then we apply bounded adjustments so
    # the final value remains stable and predictable for users.
    score = 50
    score += min(25, stars // 100)
    score += min(10, forks // 50)
    score -= min(20, open_issues_count // 10)

    # Merge rate is derived from recently closed PRs as a proxy for
    # how effectively the project turns review into completed work.
    merge_rate = (merged_pr_count / closed_pr_count) if closed_pr_count > 0 else 0.0
    if merge_rate >= 0.7:
        score += 15
    elif merge_rate >= 0.4:
        score += 8
    else:
        score -= 10

    return max(0, min(100, score))


async def build_insights_summary(
    owner: str,
    repo: str,
    *,
    github_client: GitHubClient,
    stars_delta: int,
) -> InsightsSummaryResponse:
    # Pull current repo metadata from GitHub for health/risk inputs.
    repo_payload = await github_client.request_json("GET", f"/repos/{owner}/{repo}")
    if not isinstance(repo_payload, dict):
        raise GitHubApiError(status_code=502, message="Unexpected GitHub repository response shape")

    # Pull recently closed PRs to estimate merge behavior.
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

    # Keep risk signals human-readable for direct display in the panel.
    risk_signals: list[str] = []
    if open_issues_count >= 50:
        risk_signals.append("High number of open issues")
    if closed_pr_count >= 10 and merge_rate < 0.4:
        risk_signals.append("Low PR merge rate")
    if stars_delta < 0:
        risk_signals.append("Declining star trend")
    if not risk_signals:
        risk_signals.append("No major risk signals detected")

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
    )

