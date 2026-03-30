import { useState } from "react";
import GenerateReadmeModal from "../components/dashboard/GenerateReadmeModal";
import { useOutletContext } from "react-router-dom";
// import { useRepoData } from "../hooks/useRepoData";

import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import ContributorsCard from "../components/dashboard/ContributorsCard";
import PullRequestsCard from "../components/dashboard/PullRequestsCard";
import IssuesCard from "../components/dashboard/IssuesCard";
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
};

export default function Dashboard() {
  const { data, loading, error, refetch } = useOutletContext<ContextType>();

  // const { data, loading, error, refetch } = useRepoData(owner, repo);

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

      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar
          title={activeTab}
          subtitle={`${owner} / ${repo} · ${data?.commitActivity?.range ?? "..."} `}
          range={range}
          onRangeChange={setRange}
          onRefresh={refetch}
          onSearch={handleSearch}
          onGenerateReadme={() => setReadmeModalOpen(true)}
        />

        <GenerateReadmeModal
          open={readmeModalOpen}
          onClose={() => setReadmeModalOpen(false)}
          owner={owner}
          repo={repo}
        />
      <CommitsPerDayChart
        data={loading ? null : (data?.commitsPerDay ?? null)}
      />

      <ContributorsCard data={loading ? null : (data?.contributors ?? null)} />

      <HealthScoreCard data={loading ? null : (data?.healthScore ?? null)} />

      <PullRequestsCard data={loading ? null : (data?.pullRequests ?? null)} />

      <IssuesCard data={loading ? null : (data?.issues ?? null)} />
    </div>
  );
}
