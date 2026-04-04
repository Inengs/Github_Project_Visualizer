import { useMemo, useState } from "react";
import { Users, Trophy } from "lucide-react";
import type { Contributor } from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import Skeleton from "../components/ui/Skeleton";

type SortKey = "commits" | "name";

interface ContributorsPageProps {
  contributors: Contributor[] | null;
  totalCount: number | null;
  loading: boolean;
}

export default function ContributorsPage({
  contributors,
  totalCount,
  loading,
}: ContributorsPageProps) {
  const [sort, setSort] = useState<SortKey>("commits");

  const maxCommits = useMemo(() => {
    if (!contributors?.length) return 1;
    return Math.max(...contributors.map((c) => c.commits), 1);
  }, [contributors]);

  const sorted = useMemo(() => {
    if (!contributors) return [];
    const copy = [...contributors];
    if (sort === "commits") {
      copy.sort((a, b) => b.commits - a.commits);
    } else {
      copy.sort((a, b) => a.name.localeCompare(b.name));
    }
    return copy;
  }, [contributors, sort]);

  if (loading && !contributors) {
    return (
      <div>
        <PageHeader
          title="Contributors"
          description="See who ships the most changes in this dataset and how their volume compares to the top contributor."
        />
        <GridSkeleton />
      </div>
    );
  }

  if (!contributors?.length) {
    return (
      <div>
        <PageHeader
          title="Contributors"
          description="See who ships the most changes in this dataset and how their volume compares to the top contributor."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Contributors"
        description="See who ships the most changes in this dataset and how their volume compares to the top contributor."
      >
        <div className="flex rounded-[6px] border border-gray-200 dark:border-[#1a1a1a] bg-gray-100 dark:bg-[#111] p-0.5">
          {(
            [
              { id: "commits" as const, label: "By commits" },
              { id: "name" as const, label: "A–Z" },
            ] as const
          ).map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setSort(id)}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] transition-all duration-150 whitespace-nowrap
                ${
                  sort === id
                    ? "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#e1e1e1]"
                    : "text-gray-500 dark:text-[#555] hover:text-gray-800 dark:hover:text-[#888]"
                }`}
            >
              {label}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] px-4 py-4 mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[0.06em]">
            Listed contributors
          </p>
          <p className="text-[22px] font-medium text-gray-900 dark:text-[#e1e1e1] tracking-[-0.03em] mt-0.5 tabular-nums">
            {contributors.length}
          </p>
        </div>
        {totalCount != null ? (
          <div className="text-right">
            <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[0.06em]">
              Repo total (all time)
            </p>
            <p className="text-[13px] text-gray-600 dark:text-[#666] font-mono mt-0.5 tabular-nums">
              {totalCount.toLocaleString()}
            </p>
          </div>
        ) : null}
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {sorted.map((c, index) => {
          const rank = sort === "commits" ? index + 1 : null;
          const widthPct = (c.commits / maxCommits) * 100;
          return (
            <li key={c.name}>
              <article className="h-full rounded-lg border border-gray-200 dark:border-[#161616] bg-white dark:bg-[#0d0d0d] p-4 transition-colors duration-200 hover:border-gray-300 dark:hover:border-[#222]">
                <div className="flex items-start gap-3">
                  {rank === 1 ? (
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-violet-200 dark:border-[#2a2244] bg-violet-50 dark:bg-[#120f1e] text-violet-700 dark:text-[#a78cf8]">
                      <Trophy size={14} strokeWidth={1.5} aria-hidden />
                    </span>
                  ) : rank ? (
                    <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md border border-gray-200 dark:border-[#1a1a1a] bg-gray-100 dark:bg-[#111] text-[10px] font-medium text-gray-500 dark:text-[#444] tabular-nums">
                      {rank}
                    </span>
                  ) : null}
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 border border-gray-200 dark:border-[#1e1e1e]"
                    style={{ background: c.bg, color: c.color }}
                  >
                    {c.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12px] text-gray-900 dark:text-[#e1e1e1] font-mono truncate">
                      {c.name}
                    </p>
                    <p className="text-[20px] font-medium text-gray-800 dark:text-[#d4d4d4] tabular-nums mt-1 tracking-[-0.02em]">
                      {c.commits.toLocaleString()}{" "}
                      <span className="text-[10px] font-normal text-gray-400 dark:text-[#444]">
                        commits
                      </span>
                    </p>
                    <div className="mt-3 h-[3px] rounded-full bg-gray-200 dark:bg-[#161616] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{
                          width: `${widthPct}%`,
                          background: c.color,
                          opacity: 0.85,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-[#333] mt-1.5">
                      {((c.commits / maxCommits) * 100).toFixed(0)}% of top
                      contributor in this list
                    </p>
                  </div>
                </div>
              </article>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function GridSkeleton() {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <li
          key={i}
          className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] p-4"
        >
          <div className="flex gap-3">
            <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-[3px] w-full mt-3" />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-[#222] bg-gray-50 dark:bg-[#0a0a0a] px-6 py-14 text-center">
      <Users
        className="mx-auto text-gray-300 dark:text-[#2a2a2a] mb-3"
        size={28}
        strokeWidth={1.25}
      />
      <p className="text-[12px] text-gray-500 dark:text-[#555]">
        No contributors loaded for this repo.
      </p>
    </div>
  );
}
