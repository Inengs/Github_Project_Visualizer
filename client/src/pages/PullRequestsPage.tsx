import { useMemo, useState } from "react";
import { GitPullRequest, GitMerge, Lock } from "lucide-react";
import type { PRStatus, PullRequest } from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import Skeleton from "../components/ui/Skeleton";

type PRFilter = "all" | PRStatus;

interface PullRequestsPageProps {
  pullRequests: PullRequest[] | null;
  loading: boolean;
}

const FILTERS: { id: PRFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "merged", label: "Merged" },
  { id: "closed", label: "Closed" },
];

const STATUS_STYLES: Record<
  PRStatus,
  { label: string; className: string; icon: typeof GitPullRequest }
> = {
  open: {
    label: "Open",
    className:
      "text-sky-800 dark:text-[#5b8def] border-sky-200 dark:border-[#1e2a44] bg-sky-50 dark:bg-[#0a1220]",
    icon: GitPullRequest,
  },
  merged: {
    label: "Merged",
    className:
      "text-violet-800 dark:text-[#a78cf8] border-violet-200 dark:border-[#2a2244] bg-violet-50 dark:bg-[#120f1e]",
    icon: GitMerge,
  },
  closed: {
    label: "Closed",
    className:
      "text-gray-600 dark:text-[#888] border-gray-200 dark:border-[#222] bg-gray-100 dark:bg-[#111]",
    icon: Lock,
  },
};

export default function PullRequestsPage({
  pullRequests,
  loading,
}: PullRequestsPageProps) {
  const [filter, setFilter] = useState<PRFilter>("all");

  const counts = useMemo(() => {
    if (!pullRequests) {
      return { all: 0, open: 0, merged: 0, closed: 0 };
    }
    return {
      all: pullRequests.length,
      open: pullRequests.filter((p) => p.status === "open").length,
      merged: pullRequests.filter((p) => p.status === "merged").length,
      closed: pullRequests.filter((p) => p.status === "closed").length,
    };
  }, [pullRequests]);

  const filtered = useMemo(() => {
    if (!pullRequests) return [];
    if (filter === "all") return pullRequests;
    return pullRequests.filter((p) => p.status === filter);
  }, [pullRequests, filter]);

  if (loading && !pullRequests) {
    return (
      <div>
        <PageHeader
          title="Pull requests"
          description="Review merge activity: who proposed changes, current state, and how fresh each thread is."
        />
        <ListSkeleton />
      </div>
    );
  }

  if (!pullRequests?.length) {
    return (
      <div>
        <PageHeader
          title="Pull requests"
          description="Review merge activity: who proposed changes, current state, and how fresh each thread is."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Pull requests"
        description="Review merge activity: who proposed changes, current state, and how fresh each thread is."
      >
        <div
          className="flex flex-wrap rounded-[6px] border border-gray-200 dark:border-[#1a1a1a] bg-gray-100 dark:bg-[#111] p-0.5 gap-0.5"
          role="tablist"
          aria-label="Pull request status"
        >
          {FILTERS.map(({ id, label }) => {
            const count =
              id === "all" ? counts.all : counts[id as PRStatus];
            const active = filter === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setFilter(id)}
                className={`px-2.5 py-1 rounded-[5px] text-[11px] transition-all duration-150 whitespace-nowrap
                  ${
                    active
                      ? "bg-white dark:bg-[#1a1a1a] text-gray-900 dark:text-[#e1e1e1] shadow-sm"
                      : "text-gray-500 dark:text-[#555] hover:text-gray-800 dark:hover:text-[#888]"
                  }`}
              >
                {label}
                <span className="ml-1 tabular-nums text-gray-400 dark:text-[#444]">
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </PageHeader>

      <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden">
        <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-3 px-4 py-2.5 border-b border-gray-200 dark:border-[#161616] text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[0.06em]">
          <span>Title</span>
          <span className="w-[100px]">Author</span>
          <span className="w-[88px] text-center">Status</span>
          <span className="w-[56px] text-right">Updated</span>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-[#141414]">
          {filtered.map((pr) => {
            const meta = STATUS_STYLES[pr.status];
            const Icon = meta.icon;
            return (
              <li key={pr.id}>
                <button
                  type="button"
                  className="w-full grid grid-cols-1 md:grid-cols-[1fr_auto_auto_auto] gap-3 md:gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[#111] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-[#333] focus-visible:ring-inset items-start"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-[11px] text-gray-500 dark:text-[#555] tabular-nums">
                        {pr.id}
                      </span>
                      <Icon
                        size={12}
                        className="text-gray-400 dark:text-[#333] flex-shrink-0"
                      />
                    </div>
                    <p className="text-[12px] text-gray-800 dark:text-[#d4d4d4] mt-1 leading-snug">
                      {pr.title}
                    </p>
                  </div>
                  <div className="flex md:block items-center gap-2">
                    <span className="md:hidden text-[10px] text-gray-400 dark:text-[#3a3a3a]">
                      Author
                    </span>
                    <span className="text-[11px] text-gray-600 dark:text-[#666] font-mono truncate md:w-[100px] md:block">
                      {pr.author}
                    </span>
                  </div>
                  <div className="flex md:justify-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-md border ${meta.className}`}
                    >
                      <Icon size={10} />
                      {meta.label}
                    </span>
                  </div>
                  <div className="flex md:justify-end items-center gap-2">
                    <span className="md:hidden text-[10px] text-gray-400 dark:text-[#3a3a3a]">
                      Updated
                    </span>
                    <time
                      className="text-[10px] text-gray-400 dark:text-[#3a3a3a] tabular-nums md:w-[56px] md:text-right"
                      dateTime={pr.time}
                    >
                      {pr.time}
                    </time>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden divide-y divide-gray-200 dark:divide-[#141414]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="px-4 py-3.5 space-y-2">
          <Skeleton className="h-2.5 w-24" />
          <Skeleton className="h-3 w-full max-w-md" />
          <Skeleton className="h-2.5 w-32" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-[#222] bg-gray-50 dark:bg-[#0a0a0a] px-6 py-14 text-center">
      <GitPullRequest
        className="mx-auto text-gray-300 dark:text-[#2a2a2a] mb-3"
        size={28}
        strokeWidth={1.25}
      />
      <p className="text-[12px] text-gray-500 dark:text-[#555]">
        No pull requests loaded for this repo.
      </p>
    </div>
  );
}
