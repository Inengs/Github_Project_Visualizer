import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContextValue } from "../types/type";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import IssuesPage from "./IssuesPage";

export default function Issues() {
  const { data, loading, error, refetch } =
    useOutletContext<DashboardLayoutContextValue>();

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  return <IssuesPage issues={data?.issueList ?? null} loading={loading} />;
}
