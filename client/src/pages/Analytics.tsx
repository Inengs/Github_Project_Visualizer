import { useOutletContext } from "react-router-dom";
import type { DashboardLayoutContextValue } from "../types/type";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import AnalyticsPage from "./AnalyticsPage";

export default function Analytics() {
  const { data, loading, error, refetch } =
    useOutletContext<DashboardLayoutContextValue>();

  if (error) {
    return <DataErrorPanel message={error} onRetry={refetch} />;
  }

  return <AnalyticsPage data={data} loading={loading} />;
}
