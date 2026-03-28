import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { CommitActivity } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface CommitActivityChartProps {
  data: CommitActivity | null;
}

interface ChartPoint {
  label: number;
  commits: number;
}

function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111] border border-[#222] rounded-md px-3 py-2">
      <p className="text-[13px] font-medium text-[#e1e1e1]">
        {payload[0].value} commits
      </p>
    </div>
  );
}

export default function CommitActivityChart({
  data,
}: CommitActivityChartProps) {
  if (!data) return <ChartSkeleton />;

  const chartData: ChartPoint[] = data.points.map((value, i) => ({
    label: i,
    commits: value,
  }));

  const dateIndices = data.dates.map((_, i) =>
    Math.round((i / (data.dates.length - 1)) * (data.points.length - 1)),
  );

  const tickFormatter = (index: number): string => {
    const pos = dateIndices.indexOf(index);
    return pos !== -1 ? data.dates[pos] : "";
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#161616] rounded-lg px-4 sm:px-5 pt-5 pb-4">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-[11px] text-[#555] mb-1">Commit activity</p>
          <p className="text-[18px] sm:text-[20px] font-medium text-[#e1e1e1] tracking-[-0.02em]">
            {data.total.toLocaleString()} commits
          </p>
          <p className="text-[10px] text-[#3d9970] mt-1">
            ↑ {data.change} from last period
          </p>
        </div>
        <span className="text-[10px] text-[#2a2a2a] mt-1 hidden sm:block">
          {data.range}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={130}>
        <AreaChart
          data={chartData}
          margin={{ top: 8, right: 2, bottom: 0, left: 0 }}
        >
          <defs>
            <linearGradient id="commitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#d0d0d0" stopOpacity={0.1} />
              <stop offset="70%" stopColor="#d0d0d0" stopOpacity={0.03} />
              <stop offset="100%" stopColor="#d0d0d0" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid horizontal vertical={false} stroke="#141414" />

          <XAxis
            dataKey="label"
            tickFormatter={tickFormatter}
            tick={{ fontSize: 10, fill: "#282828", fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            interval={0}
          />

          <YAxis
            tick={{ fontSize: 9, fill: "#242424", fontFamily: "inherit" }}
            axisLine={false}
            tickLine={false}
            width={24}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: "#2a2a2a", strokeWidth: 1 }}
          />

          <Area
            type="monotone"
            dataKey="commits"
            stroke="#aaaaaa"
            strokeWidth={1.5}
            fill="url(#commitGradient)"
            dot={false}
            activeDot={{ r: 3, fill: "#e1e1e1", strokeWidth: 0 }}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-[#0d0d0d] border border-[#161616] rounded-lg px-5 pt-5 pb-4">
      <Skeleton className="h-3 w-28 mb-2" />
      <Skeleton className="h-5 w-36 mb-1" />
      <Skeleton className="h-2.5 w-24 mt-1 mb-6" />
      <Skeleton className="h-[130px] w-full" />
    </div>
  );
}
