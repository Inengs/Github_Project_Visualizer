import type { Issue } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface IssuesCardProps {
  data: Issue[] | null;
}

export default function IssuesCard({ data }: IssuesCardProps) {
  if (!data) return <CardSkeleton />;

  const total = data.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Issues
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
        {total.toLocaleString()} total
      </p>
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] mt-0.5 mb-3.5">
        across all labels
      </p>
      <div className="flex flex-col gap-2.5">
        {data.map((item) => (
          <div key={item.label} className="flex items-center gap-2.5">
            <span className="text-[11px] text-gray-500 dark:text-[#555] w-14 flex-shrink-0">
              {item.label}
            </span>
            <div className="flex-1 h-[2px] bg-gray-200 dark:bg-[#161616] rounded-sm overflow-hidden">
              <div
                className="h-[2px] rounded-sm transition-all duration-700 ease-out"
                style={{ width: `${item.pct}%`, background: item.color }}
              />
            </div>
            <span className="text-[10px] text-gray-400 dark:text-[#333] w-6 text-right flex-shrink-0">
              {item.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-[18px] py-4">
      <Skeleton className="h-2.5 w-12 mb-2" />
      <Skeleton className="h-4 w-20 mb-4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 mb-2.5">
          <Skeleton className="h-2.5 w-14" />
          <Skeleton className="flex-1 h-[2px]" />
          <Skeleton className="h-2.5 w-6" />
        </div>
      ))}
    </div>
  );
}
