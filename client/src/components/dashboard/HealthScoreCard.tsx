import type { HealthScore } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface HealthScoreCardProps {
  data: HealthScore | null;
}

export default function HealthScoreCard({ data }: HealthScoreCardProps) {
  if (!data) return <CardSkeleton />;

  const circ = 2 * Math.PI * 20;
  const fill = (data.score / 100) * circ;

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Health score
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
        {data.score} / 100
      </p>
      <p className="text-[10px] text-[#3d9970] mt-0.5 mb-3.5">{data.label}</p>

      <div className="flex items-center gap-4">
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          className="flex-shrink-0"
        >
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="#e5e7eb"
            className="dark:[stroke:#161616]"
            strokeWidth="4"
          />
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="#111111"
            className="dark:[stroke:#e1e1e1]"
            strokeWidth="4"
            strokeDasharray={`${fill.toFixed(1)} ${(circ - fill).toFixed(1)}`}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{
              transition:
                "stroke-dasharray 0.9s 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>

        <div className="flex-1 flex flex-col gap-2">
          {data.breakdown.map((row) => (
            <div key={row.label} className="flex items-center gap-2">
              <span className="text-[10px] text-gray-400 dark:text-[#444] w-[52px] flex-shrink-0">
                {row.label}
              </span>
              <div className="flex-1 h-[2px] bg-gray-200 dark:bg-[#161616] rounded-sm overflow-hidden">
                <div
                  className="h-[2px] rounded-sm transition-all duration-700 ease-out"
                  style={{ width: `${row.value}%`, background: row.color }}
                />
              </div>
              <span className="text-[10px] text-gray-300 dark:text-[#2e2e2e] w-5 text-right flex-shrink-0">
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-[18px] py-4">
      <Skeleton className="h-2.5 w-20 mb-2" />
      <Skeleton className="h-4 w-16 mb-4" />
      <div className="flex items-center gap-4">
        <Skeleton className="w-[52px] h-[52px] rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-2 w-[52px]" />
              <Skeleton className="flex-1 h-[2px]" />
              <Skeleton className="h-2 w-5" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
