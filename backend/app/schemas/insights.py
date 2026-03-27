from __future__ import annotations

from pydantic import BaseModel


class InsightsSummaryResponse(BaseModel):
    repo_health_score: int
    activity_trend: str
    risk_signals: list[str]

