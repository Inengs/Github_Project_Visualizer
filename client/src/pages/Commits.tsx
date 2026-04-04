import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContextValue } from "../types/type";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import CommitsPage from "./CommitsPage";

export default function Commits() {
  const { data, loading, error, refetch } =
    useOutletContext<DashboardLayoutContextValue>();

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  return (
    <CommitsPage commits={data?.commitList ?? null} loading={loading} />
  );
}
