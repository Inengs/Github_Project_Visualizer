from __future__ import annotations

import logging
from typing import Any

import httpx
import markdown
from starlette.responses import Response

from app.config import OPENAI_API_KEY
from app.schemas.insights import InsightsSummaryResponse
from app.schemas.readme import GenerateReadmeRequest, GenerateReadmeResponse, ReadmeExportFormat
from app.services.github import GitHubApiError, GitHubClient
from app.services.github_cache import get_commit_activity_cached
from app.services.insights import build_insights_summary
from app.services.repository_analytics import get_repo_analytics

log = logging.getLogger(__name__)


async def _search_total(gh: GitHubClient, q: str) -> int:
    payload = await gh.request_json("GET", "/search/issues", params={"q": q, "per_page": 1})
    if not isinstance(payload, dict):
        return 0
    return int(payload.get("total_count") or 0)


def _pct_language(languages: dict[str, int]) -> list[tuple[str, float]]:
    total = sum(languages.values()) or 1
    pairs = sorted(languages.items(), key=lambda x: x[1], reverse=True)
    return [(name, round(100.0 * count / total, 1)) for name, count in pairs[:12]]


def _commit_activity_summary(activity: Any) -> tuple[int | None, str]:
    """
    GitHub commit_activity: list of { total, week, days }.
    Returns (sum of weekly totals over the series, human note).
    """
    if not isinstance(activity, list) or not activity:
        return None, "Commit activity statistics were unavailable (GitHub may still be building them)."
    totals: list[int] = []
    for w in activity:
        if isinstance(w, dict) and "total" in w:
            try:
                totals.append(int(w["total"]))
            except (TypeError, ValueError):
                continue
    if not totals:
        return None, "Commit activity payload had an unexpected shape."
    return sum(totals), f"Sum of weekly commit totals across GitHub’s sampled window ({len(totals)} weeks)."


def _heuristic_summary(
    owner: str,
    repo: str,
    repo_payload: dict[str, Any],
    insights: InsightsSummaryResponse,
    lang_top: list[tuple[str, float]],
) -> str:
    name = str(repo_payload.get("full_name") or f"{owner}/{repo}")
    desc = repo_payload.get("description")
    desc_s = desc.strip() if isinstance(desc, str) and desc.strip() else ""
    primary = str(repo_payload.get("language") or "Not specified")
    topics = repo_payload.get("topics")
    topic_s = ""
    if isinstance(topics, list):
        ts = [t for t in topics if isinstance(t, str)]
        if ts:
            topic_s = " Topics include " + ", ".join(f"`{t}`" for t in ts[:8]) + ("." if len(ts) <= 8 else ", ….")

    lang_s = ""
    if lang_top:
        lang_s = f" Primary languages by estimated share: {', '.join(f'{n} ({p}%)' for n, p in lang_top[:5])}."

    trend_en = {"increasing": "attention appears to be growing", "decreasing": "star growth has softened recently", "stable": "interest looks steady"}.get(
        insights.activity_trend,
        "activity is mixed",
    )

    base = (
        f"**{name}** is a public GitHub project"
        f" ({primary} is the top language on the default branch)."
        f" Community signals suggest {trend_en} relative to stored snapshots."
    )
    if desc_s:
        base = f"{base}\n\n{desc_s}{topic_s}{lang_s}"
    else:
        base = f"{base}{topic_s}{lang_s}"
    return base


def _heuristic_contributing(repo_payload: dict[str, Any], html_url: str) -> str:
    branch = repo_payload.get("default_branch")
    b = branch if isinstance(branch, str) and branch else "main"
    lic = repo_payload.get("license")
    spdx = None
    if isinstance(lic, dict):
        spdx = lic.get("spdx_id")
    lic_line = ""
    if isinstance(spdx, str) and spdx and spdx != "NOASSERTION":
        lic_line = f"- License: **{spdx}** (per GitHub metadata).\n"

    return (
        f"{lic_line}"
        f"- Fork the repository and create a branch from `{b}`.\n"
        f"- Open a pull request with a clear description and link related issues.\n"
        f"- Follow existing code style and add tests when the project uses them.\n"
        f"- For questions, use [GitHub Discussions]({html_url}/discussions) if enabled, or open an issue.\n"
    )


