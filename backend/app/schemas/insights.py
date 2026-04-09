from __future__ import annotations

from pydantic import BaseModel, Field


class InsightsEnhanceRequest(BaseModel):
    """Optional OpenAI narrative for high-impact insight lines. Heuristic is the default."""

    use_openai: bool = Field(
        default=False,
        description="When true, attempts OpenAI-generated insight bullets when an API key is available.",
    )
    openai_api_key: str | None = Field(
        default=None,
        description="Optional user key; overrides server OPENAI_API_KEY for this request.",
    )


class InsightsSummaryResponse(BaseModel):
    """Public shape for GET/POST /analytics/repo/.../insights."""

    repo_health_score: int
    activity_trend: str
    risk_signals: list[str]
    closed_prs_sampled: int = 0
    merged_prs_sampled: int = 0
    merge_rate: float = 0.0
    high_impact_insights: list[str] = Field(
        default_factory=list,
        description="Short, actionable summary lines (heuristic or OpenAI).",
    )
    used_openai: bool = False
