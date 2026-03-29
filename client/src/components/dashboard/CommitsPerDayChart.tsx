import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";
import type { CommitDay } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface CommitsPerDayChartProps {
  data: CommitDay[] | null;
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-[#111] border border-gray-200 dark:border-[#222] rounded-md px-3 py-2 shadow-sm">
      <p className="text-[10px] text-gray-400 dark:text-[#555] mb-0.5">
        {label}
      </p>
      <p className="text-[13px] font-medium text-black dark:text-[#e1e1e1]">
        {payload[0].value} commits
      </p>
    </div>
  );
}

export default function CommitsPerDayChart({ data }: CommitsPerDayChartProps) {
  if (!data) return <BarSkeleton />;

  // const peakColor = theme === "dark" ? "#e1e1e1" : "#111111";
  // const defaultColor = theme === "dark" ? "#252525" : "#d1d5db";

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const maxDay = data.reduce(
    (max, d) => (d.count > max.count ? d : max),
    data[0],
  );

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-4 sm:px-5 pt-5 pb-4">
      <div className="mb-4">
        <p className="text-[11px] text-gray-400 dark:text-[#555] mb-1">
          Commits per day
        </p>
        <p className="text-[18px] sm:text-[20px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
          {total} commits
        </p>
        <p className="text-[10px] text-gray-400 dark:text-[#333] mt-1">
          Peak: {maxDay.day} · {maxDay.count} commits
        </p>
      </div>

      <ResponsiveContainer width="100%" height={100}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 0, bottom: 0, left: 0 }}
          barCategoryGap="28%"
        >
          <CartesianGrid vertical={false} stroke="var(--color-border)" />
          <XAxis
            tick={{
              fontSize: 10,
              fill: "var(--color-text-dim)",
              fontFamily: "inherit",
            }}
          />

          <YAxis hide />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: "#161616" }} />
          <Bar
            dataKey="count"
            radius={[2, 2, 0, 0]}
            animationDuration={700}
            animationEasing="ease-out"
          >
            {data.map((entry) => (
              <Cell
                key={entry.day}
                fill={
                  entry.day === maxDay.day
                    ? "var(--color-bar-peak)"
                    : "var(--color-bar-default)"
                }
                opacity={entry.day === maxDay.day ? 1 : 0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function BarSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-[18px] py-4">
      <Skeleton className="h-3 w-28 mb-2" />
      <Skeleton className="h-5 w-24 mb-6" />
      <Skeleton className="h-[100px] w-full" />
    </div>
  );
}
