import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import GenerateReadmeModal from "../components/dashboard/GenerateReadmeModal";
import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import ContributorsCard from "../components/dashboard/ContributorsCard";
import PullRequestsCard from "../components/dashboard/PullRequestsCard";
import IssuesCard from "../components/dashboard/IssuesCard";
import LanguageCard from "../components/dashboard/LanguageCard";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import type { DashboardLayoutContextValue, HealthScore } from "../types/type";

export default function Dashboard() {
  const {
    owner,
    repo,
    data,
    loading,
    error,
    refetch,
    readmeModalOpen,
    setReadmeModalOpen,
  } = useOutletContext<DashboardLayoutContextValue>();

  // Keeps OpenAI-refreshed insight text on the overview until data reloads.
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  useEffect(() => {
    if (data?.healthScore) setHealthScore(data.healthScore);
  }, [data?.healthScore]);

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  const healthDisplay = loading ? null : (healthScore ?? data?.healthScore ?? null);

  return (
    <div className="flex flex-col gap-4">
      <StatsStrip stats={loading ? null : (data?.stats ?? null)} />

      <CommitActivityChart
        data={loading ? null : (data?.commitActivity ?? null)}
      />

      <CommitsPerDayChart
        data={loading ? null : (data?.commitsPerDay ?? null)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <IssuesCard data={loading ? null : (data?.issues ?? null)} />
        <ContributorsCard
          data={loading ? null : (data?.contributors ?? null)}
        />
        <HealthScoreCard
          owner={owner}
          repo={repo}
          data={healthDisplay}
          onInsightsUpdate={setHealthScore}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <PullRequestsCard
          data={loading ? null : (data?.pullRequests ?? null)}
        />
        <LanguageCard data={loading ? null : (data?.languages ?? null)} />
      </div>

      <GenerateReadmeModal
        open={readmeModalOpen}
        onClose={() => setReadmeModalOpen(false)}
        owner={owner}
        repo={repo}
      />
    </div>
  );
}
