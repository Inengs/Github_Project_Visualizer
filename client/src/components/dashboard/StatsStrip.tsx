import {
  TrendingUp,
  CircleDot,
  GitPullRequest,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { Stats } from "../../types/type";
import Skeleton from "../ui/Skeleton";

interface StatsCard {
  key: string;
  label: string;
  value: string;
  delta: string;
  deltaType: "up" | "down" | "neutral";
  icon: LucideIcon;
}

interface StatsStripProps {
  stats: Stats | null;
}

export default function StatsStrip({ stats }: StatsStripProps) {
  if (!stats) return <StatStripSkeleton />;

  const cards: StatsCard[] = [
    {
      key: "commits",
      label: "Total commits",
      value: stats.total_commits.toLocaleString(),
      delta: stats.commits_delta,
      deltaType: "up",
      icon: TrendingUp,
    },
    {
      key: "issues",
      label: "Open issues",
      value: stats.open_issues.toLocaleString(),
      delta: stats.issues_delta,
      deltaType: "down",
      icon: CircleDot,
    },
    {
      key: "pullRequests",
      label: "Pull requests",
      value: stats.pull_requests.toLocaleString(),
      delta: stats.prs_delta,
      deltaType: "up",
      icon: GitPullRequest,
    },
    {
      key: "contributors",
      label: "Contributors",
      value: stats.contributors.toLocaleString(),
      delta: stats.contributors_delta,
      deltaType: "neutral",
      icon: Users,
    },
  ];

  const deltaColor: Record<StatsCard["deltaType"], string> = {
    up: "text-[#3d9970]",
    down: "text-[#7a3030]",
    neutral: "text-[#333]",
  };
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(({ key, label, value, delta, deltaType, icon: Icon }) => (
        <div
          key={key}
          className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-[18px] py-4 hover:border-gray-300 dark:hover:border-[#222] transition-colors duration-200"
        >
          <div className="flex items-start justify-between mb-2.5">
            <span className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em]">
              {label}
            </span>
            <div className="w-6 h-6 bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-[5px] flex items-center justify-center">
              <Icon
                size={11}
                className="text-gray-300 dark:text-[#333]"
                strokeWidth={1.5}
              />
            </div>
          </div>

          <p className="text-[24px] font-medium text-black dark:text-[#e1e1e1] leading-none tracking-[-0.03em]">
            {value}
          </p>

          <p className={`text-[10px] mt-1.5 ${deltaColor[deltaType]}`}>
            {deltaType !== "neutral" && "↑ "}
            {delta}
          </p>
        </div>
      ))}
    </div>
  );
}

function StatStripSkeleton() {
  return (
    <div className="grid grid-cols-4 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg px-[18px] py-4"
        >
          <Skeleton className="h-2.5 w-20 mb-3" />
          <Skeleton className="h-6 w-16 mb-2" />
          <Skeleton className="h-2 w-24" />
        </div>
      ))}
    </div>
  );
}
