import type { PullRequest, PRStatus } from "../../types/type";
import Skeleton from "../ui/Skeleton";

const STATUS_COLOR: Record<PRStatus, string> = {
  open: "bg-[#3d9970]",
  merged: "bg-[#6e5fad]",
  closed: "bg-[#2a2a2a]",
};

interface PullRequestsCardProps {
  data: PullRequest[] | null;
}

export default function PullRequestsCard({ data }: PullRequestsCardProps) {
  if (!data) return <CardSkeleton />;

  const openCount = data.filter((pr) => pr.status === "open").length;

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Pull requests
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em] mb-3.5">
        {openCount} open
      </p>

      <div className="flex flex-col">
        {data.map((pr, i) => (
          <div
            key={pr.id}
            className={`flex items-start gap-2.5 py-2.5 transition-all duration-150
            hover:bg-gray-100 dark:hover:bg-[#111]
            hover:px-1.5 hover:-mx-1.5 hover:rounded-[5px] cursor-default
            ${i < data.length - 1 ? "border-b border-gray-100 dark:border-[#111]" : ""}`}
          >
            <span
              className={`w-[5px] h-[5px] rounded-full mt-[5px] flex-shrink-0 ${STATUS_COLOR[pr.status]}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-[11px] text-gray-500 dark:text-[#777] leading-[1.45] truncate">
                {pr.title}
              </p>
              <p className="text-[10px] text-gray-400 dark:text-[#2e2e2e] mt-0.5">
                {pr.author} · {pr.status} · {pr.time}
              </p>
            </div>
            <span className="text-[10px] text-gray-300 dark:text-[#2a2a2a] font-mono flex-shrink-0">
              {pr.id}
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
      <Skeleton className="h-2.5 w-20 mb-2" />
      <Skeleton className="h-4 w-12 mb-4" />
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-start gap-2.5 py-2.5">
          <Skeleton className="w-[5px] h-[5px] rounded-full mt-[5px]" />
          <div className="flex-1">
            <Skeleton className="h-2.5 w-48 mb-1.5" />
            <Skeleton className="h-2 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}
