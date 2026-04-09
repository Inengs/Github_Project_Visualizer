/**
 * Standalone tool: compare 2–3 GitHub repos using the same metrics as analytics insights.
 * Does not use the dashboard’s selected repo; each row is typed by the user.
 */
import { useState } from "react";
import PageHeader from "../components/layout/PageHeader";
import DataErrorPanel from "../components/layout/DataErrorPanel";
import { compareRepositories } from "../services/api";
import type { RepoCompareRow } from "../types/type";

interface RepoField {
  owner: string;
  repo: string;
}

const emptyRow = (): RepoField => ({ owner: "", repo: "" });

export default function Compare() {
  const [rows, setRows] = useState<RepoField[]>([
    emptyRow(),
    emptyRow(),
  ]);
  const [result, setResult] = useState<RepoCompareRow[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setRow = (index: number, patch: Partial<RepoField>) => {
    setRows((prev) =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const addRow = () => {
    if (rows.length >= 3) return;
    setRows((prev) => [...prev, emptyRow()]);
  };

  const removeRow = (index: number) => {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, i) => i !== index));
  };

  const runCompare = async () => {
    const refs = rows
      .map((r) => ({
        owner: r.owner.trim(),
        repo: r.repo.trim(),
      }))
      .filter((r) => r.owner && r.repo);
    if (refs.length < 2) {
      setError("Enter at least two owner/repo pairs.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const data = await compareRepositories(refs);
      setResult(data);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Comparison failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 max-w-[1100px]">
      <PageHeader
        title="Compare repositories"
        description="Load two or three public repositories side by side using the same health and merge signals as analytics. Each repo should have been opened in the dashboard at least once so snapshot deltas exist."
      />

      <div className="space-y-3">
        {rows.map((row, i) => (
          <div
            key={i}
            className="flex flex-wrap items-end gap-2 p-3 rounded-lg border border-gray-200 dark:border-[#1a1a1a] bg-gray-50 dark:bg-[#0d0d0d]"
          >
            <label className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-[#666] min-w-[120px] flex-1">
              Owner
              <input
                value={row.owner}
                onChange={(e) => setRow(i, { owner: e.target.value })}
                placeholder="e.g. facebook"
                className="text-[12px] px-2 py-1.5 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#111] text-black dark:text-[#e1e1e1]"
              />
            </label>
            <label className="flex flex-col gap-1 text-[11px] text-gray-500 dark:text-[#666] min-w-[120px] flex-1">
              Repo
              <input
                value={row.repo}
                onChange={(e) => setRow(i, { repo: e.target.value })}
                placeholder="e.g. react"
                className="text-[12px] px-2 py-1.5 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#111] text-black dark:text-[#e1e1e1]"
              />
            </label>
            {rows.length > 2 ? (
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="text-[11px] text-gray-500 hover:text-red-600 px-2 py-1.5"
              >
                Remove
              </button>
            ) : null}
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading}
          onClick={() => void runCompare()}
          className="text-[12px] px-3 py-2 rounded bg-black dark:bg-[#e1e1e1] text-white dark:text-black disabled:opacity-50"
        >
          {loading ? "Comparing…" : "Compare"}
        </button>
        {rows.length < 3 ? (
          <button
            type="button"
            onClick={addRow}
            className="text-[12px] px-3 py-2 rounded border border-gray-200 dark:border-[#333] text-gray-700 dark:text-[#ccc]"
          >
            Add third repo
          </button>
        ) : null}
      </div>

      {error ? (
        <DataErrorPanel message={error} onRetry={() => void runCompare()} />
      ) : null}

      {result && result.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-[#1a1a1a]">
          <table className="w-full text-left text-[11px] text-gray-600 dark:text-[#aaa]">
            <thead className="bg-gray-100 dark:bg-[#111] text-[10px] uppercase tracking-wide text-gray-500 dark:text-[#666]">
              <tr>
                <th className="p-2.5 font-medium">Repository</th>
                <th className="p-2.5 font-medium">Stars</th>
                <th className="p-2.5 font-medium">Forks</th>
                <th className="p-2.5 font-medium">Δ stars*</th>
                <th className="p-2.5 font-medium">Health</th>
                <th className="p-2.5 font-medium">Activity</th>
                <th className="p-2.5 font-medium">Merge rate</th>
                <th className="p-2.5 font-medium">Language</th>
                <th className="p-2.5 font-medium min-w-[200px]">Insight preview</th>
              </tr>
            </thead>
            <tbody>
              {result.map((r) => (
                <tr
                  key={r.full_name}
                  className="border-t border-gray-200 dark:border-[#1a1a1a] bg-white dark:bg-[#080808]"
                >
                  <td className="p-2.5 font-medium text-black dark:text-[#e1e1e1]">
                    {r.full_name}
                  </td>
                  <td className="p-2.5">{r.stars.toLocaleString()}</td>
                  <td className="p-2.5">{r.forks.toLocaleString()}</td>
                  <td className="p-2.5">{r.stars_delta_snapshot >= 0 ? "+" : ""}
                    {r.stars_delta_snapshot}
                  </td>
                  <td className="p-2.5">{r.repo_health_score}</td>
                  <td className="p-2.5 capitalize">{r.activity_trend}</td>
                  <td className="p-2.5">{Math.round(r.merge_rate * 100)}%</td>
                  <td className="p-2.5">{r.language ?? "—"}</td>
                  <td className="p-2.5 text-gray-500 dark:text-[#888] leading-snug">
                    {r.high_impact_preview || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-[10px] text-gray-400 dark:text-[#555] p-2 px-3 border-t border-gray-200 dark:border-[#1a1a1a]">
            *Star delta uses the latest two snapshots stored for each repo (0 if only one fetch exists).
          </p>
        </div>
      ) : null}
    </div>
  );
}
