import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import NavBar from "./NavBar";
import { useState } from "react";

export default function DashboardLayout() {
  const [owner, setOwner] = useState("zikmang");
  const [repo, setRepo] = useState("Git Visualizer");

  const handleSearch = (newOwner: string, newRepo: string) => {
    setOwner(newOwner);
    setRepo(newRepo);
  };

  return (
    <div className="flex h-screen bg-[#080808] overflow-hidden">
      <Sidebar owner={owner} repo={repo} />

      <div className="flex flex-col flex-1 overflow-hidden">
        <NavBar
          title="Dashboard"
          subtitle={`${owner} / ${repo}`}
          range="30d"
          onRangeChange={() => {}}
          onRefresh={() => {}}
          onSearch={handleSearch}
        />

        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet context={{ owner, repo }} />
        </main>
      </div>
    </div>
  );
}
