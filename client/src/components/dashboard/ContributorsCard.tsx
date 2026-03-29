import type { Contributor } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface ContributorsCardProps {
  data: Contributor[] | null;
}

export default function ContributorsCard({ data }: ContributorsCardProps) {
  if (!data) return <CardSkeleton />;

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Contributors
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
        3,100
      </p>
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] mt-0.5 mb-3.5">
        all time
      </p>

      <div className="flex flex-col gap-2.5">
        {data.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-2.5 py-0.5 rounded-[5px] transition-all duration-150 
              hover:bg-gray-100 dark:hover:bg-[#111] 
              hover:px-1.5 hover:-mx-1.5 cursor-default"
          >
            <div
              className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium flex-shrink-0 border border-[#1e1e1e]"
              style={{ background: c.bg, color: c.color }}
            >
              {c.initials}
            </div>
            <span className="text-[11px] text-gray-500 dark:text-[#666] flex-1 font-mono truncate">
              {c.name}
            </span>
            <div className="w-14 h-[1px] bg-gray-200 dark:bg-[#161616] rounded-sm overflow-hidden flex-shrink-0">
              <div
                className="h-[1px] transition-all duration-700 ease-out"
                style={{
                  width: `${c.pct}%`,
                  background: "var(--color-contrib-bar)",
                }}
              />
            </div>
            <span className="text-[10px] text-gray-400 dark:text-[#333] w-6 text-right flex-shrink-0">
              {c.commits}
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
      <Skeleton className="h-2.5 w-16 mb-2" />
      <Skeleton className="h-4 w-10 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2.5 mb-2.5">
          <Skeleton className="w-5 h-5 rounded-full" />
          <Skeleton className="flex-1 h-2.5" />
          <Skeleton className="w-14 h-[1px]" />
          <Skeleton className="w-6 h-2.5" />
        </div>
      ))}
    </div>
  );
}
