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
import type { RepoData, Range } from "../types/type";

type ContextType = {
  owner: string;
  repo: string;
  data: RepoData | null;
  loading: boolean;
  error: string | null;
  range: Range;
  setRange: (r: Range) => void;
  refetch: () => void;
  readmeModalOpen: boolean;
  setReadmeModalOpen: (open: boolean) => void;
};

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
  } = useOutletContext<ContextType>();
  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-[#555] text-sm mb-2">Failed to load data</p>
          <p className="text-[#333] text-xs">{error}</p>
          <button
            onClick={refetch}
            className="mt-4 px-4 py-2 border border-[#222] rounded-md text-[12px] text-[#666] hover:text-[#aaa] transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

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
        <HealthScoreCard data={loading ? null : (data?.healthScore ?? null)} />
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
