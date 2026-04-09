"""
Side-by-side comparison for 2–3 repos: reuses `build_insights_summary` per row in parallel.

Snapshot deltas (`stars_delta`) come from DB; if a repo was never snapshotted, analytics
returns None and we pass 0 so insights still run with live GitHub data only.
"""
from __future__ import annotations

import asyncio

from app.schemas.compare import RepoCompareRow, RepoRef, CompareReposResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.insights import build_insights_summary
from app.services.repository_analytics import get_repo_analytics


async def _one_row(
    ref: RepoRef,
    gh: GitHubClient,
) -> RepoCompareRow:
    """Build one table row: analytics snapshot + full insights + repo metadata for display."""
    owner, name = ref.owner, ref.repo
    analytics = await get_repo_analytics(owner, name)
    stars_delta = int(analytics.stars_delta) if analytics is not None else 0
    forks_delta = int(analytics.forks_delta) if analytics is not None else 0

    summary = await build_insights_summary(
        owner,
        name,
        github_client=gh,
        stars_delta=stars_delta,
        use_openai=False,
    )

    repo_payload = await gh.request_json("GET", f"/repos/{owner}/{name}")
    if not isinstance(repo_payload, dict):
        raise GitHubApiError(status_code=502, message="Unexpected GitHub repository response shape")

    full_name = str(repo_payload.get("full_name") or f"{owner}/{name}")
    stars = int(repo_payload.get("stargazers_count") or 0)
    forks = int(repo_payload.get("forks_count") or 0)
    lang = repo_payload.get("language")
    language = str(lang) if isinstance(lang, str) else None
    oic = int(repo_payload.get("open_issues_count") or 0)

    preview = summary.high_impact_insights[0] if summary.high_impact_insights else ""

    return RepoCompareRow(
        owner=owner,
        repo=name,
        full_name=full_name,
        stars=stars,
        forks=forks,
        language=language,
        open_issues_count=oic,
        repo_health_score=summary.repo_health_score,
        activity_trend=summary.activity_trend,
        merge_rate=summary.merge_rate,
        stars_delta_snapshot=stars_delta,
        forks_delta_snapshot=forks_delta,
        high_impact_preview=preview,
    )


async def compare_repositories(refs: list[RepoRef], *, github_client: GitHubClient) -> CompareReposResponse:
    """Fetch all comparison rows concurrently (fail-fast if any GitHub call errors)."""
    rows = await asyncio.gather(*[_one_row(r, github_client) for r in refs])
    return CompareReposResponse(rows=list(rows))
