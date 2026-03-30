import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useRepoData } from "../../hooks/useRepoData";

export default function DashboardLayout() {
  const [owner, setOwner] = useState("facebook");
  const [repo, setRepo] = useState("react");
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);

  const { theme, toggle } = useTheme();
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === "/dashboard") return "Overview";
    if (path === "/dashboard/commits") return "Commits";
    if (path === "/dashboard/issues") return "Issues";
    if (path === "/dashboard/pulls") return "Pull requests";
    if (path === "/dashboard/contributors") return "Contributors";
    if (path === "/dashboard/analytics") return "Analytics";
    return "Overview";
  };

  const { data, loading, error, range, setRange, refetch } = useRepoData(
    owner,
    repo,
  );

  const handleSearch = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#080808] overflow-hidden">
      <Sidebar owner={owner} repo={repo} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar
          title={getTitle()}
          subtitle={`${owner} / ${repo} · ${data?.commitActivity?.range ?? "..."}`}
          range={range}
          onRangeChange={setRange}
          onRefresh={refetch}
          onSearch={handleSearch}
          theme={theme}
          onThemeToggle={toggle}
          onGenerateReadme={() => setReadmeModalOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet
            context={{
              owner,
              repo,
              data,
              loading,
              error,
              range,
              setRange,
              refetch,
              readmeModalOpen,
              setReadmeModalOpen,
            }}
          />
        </main>
      </div>
    </div>
  );
}
