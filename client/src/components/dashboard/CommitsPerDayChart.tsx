import { useMemo } from "react";
import type { CommitDay } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface CommitsPerDayChartProps {
  data: CommitDay[] | null;
}

const DAYS = ["", "Mon", "", "Wed", "", "Fri", ""];
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export default function CommitsPerDayChart({ data }: CommitsPerDayChartProps) {
  if (!data) return <ChartSkeleton />;

  const total = data.reduce((sum, d) => sum + d.count, 0);
  const max = Math.max(...data.map((d) => d.count), 1);

  const weeks = useMemo(() => {
    // pad start so first day lands on correct weekday column
    const firstDay = new Date(data[0].date).getDay();
    const padded: (CommitDay | null)[] = [
      ...Array(firstDay).fill(null),
      ...data,
    ];
    const result: (CommitDay | null)[][] = [];
    for (let i = 0; i < padded.length; i += 7) {
      result.push(padded.slice(i, i + 7));
    }
    return result;
  }, [data]);

  const monthLabels = useMemo(() => {
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const firstReal = week.find(Boolean);
      if (!firstReal) return;
      const month = new Date(firstReal.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month], weekIndex: wi });
        lastMonth = month;
      }
    });
    return labels;
  }, [weeks]);

  const getColor = (count: number) => {
    if (count === 0) return "bg-gray-100 dark:bg-[#161616]";
    const pct = count / max;
    if (pct <= 0.25) return "bg-[#3d9970]/25 dark:bg-[#3d9970]/25";
    if (pct <= 0.5) return "bg-[#3d9970]/50 dark:bg-[#3d9970]/50";
    if (pct <= 0.75) return "bg-[#3d9970]/75 dark:bg-[#3d9970]/75";
    return "bg-[#3d9970]";
  };

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-4 sm:px-5 pt-5 pb-4">
      <div className="mb-4">
        <p className="text-[11px] text-gray-400 dark:text-[#555] mb-1">
          Commit activity
        </p>
        <p className="text-[18px] sm:text-[20px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
          {total.toLocaleString()} commits
        </p>
        <p className="text-[10px] text-gray-400 dark:text-[#333] mt-1">
          in the last year
        </p>
      </div>

      {/* Wrap the grid in a scrollable container */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex gap-0" style={{ minWidth: "max-content" }}>
          {/* Day labels */}
          <div className="flex flex-col justify-between pr-2 pt-5 gap-[3px]">
            {DAYS.map((day, i) => (
              <span
                key={i}
                className="text-[9px] text-gray-300 dark:text-[#333] h-[13px] flex items-center leading-none"
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grid */}
          <div className="flex flex-col">
            {/* Month labels */}
            <div className="flex mb-1.5">
              {weeks.map((_, wi) => {
                const found = monthLabels.find((m) => m.weekIndex === wi);
                return (
                  <div key={wi} className="w-[13px] mr-[3px] h-[14px]">
                    {found && (
                      <span className="text-[9px] text-gray-400 dark:text-[#444] whitespace-nowrap">
                        {found.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Weeks */}
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, di) => {
                    const cell = week[di] ?? null;
                    return (
                      <div key={di} className="relative group">
                        <div
                          className={`w-[13px] h-[13px] rounded-[2px] ${
                            cell ? getColor(cell.count) : "bg-transparent"
                          }`}
                        />
                        {cell && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-gray-900 dark:bg-[#111] border border-gray-700 dark:border-[#222] rounded text-[10px] text-white dark:text-[#e1e1e1] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            {cell.count} commits · {cell.date}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-1.5 mt-3 justify-end">
        <span className="text-[9px] text-gray-300 dark:text-[#333]">Less</span>
        {[
          "bg-gray-100 dark:bg-[#161616]",
          "bg-[#3d9970]/25",
          "bg-[#3d9970]/50",
          "bg-[#3d9970]/75",
          "bg-[#3d9970]",
        ].map((cls, i) => (
          <div key={i} className={`w-[10px] h-[10px] rounded-[2px] ${cls}`} />
        ))}
        <span className="text-[9px] text-gray-300 dark:text-[#333]">More</span>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-5 pt-5 pb-4">
      <Skeleton className="h-3 w-28 mb-2" />
      <Skeleton className="h-5 w-36 mb-6" />
      <Skeleton className="h-[112px] w-full rounded" />
    </div>
  );
}
