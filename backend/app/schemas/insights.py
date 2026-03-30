from __future__ import annotations

from pydantic import BaseModel


class InsightsSummaryResponse(BaseModel):
    repo_health_score: int
    activity_trend: str
    risk_signals: list[str]
    # Derived from the latest closed PR page (up to 100); useful for docs/export.
    closed_prs_sampled: int = 0
    merged_prs_sampled: int = 0
    merge_rate: float = 0.0

