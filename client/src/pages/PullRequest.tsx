import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContextValue } from "../types/type";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import PullRequestsPage from "./PullRequestsPage";

export default function PullRequest() {
  const { data, loading, error, refetch } =
    useOutletContext<DashboardLayoutContextValue>();

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  return (
    <PullRequestsPage
      pullRequests={data?.pullRequests ?? null}
      loading={loading}
    />
  );
}
