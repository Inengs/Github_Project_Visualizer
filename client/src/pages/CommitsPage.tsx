import { useMemo, useState } from "react";
import { GitCommitHorizontal, Search } from "lucide-react";
import type { CommitListItem } from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import Skeleton from "../components/ui/Skeleton";

interface CommitsPageProps {
  commits: CommitListItem[] | null;
  loading: boolean;
}

export default function CommitsPage({ commits, loading }: CommitsPageProps) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    if (!commits) return [];
    const q = query.trim().toLowerCase();
    if (!q) return commits;
    return commits.filter(
      (c) =>
        c.message.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q) ||
        c.sha.toLowerCase().includes(q) ||
        c.branch.toLowerCase().includes(q),
    );
  }, [commits, query]);

  if (loading && !commits) {
    return (
      <div>
        <PageHeader
          title="Commits"
          description="Recent commits across the default branch and active topic branches. Search filters the list locally."
        />
        <ListSkeleton />
      </div>
    );
  }

  if (!commits?.length) {
    return (
      <div>
        <PageHeader
          title="Commits"
          description="Recent commits across the default branch and active topic branches."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Commits"
        description="Recent commits across the default branch and active topic branches. Search filters the list locally."
      >
        <label className="relative flex items-center bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-[6px] px-2.5 py-1.5 w-full sm:w-[260px]">
          <Search
            size={12}
            className="text-gray-400 dark:text-[#444] flex-shrink-0"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search message, author, SHA…"
            className="bg-transparent outline-none text-[11px] text-gray-800 dark:text-[#ccc] ml-2 w-full placeholder:text-gray-400 dark:placeholder:text-[#444]"
            type="search"
            aria-label="Filter commits"
          />
        </label>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden">
        <div className="grid grid-cols-[auto_1fr_auto_auto] gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-[#161616] text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[0.06em]">
          <span className="w-[72px]">SHA</span>
          <span>Commit</span>
          <span className="hidden sm:block w-[100px] text-right">Branch</span>
          <span className="w-[56px] text-right">When</span>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-[#141414]">
          {filtered.map((c) => (
            <li key={`${c.sha}-${c.time}`}>
              <button
                type="button"
                className="w-full grid grid-cols-1 sm:grid-cols-[auto_1fr_auto_auto] gap-2 sm:gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[#111] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-[#333] focus-visible:ring-inset"
              >
                <div className="flex items-center gap-2 sm:block sm:w-[72px]">
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-[#5c9e7a] tabular-nums">
                    {c.sha}
                  </span>
                  <span className="sm:hidden text-[10px] text-gray-400 dark:text-[#333]">
                    {c.time}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] text-gray-800 dark:text-[#d4d4d4] leading-snug line-clamp-2">
                    {c.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span
                      className="w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-medium border border-gray-200 dark:border-[#1e1e1e] bg-white dark:bg-[#141414] text-gray-500 dark:text-[#888]"
                      aria-hidden
                    >
                      {c.author_initials}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-[#555] font-mono truncate">
                      {c.author}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:flex items-center justify-end">
                  <span className="text-[10px] text-gray-600 dark:text-[#555] font-mono truncate max-w-[100px] px-2 py-0.5 rounded bg-white dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a]">
                    {c.branch}
                  </span>
                </div>
                <div className="hidden sm:flex items-center justify-end">
                  <time
                    className="text-[10px] text-gray-400 dark:text-[#3a3a3a] tabular-nums"
                    dateTime={c.time}
                  >
                    {c.time}
                  </time>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {filtered.length === 0 ? (
          <p className="px-4 py-8 text-center text-[11px] text-gray-500 dark:text-[#444]">
            No commits match “{query}”.
          </p>
        ) : null}
      </div>

      <p className="mt-3 text-[10px] text-gray-400 dark:text-[#333]">
        Showing {filtered.length} of {commits.length} loaded commits
      </p>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="flex gap-4 px-4 py-3.5 border-b border-gray-200 dark:border-[#141414] last:border-0"
        >
          <Skeleton className="h-3 w-14 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-full max-w-md" />
            <Skeleton className="h-2.5 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-[#222] bg-gray-50 dark:bg-[#0a0a0a] px-6 py-14 text-center">
      <GitCommitHorizontal
        className="mx-auto text-gray-300 dark:text-[#2a2a2a] mb-3"
        size={28}
        strokeWidth={1.25}
      />
      <p className="text-[12px] text-gray-500 dark:text-[#555]">
        No commits loaded for this repo.
      </p>
    </div>
  );
}
