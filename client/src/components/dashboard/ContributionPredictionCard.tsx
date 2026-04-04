/** Displays heuristic weekly-commit trend and a simple next-week projection from the API. */
import type { ContributionPrediction } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface ContributionPredictionCardProps {
  data: ContributionPrediction | null;
}

export default function ContributionPredictionCard({
  data,
}: ContributionPredictionCardProps) {
  if (!data) return <CardSkeleton />;

  const dir = data.trend_direction.toLowerCase();
  const dirColor =
    dir === "growing"
      ? "text-[#3d9970]"
      : dir === "declining"
        ? "text-amber-600 dark:text-amber-500"
        : "text-gray-500 dark:text-[#888]";

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Contribution predictor
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
        ~{data.predicted_next_week_commits} commits next week
      </p>
      <p className={`text-[10px] mt-0.5 mb-3 capitalize ${dirColor}`}>
        Trend: {data.trend_direction}
      </p>
      <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-500 dark:text-[#666]">
        <div>
          <span className="text-gray-400 dark:text-[#444] block text-[10px] uppercase tracking-wide mb-0.5">
            Last 4 wks avg
          </span>
          <span className="text-black dark:text-[#ccc] font-medium">
            {data.recent_weekly_avg.toFixed(1)} / week
          </span>
        </div>
        <div>
          <span className="text-gray-400 dark:text-[#444] block text-[10px] uppercase tracking-wide mb-0.5">
            Prior 4 wks avg
          </span>
          <span className="text-black dark:text-[#ccc] font-medium">
            {data.prior_weekly_avg.toFixed(1)} / week
          </span>
        </div>
      </div>
      {data.method_note ? (
        <p className="text-[10px] text-gray-400 dark:text-[#444] mt-3 leading-relaxed">
          {data.method_note}
        </p>
      ) : null}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px]">
      <Skeleton className="h-2.5 w-36 mb-2" />
      <Skeleton className="h-4 w-48 mb-4" />
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    </div>
  );
}
