import { useState } from "react";
import { useRepoData } from "../hooks/useRepoData";
import Sidebar from "../components/layout/Sidebar";
import NavBar from "../components/layout/NavBar";
import StatsStrip from "../components/dashboard/StatsStrip";
import CommitActivityChart from "../components/dashboard/CommitActivityChart";
import CommitsPerDayChart from "../components/dashboard/CommitsPerDayChart";

const OWNER = "zikmang";
const REPO = "Git Visualizer";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const { data, loading, error, range, setRange, refetch } = useRepoData(
    OWNER,
    REPO,
  );

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
        owner={OWNER}
        repo={REPO}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar
          title={activeTab}
          subtitle={`${OWNER} / ${REPO} · ${data?.commitActivity?.range ?? "..."} `}
          range={range}
          onRangeChange={setRange}
          onRefresh={refetch}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          <StatsStrip stats={loading ? null : (data?.stats ?? null)} />

          <CommitActivityChart
            data={loading ? null : (data?.commitActivity ?? null)}
          />

          <CommitsPerDayChart
            data={loading ? null : (data?.commitsPerDay ?? null)}
          />
        </main>
      </div>
    </div>
  );
}