def _render_markdown(
    *,
    owner: str,
    repo: str,
    repo_payload: dict[str, Any],
    insights: InsightsSummaryResponse,
    analytics_note: str,
    open_issues: int,
    closed_issues: int,
    open_prs: int,
    closed_prs: int,
    contributors_lines: list[str],
    lang_rows: list[tuple[str, float]],
    commit_note: str,
    commit_total: int | None,
    ai_blurb: str | None,
) -> str:
    full_name = str(repo_payload.get("full_name") or f"{owner}/{repo}")
    html_url = str(repo_payload.get("html_url") or f"https://github.com/{owner}/{repo}")
    homepage = repo_payload.get("homepage")
    home_line = ""
    if isinstance(homepage, str) and homepage.strip():
        home_line = f"\n- Website: {homepage.strip()}"

    stars = int(repo_payload.get("stargazers_count") or 0)
    forks = int(repo_payload.get("forks_count") or 0)
    watchers = int(repo_payload.get("subscribers_count") or 0)

    risk_block = "\n".join(f"- {r}" for r in insights.risk_signals)

    contrib_block = "\n".join(contributors_lines) if contributors_lines else "- *(No contributor list returned.)*"

    lang_block = (
        "\n".join(f"- **{n}**: {p}%" for n, p in lang_rows)
        if lang_rows
        else "- *(No language breakdown returned.)*"
    )

    ai_section = ""
    if ai_blurb and ai_blurb.strip():
        ai_section = f"\n\n### AI-assisted perspective\n\n{ai_blurb.strip()}\n"

    commit_line = (
        f"- Aggregate commits (GitHub weekly sample): **{commit_total}** ({commit_note})"
        if commit_total is not None
        else f"- Commits: {commit_note}"
    )

    md = f"""# {full_name}

> Generated with **GitHub Project Visualizer** — metrics are approximate and depend on GitHub API data and cached snapshots.

## Project summary

{_heuristic_summary(owner, repo, repo_payload, insights, lang_rows)}
{ai_section}

## At a glance

| Metric | Value |
| --- | ---: |
| Stars | {stars} |
| Forks | {forks} |
| Watchers | {watchers} |
| Open issues (search) | {open_issues} |
| Closed issues (search) | {closed_issues} |
| Open PRs (search) | {open_prs} |
| Closed PRs (search) | {closed_prs} |
| Health score (heuristic) | {insights.repo_health_score} / 100 |
| Star trend (snapshots) | {analytics_note} |

**Repository:** [{full_name}]({html_url}){home_line}

## Activity & maintenance

{commit_line}
- Activity trend (from snapshot star delta): **{insights.activity_trend}**
- Sampled closed PRs (last page, max 100): **{insights.closed_prs_sampled}**, merged: **{insights.merged_prs_sampled}**, merge rate: **{int(insights.merge_rate * 100)}%**

### Signals

{risk_block}

## Issues & pull requests

- Issues use GitHub Search (`is:issue`); PRs use `is:pr`. Counts may differ slightly from the repository `open_issues_count` field (which mixes types).
- Open issues: **{open_issues}** · Closed issues: **{closed_issues}**
- Open PRs: **{open_prs}** · Closed PRs: **{closed_prs}**

## Languages

{lang_block}

## Top contributors

{contrib_block}

## Contributing

{_heuristic_contributing(repo_payload, html_url)}

---
*This file is auto-generated. Prefer the upstream project’s own README if one exists.*
"""
    return md


def _markdown_to_html(md: str) -> str:
    body = markdown.markdown(
        md,
        extensions=["tables", "fenced_code", "nl2br", "sane_lists"],
    )
    return (
        "<!DOCTYPE html><html lang=\"en\"><head><meta charset=\"utf-8\"/>"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\"/>"
        "<title>Generated README</title>"
        "<style>body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;"
        "max-width:52rem;margin:2rem auto;padding:0 1rem;line-height:1.55;color:#111;}"
        "table{border-collapse:collapse;width:100%;margin:1rem 0;}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left;}"
        "th{background:#f5f5f5;}code{background:#f0f0f0;padding:0 4px;border-radius:4px;}pre code{background:transparent;padding:0;}"
        "blockquote{border-left:4px solid #ddd;margin-left:0;padding-left:1rem;color:#444;}</style></head><body><article>"
        f"{body}</article></body></html>"
    )


async def _openai_readme_blurb(
    *,
    api_key: str,
    owner: str,
    repo: str,
    facts: str,
) -> str | None:
    prompt = (
        "You are a technical writer. In 2–4 short paragraphs, interpret the following "
        "repository metrics for developers. Be factual, avoid inventing features not implied by the data, "
        "and mention uncertainty where appropriate.\n\n"
        f"Repository: {owner}/{repo}\n\nMetrics and notes:\n{facts}\n"
    )
    url = "https://api.openai.com/v1/chat/completions"
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "Concise, accurate technical documentation assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.4,
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
                log.warning("OpenAI README request failed: %s %s", r.status_code, r.text[:200])
                return None
            data = r.json()
            choice = data.get("choices")
            if not isinstance(choice, list) or not choice:
                return None
            msg = choice[0].get("message", {})
            content = msg.get("content") if isinstance(msg, dict) else None
            return content.strip() if isinstance(content, str) and content.strip() else None
    except Exception as e:
        log.warning("OpenAI README call error: %s", e)
        return None


