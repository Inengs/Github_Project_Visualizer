import { Avatar, AvatarImage, AvatarFallback } from "../ui/Avatar";
import type { Contributor } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface ContributorsCardProps {
  data: Contributor[] | null;
}

export default function ContributorsCard({ data }: ContributorsCardProps) {
  if (!data) return <CardSkeleton />;

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[13px] font-medium text-black dark:text-[#e1e1e1] mb-4">
        Contributors
      </p>

      <p className="text-[28px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.03em] leading-none mb-4">
        {data.length}
      </p>

      <div className="flex flex-col gap-3">
        {data.map((c) => (
          <div
            key={c.name}
            className="flex items-center gap-3 py-0.5 rounded-[5px] transition-all duration-150 hover:bg-gray-100 dark:hover:bg-[#111] hover:px-2 hover:-mx-2 cursor-default"
          >
            <Avatar className="size-7 flex-shrink-0">
              <AvatarImage
                src={`https://github.com/${c.name}.png`}
                alt={c.name}
              />
              <AvatarFallback>{c.initials}</AvatarFallback>
            </Avatar>

            <span className="text-[12px] text-gray-700 dark:text-[#aaa] flex-1 truncate">
              {c.name}
            </span>

            <span className="text-[12px] text-gray-400 dark:text-[#555] flex-shrink-0">
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
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px]">
      <Skeleton className="h-3 w-24 mb-4" />
      <Skeleton className="h-7 w-8 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 mb-3">
          <Skeleton className="size-7 rounded-full flex-shrink-0" />
          <Skeleton className="flex-1 h-3" />
          <Skeleton className="w-8 h-3" />
        </div>
      ))}
    </div>
  );
}
