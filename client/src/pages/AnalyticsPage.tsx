import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import type {
  DashboardLayoutContextValue,
  HealthScore,
  RepoData,
} from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import ContributionPredictionCard from "../components/dashboard/ContributionPredictionCard";
import LanguageCard from "../components/dashboard/LanguageCard";

interface AnalyticsPageProps {
  data: RepoData | null;
  loading: boolean;
}

export default function AnalyticsPage({ data, loading }: AnalyticsPageProps) {
  const { owner, repo } = useOutletContext<DashboardLayoutContextValue>();
  // Local copy so OpenAI-refreshed insights persist until the next full dashboard refetch.
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);

  useEffect(() => {
    if (data?.healthScore) setHealthScore(data.healthScore);
  }, [data?.healthScore]);

  const healthDisplay = loading ? null : (healthScore ?? data?.healthScore ?? null);

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="A chart-first view of velocity, weekly rhythm, composite health, heuristic insight lines, and a simple contribution forecast from GitHub weekly totals."
      />

      <StatsStrip stats={loading ? null : (data?.stats ?? null)} />

      <CommitActivityChart
        data={loading ? null : (data?.commitActivity ?? null)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CommitsPerDayChart
          data={loading ? null : (data?.commitsPerDay ?? null)}
        />
        <HealthScoreCard
          owner={owner}
          repo={repo}
          data={healthDisplay}
          onInsightsUpdate={setHealthScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ContributionPredictionCard
          data={loading ? null : (data?.contributionPrediction ?? null)}
        />
        <LanguageCard data={loading ? null : (data?.languages ?? null)} />
      </div>
    </div>
  );
}
