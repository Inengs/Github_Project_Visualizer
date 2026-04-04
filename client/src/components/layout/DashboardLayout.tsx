import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { useSidebar } from "../../hooks/useSidebar";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useTheme } from "../../hooks/useTheme";
import { useRepoData } from "../../hooks/useRepoData";
import type { DashboardLayoutContextValue } from "../../types/type";

export default function DashboardLayout() {
  const [owner, setOwner] = useState("Inegs");
  const [repo, setRepo] = useState("Github_Project_Visualizer");
  const [readmeModalOpen, setReadmeModalOpen] = useState(false);

  const { theme, toggle } = useTheme();
  const {
    open: sidebarOpen,
    toggle: toggleSidebar,
    close: closeSidebar,
  } = useSidebar();
  const { data, loading, error, range, setRange, refetch } = useRepoData(
    owner,
    repo,
  );

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

  const handleSearch = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
    closeSidebar();
  };

  return (
    <div className="flex h-screen bg-white dark:bg-[#080808] overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
        fixed inset-y-0 left-0 z-30 lg:static lg:z-auto
        transition-transform duration-200 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <Sidebar owner={owner} repo={repo} onNavigate={closeSidebar} />
      </div>

      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
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
          onMenuToggle={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 sm:py-6">
          <Outlet
            context={
              {
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
              } satisfies DashboardLayoutContextValue
            }
          />
        </main>
      </div>
    </div>
  );
}
