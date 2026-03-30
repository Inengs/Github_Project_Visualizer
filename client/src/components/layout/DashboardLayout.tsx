import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useState } from "react";
import { useTheme } from "../../hooks/useTheme";
import { useRepoData } from "../../hooks/useRepoData";

export default function DashboardLayout() {
  const [owner, setOwner] = useState("zikmang");
  const [repo, setRepo] = useState("Git Visualizer");

  const { theme, toggle } = useTheme();

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
          title="Dashboard"
          subtitle={`${owner} / ${repo}`}
          range={range}
          onRangeChange={setRange}
          onRefresh={refetch}
          onSearch={handleSearch}
          theme={theme}
          onThemeToggle={toggle}
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
            }}
          />
        </main>
      </div>
    </div>
  );
}