async def generate_repository_readme(
    owner: str,
    repo: str,
    *,
    github_client: GitHubClient,
    options: GenerateReadmeRequest,
) -> GenerateReadmeResponse:
    repo_payload = await github_client.request_json("GET", f"/repos/{owner}/{repo}")
    if not isinstance(repo_payload, dict):
        raise GitHubApiError(status_code=502, message="Unexpected GitHub repository response shape")

    analytics = await get_repo_analytics(owner, repo)
    stars_delta = int(analytics.stars_delta) if analytics is not None else 0
    forks_delta = int(analytics.forks_delta) if analytics is not None else 0
    if analytics is None:
        analytics_note = "No snapshot history yet — fetch `GET /api/repo/{owner}/{repo}` once to enable star/fork deltas."
    elif analytics.previous is None:
        analytics_note = "Only one snapshot stored; star/fork deltas will populate after the next fetch."
    else:
        analytics_note = f"Stars Δ {stars_delta:+d}, forks Δ {forks_delta:+d} (latest vs previous snapshot)."

    insights = await build_insights_summary(owner, repo, github_client=github_client, stars_delta=stars_delta)

    q_base_issue = f"repo:{owner}/{repo}+is:issue"
    open_issues, closed_issues = await _search_total(github_client, f"{q_base_issue}+is:open"), await _search_total(
        github_client,
        f"{q_base_issue}+is:closed",
    )

    q_base_pr = f"repo:{owner}/{repo}+is:pr"
    open_prs, closed_prs = await _search_total(github_client, f"{q_base_pr}+is:open"), await _search_total(
        github_client,
        f"{q_base_pr}+is:closed",
    )

    langs_raw = await github_client.request_json("GET", f"/repos/{owner}/{repo}/languages")
    languages: dict[str, int] = {}
    if isinstance(langs_raw, dict):
        for k, v in langs_raw.items():
            if isinstance(k, str):
                try:
                    languages[k] = int(v)
                except (TypeError, ValueError):
                    pass
    lang_rows = _pct_language(languages)

    contributors_payload = await github_client.request_json(
        "GET",
        f"/repos/{owner}/{repo}/contributors",
        params={"per_page": 15},
    )
    contributors_lines: list[str] = []
    if isinstance(contributors_payload, list):
        for c in contributors_payload[:10]:
            if not isinstance(c, dict):
                continue
            login = c.get("login")
            n = c.get("contributions")
            if isinstance(login, str) and isinstance(n, int):
                contributors_lines.append(f"- **{login}**: {n} contributions (GitHub count)")

    commit_total: int | None = None
    commit_note = ""
    try:
        activity = await get_commit_activity_cached(
            gh=github_client,
            owner=owner,
            repo=repo,
            token=github_client.access_token,
            response=Response(),
        )
        commit_total, commit_note = _commit_activity_summary(activity)
    except GitHubApiError as e:
        commit_note = e.message or "Unavailable."
    except Exception as e:
        commit_note = str(e)[:200]

    facts = (
        f"health_score={insights.repo_health_score}, activity_trend={insights.activity_trend}, "
        f"merge_rate={insights.merge_rate}, open_issues={open_issues}, closed_issues={closed_issues}, "
        f"open_prs={open_prs}, closed_prs={closed_prs}, stars={repo_payload.get('stargazers_count')}, "
        f"forks={repo_payload.get('forks_count')}, language={repo_payload.get('language')}, "
        f"risk_signals={'; '.join(insights.risk_signals)}"
    )

    ai_blurb: str | None = None
    used_openai = False
    if options.use_openai:
        key = (options.openai_api_key or "").strip() or (OPENAI_API_KEY or "").strip()
        if key:
            ai_blurb = await _openai_readme_blurb(api_key=key, owner=owner, repo=repo, facts=facts)
            used_openai = ai_blurb is not None
        else:
            ai_blurb = None

    md = _render_markdown(
        owner=owner,
        repo=repo,
        repo_payload=repo_payload,
        insights=insights,
        analytics_note=analytics_note,
        open_issues=open_issues,
        closed_issues=closed_issues,
        open_prs=open_prs,
        closed_prs=closed_prs,
        contributors_lines=contributors_lines,
        lang_rows=lang_rows,
        commit_note=commit_note,
        commit_total=commit_total,
        ai_blurb=ai_blurb,
    )

    html_out: str | None = None
    if options.export_format in (ReadmeExportFormat.html, ReadmeExportFormat.both):
        html_out = _markdown_to_html(md)

    return GenerateReadmeResponse(
        markdown=md,
        html=html_out,
        template_id=options.template_id,
        used_openai=used_openai,
    )
