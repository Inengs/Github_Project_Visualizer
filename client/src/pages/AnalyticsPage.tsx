import type { RepoData } from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";

interface AnalyticsPageProps {
  data: RepoData | null;
  loading: boolean;
}

export default function AnalyticsPage({ data, loading }: AnalyticsPageProps) {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Analytics"
        description="A chart-first view of velocity, weekly rhythm, and composite health—useful when you want signal without scanning lists."
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
          data={loading ? null : (data?.healthScore ?? null)}
        />
      </div>
    </div>
  );
}
