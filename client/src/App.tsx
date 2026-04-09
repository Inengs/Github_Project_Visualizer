import { Routes, Route, Navigate } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Commits from "./pages/Commits";
import Issues from "./pages/Issues";
import PullRequest from "./pages/PullRequest";
import Analytics from "./pages/Analytics";
import Contributors from "./pages/Contributors";
import Compare from "./pages/Compare";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" />} />

      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="commits" element={<Commits />} />
        <Route path="issues" element={<Issues />} />
        <Route path="pulls" element={<PullRequest />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="compare" element={<Compare />} />
        <Route path="contributors" element={<Contributors />} />
      </Route>
    </Routes>
  );
}
