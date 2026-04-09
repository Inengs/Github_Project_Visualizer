"""
Heuristic “next week” commit projection from GitHub’s weekly `commit_activity` series.

Not ML: compares recent vs prior 4-week means and blends the last observed week with
the recent average for a simple point forecast.
"""
from __future__ import annotations

from starlette.responses import Response

from app.schemas.prediction import ContributionPredictionResponse
from app.services.github import GitHubApiError, GitHubClient
from app.services.github_cache import get_commit_activity_cached
from app.services.insights import _weekly_totals_from_activity


def _mean(xs: list[float]) -> float:
    return sum(xs) / len(xs) if xs else 0.0


async def predict_contribution_trend(
    owner: str,
    repo: str,
    *,
    github_client: GitHubClient,
) -> ContributionPredictionResponse:
    """Return trend label + averages + one-step projection; degrades gracefully on short history or API errors."""
    totals: list[int] = []
    note = "Projection uses GitHub’s last-year weekly commit totals; short windows can be noisy."
    try:
        activity = await get_commit_activity_cached(
            gh=github_client,
            owner=owner,
            repo=repo,
            token=github_client.access_token,
            response=Response(),
        )
        totals = _weekly_totals_from_activity(activity)
    except GitHubApiError as e:
        return ContributionPredictionResponse(
            trend_direction="stable",
            recent_weekly_avg=0.0,
            prior_weekly_avg=0.0,
            predicted_next_week_commits=0.0,
            method_note=f"Could not load commit activity: {e.message or 'unknown error'}.",
        )

    if len(totals) < 8:
        return ContributionPredictionResponse(
            trend_direction="stable",
            recent_weekly_avg=_mean([float(t) for t in totals]) if totals else 0.0,
            prior_weekly_avg=0.0,
            predicted_next_week_commits=float(totals[-1]) if totals else 0.0,
            method_note="Not enough weekly history for a split trend; showing last week as a rough anchor. " + note,
        )

    recent = [float(x) for x in totals[-4:]]
    prior = [float(x) for x in totals[-8:-4]]
    ra = _mean(recent)
    pa = _mean(prior)

    if pa <= 0.01:
        direction = "growing" if ra > 0 else "stable"
    elif ra > pa * 1.15:
        direction = "growing"
    elif ra < pa * 0.85:
        direction = "declining"
    else:
        direction = "stable"

    # Simple damped extrapolation: blend last week with recent average
    last = float(totals[-1])
    predicted = max(0.0, round(0.5 * last + 0.5 * ra, 1))

    return ContributionPredictionResponse(
        trend_direction=direction,
        recent_weekly_avg=round(ra, 2),
        prior_weekly_avg=round(pa, 2),
        predicted_next_week_commits=predicted,
        method_note=note,
    )
