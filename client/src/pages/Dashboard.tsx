import { useState } from "react";
import GenerateReadmeModal from "../components/dashboard/GenerateReadmeModal";
import { useRepoData } from "../hooks/useRepoData";
import Sidebar from "../components/layout/Sidebar";
import NavBar from "../components/layout/NavBar";
import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";
import HealthScoreCard from "../components/dashboard/HealthScoreCard";
import ContributorsCard from "../components/dashboard/ContributorsCard";

export default function Dashboard() {
  const [owner, setOwner] = useState("zikmang");
  const [repo, setRepo] = useState("Git Visualizer");
  const [activeTab, setActiveTab] = useState("Overview");
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);
  const { data, loading, error, range, setRange, refetch } = useRepoData(
    owner,
    repo,
  );

  const handleSearch = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
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
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      <Sidebar
        owner={owner}
        repo={repo}
        activeTab={activeTab}
        onTabChange={setActiveTab}
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

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          <StatsStrip stats={loading ? null : (data?.stats ?? null)} />

          <CommitActivityChart
            data={loading ? null : (data?.commitActivity ?? null)}
          />

          <CommitsPerDayChart
            data={loading ? null : (data?.commitsPerDay ?? null)}
          />
          <ContributorsCard
            data={loading ? null : (data?.contributors ?? null)}
          />

          <HealthScoreCard
            data={loading ? null : (data?.healthScore ?? null)}
          />
        </main>
      </div>
    </div>
  );
}
