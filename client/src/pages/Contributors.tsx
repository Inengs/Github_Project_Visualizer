import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContextValue } from "../types/type";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import ContributorsPage from "./ContributorsPage";

export default function Contributors() {
  const { data, loading, error, refetch } =
    useOutletContext<DashboardLayoutContextValue>();

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  return (
    <ContributorsPage
      contributors={data?.contributors ?? null}
      totalCount={data?.stats.contributors ?? null}
      loading={loading}
    />
  );
}
