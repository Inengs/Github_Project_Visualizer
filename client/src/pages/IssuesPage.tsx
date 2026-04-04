import { useMemo, useState } from "react";
import { CircleDot, MessageCircle } from "lucide-react";
import type { IssueListItem, IssueRowState } from "../types/type";
import PageHeader from "../components/layout/PageHeader";
import Skeleton from "../components/ui/Skeleton";

type IssueFilter = "all" | IssueRowState;

interface IssuesPageProps {
  issues: IssueListItem[] | null;
  loading: boolean;
}

const FILTERS: { id: IssueFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "open", label: "Open" },
  { id: "closed", label: "Closed" },
];

export default function IssuesPage({ issues, loading }: IssuesPageProps) {
  const [filter, setFilter] = useState<IssueFilter>("all");

  const counts = useMemo(() => {
    if (!issues) return { all: 0, open: 0, closed: 0 };
    return {
      all: issues.length,
      open: issues.filter((i) => i.state === "open").length,
      closed: issues.filter((i) => i.state === "closed").length,
    };
  }, [issues]);

  const filtered = useMemo(() => {
    if (!issues) return [];
    if (filter === "all") return issues;
    return issues.filter((i) => i.state === filter);
  }, [issues, filter]);

  if (loading && !issues) {
    return (
      <div>
        <PageHeader
          title="Issues"
          description="Track open and closed work: titles, labels, and discussion volume at a glance."
        />
        <ListSkeleton />
      </div>
    );
  }

  if (!issues?.length) {
    return (
      <div>
        <PageHeader
          title="Issues"
          description="Track open and closed work: titles, labels, and discussion volume at a glance."
        />
        <EmptyState />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Issues"
        description="Track open and closed work: titles, labels, and discussion volume at a glance."
      >
        <div
          className="flex rounded-[6px] border border-gray-200 dark:border-[#1a1a1a] bg-gray-100 dark:bg-[#111] p-0.5"
          role="tablist"
          aria-label="Issue state"
        >
          {FILTERS.map(({ id, label }) => {
            const count =
              id === "all"
                ? counts.all
                : id === "open"
                  ? counts.open
                  : counts.closed;
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
        <ul className="divide-y divide-gray-200 dark:divide-[#141414]">
          {filtered.map((issue) => (
            <li key={issue.number}>
              <button
                type="button"
                className="w-full flex flex-col sm:flex-row sm:items-start gap-3 px-4 py-3.5 text-left transition-colors duration-150 hover:bg-gray-100 dark:hover:bg-[#111] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-gray-400 dark:focus-visible:ring-[#333] focus-visible:ring-inset"
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <StateIcon state={issue.state} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 gap-y-1">
                      <span className="text-[10px] text-gray-400 dark:text-[#333] font-mono tabular-nums">
                        #{issue.number}
                      </span>
                      <span
                        className={`text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                          issue.state === "open"
                            ? "text-emerald-800 dark:text-[#3d9970] border-emerald-200 dark:border-[#1e3d2e] bg-emerald-50 dark:bg-[#0a1a12]"
                            : "text-gray-500 dark:text-[#666] border-gray-200 dark:border-[#222] bg-white dark:bg-[#111]"
                        }`}
                      >
                        {issue.state}
                      </span>
                    </div>
                    <p className="text-[12px] text-gray-800 dark:text-[#d4d4d4] mt-1 leading-snug">
                      {issue.title}
                    </p>
                    {issue.labels.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {issue.labels.map((lb) => (
                          <span
                            key={lb.name}
                            className="text-[9px] px-2 py-0.5 rounded-full border border-gray-200 dark:border-[#1a1a1a]"
                            style={{
                              color: lb.color,
                              backgroundColor: `${lb.color}14`,
                            }}
                          >
                            {lb.name}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    <p className="text-[10px] text-gray-500 dark:text-[#444] mt-2">
                      opened by{" "}
                      <span className="text-gray-600 dark:text-[#666] font-mono">
                        {issue.author}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="flex sm:flex-col items-center sm:items-end gap-3 sm:gap-1 pl-8 sm:pl-0 text-[10px] text-gray-400 dark:text-[#3a3a3a] flex-shrink-0">
                  <span className="inline-flex items-center gap-1 tabular-nums">
                    <MessageCircle
                      size={11}
                      className="text-gray-400 dark:text-[#333]"
                    />
                    {issue.comments}
                  </span>
                  <time dateTime={issue.time}>{issue.time}</time>
                  {/* Add avatar of assigned members */}
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StateIcon({ state }: { state: IssueRowState }) {
  if (state === "open") {
    return (
      <CircleDot
        size={16}
        className="text-emerald-600 dark:text-[#3d9970] flex-shrink-0 mt-0.5"
        strokeWidth={1.75}
        aria-hidden
      />
    );
  }
  return (
    <CircleDot
      size={16}
      className="text-gray-400 dark:text-[#444] flex-shrink-0 mt-0.5"
      strokeWidth={1.75}
      aria-hidden
    />
  );
}

function ListSkeleton() {
  return (
    <div className="rounded-lg border border-gray-200 dark:border-[#161616] bg-gray-50 dark:bg-[#0d0d0d] overflow-hidden divide-y divide-gray-200 dark:divide-[#141414]">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3.5">
          <Skeleton className="w-4 h-4 rounded-full flex-shrink-0 mt-0.5" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-2.5 w-20" />
            <Skeleton className="h-3 w-full max-w-lg" />
            <Skeleton className="h-2 w-40" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-300 dark:border-[#222] bg-gray-50 dark:bg-[#0a0a0a] px-6 py-14 text-center">
      <CircleDot
        className="mx-auto text-gray-300 dark:text-[#2a2a2a] mb-3"
        size={28}
        strokeWidth={1.25}
      />
      <p className="text-[12px] text-gray-500 dark:text-[#555]">
        No issues loaded for this repo.
      </p>
    </div>
  );
}
