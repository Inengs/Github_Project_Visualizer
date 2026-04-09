from __future__ import annotations

from pydantic import BaseModel, Field


class ContributionPredictionResponse(BaseModel):
    """Response for GET /analytics/repo/.../prediction — heuristic only, no LLM."""

    trend_direction: str = Field(
        description="One of: growing, stable, declining (based on recent vs prior weeks).",
    )
    recent_weekly_avg: float = Field(description="Mean commits per week over the last 4 sampled weeks.")
    prior_weekly_avg: float = Field(description="Mean commits per week over the 4 weeks before that.")
    predicted_next_week_commits: float = Field(
        description="Simple projection for the next week (rounded in display).",
    )
    method_note: str = Field(
        default="",
        description="Human-readable caveat about data limits.",
    )
