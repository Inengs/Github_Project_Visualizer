import type { Language } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface LanguageCardProps {
  data: Language[] | null;
}

export default function LanguageCard({ data }: LanguageCardProps) {
  if (!data) return <CardSkeleton />;

  if (data.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px]">
        <p className="text-[13px] font-medium text-black dark:text-[#e1e1e1] mb-2">
          Languages
        </p>
        <p className="text-[11px] text-gray-500 dark:text-[#666]">
          No language breakdown returned for this repository.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[13px] font-medium text-black dark:text-[#e1e1e1] mb-4">
        Languages
      </p>

      {/* Stacked bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-[2px] mb-4">
        {data.map((lang) => (
          <div
            key={lang.name}
            className="h-full rounded-full first:rounded-l-full last:rounded-r-full transition-all duration-500"
            style={{
              width: `${lang.percentage}%`,
              background: lang.color,
            }}
            title={`${lang.name} ${lang.percentage}%`}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-col gap-2.5">
        {data.map((lang) => (
          <div key={lang.name} className="flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: lang.color }}
            />
            <span className="text-[12px] text-gray-700 dark:text-[#aaa] flex-1">
              {lang.name}
            </span>
            <span className="text-[12px] text-gray-400 dark:text-[#555]">
              {lang.percentage}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px]">
      <Skeleton className="h-3 w-20 mb-4" />
      <Skeleton className="h-2 w-full rounded-full mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-2 mb-2.5">
          <Skeleton className="w-2 h-2 rounded-full flex-shrink-0" />
          <Skeleton className="flex-1 h-2.5" />
          <Skeleton className="w-8 h-2.5" />
        </div>
      ))}
    </div>
  );
}
