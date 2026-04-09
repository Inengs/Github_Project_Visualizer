/**
 * Health score + risk signals + high-impact insight lines.
 * Heuristic copy comes from the initial GET; optional OpenAI refresh via POST and local key storage.
 */
import { useCallback, useEffect, useState } from "react";
import type { HealthScore } from "../../types/type";
import { postRepoInsights } from "../../services/api";
import Skeleton from "../ui/Skeleton";

/** Browser-only storage for optional user OpenAI key (same origin as the SPA). */
const OPENAI_KEY_STORAGE = "gpv_openai_insights_key";

interface HealthScoreCardProps {
  owner: string;
  repo: string;
  data: HealthScore | null;
  onInsightsUpdate?: (next: HealthScore) => void;
}

export default function HealthScoreCard({
  owner,
  repo,
  data,
  onInsightsUpdate,
}: HealthScoreCardProps) {
  const [apiKey, setApiKey] = useState("");
  const [useOpenai, setUseOpenai] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(OPENAI_KEY_STORAGE);
      if (stored) setApiKey(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const persistKey = useCallback((value: string) => {
    setApiKey(value);
    try {
      if (value.trim()) localStorage.setItem(OPENAI_KEY_STORAGE, value.trim());
      else localStorage.removeItem(OPENAI_KEY_STORAGE);
    } catch {
      /* ignore */
    }
  }, []);

  const runOpenAiInsights = useCallback(async () => {
    if (!data) return;
    setAiError(null);
    setAiLoading(true);
    try {
      const next = await postRepoInsights(owner, repo, {
        use_openai: true,
        openai_api_key: apiKey.trim() || null,
      });
      onInsightsUpdate?.(next);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Insight request failed";
      setAiError(msg);
    } finally {
      setAiLoading(false);
    }
  }, [owner, repo, apiKey, data, onInsightsUpdate]);

  if (!data) return <CardSkeleton />;

  const circ = 2 * Math.PI * 20;
  const fill = (data.repo_health_score / 100) * circ;

  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px] hover:border-gray-300 dark:hover:border-[#1f1f1f] transition-colors duration-200">
      <p className="text-[10px] text-gray-400 dark:text-[#3a3a3a] uppercase tracking-[.05em] mb-1">
        Health score
      </p>
      <p className="text-[17px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.02em]">
        {data.repo_health_score} / 100
      </p>
      <p className="text-[10px] text-[#3d9970] mt-0.5 mb-3.5 capitalize">
        {data.activity_trend}
        {data.used_openai ? (
          <span className="text-gray-400 dark:text-[#555] normal-case ml-1">
            · AI narrative
          </span>
        ) : null}
      </p>

      {data.high_impact_insights?.length ? (
        <div className="mb-4">
          <p className="text-[10px] text-gray-400 dark:text-[#444] uppercase tracking-[.05em] mb-2">
            AI insight summary
          </p>
          <ul className="space-y-2">
            {data.high_impact_insights.map((line, i) => (
              <li
                key={i}
                className="text-[11px] text-gray-600 dark:text-[#aaa] leading-snug pl-2 border-l-2 border-[#3d9970]/50"
              >
                {line}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-md border border-gray-200 dark:border-[#1a1a1a] bg-white/40 dark:bg-[#080808] p-3 mb-4">
        <label className="flex items-center gap-2 text-[11px] text-gray-600 dark:text-[#888] cursor-pointer">
          <input
            type="checkbox"
            checked={useOpenai}
            onChange={(e) => setUseOpenai(e.target.checked)}
            className="rounded border-gray-300 dark:border-[#333]"
          />
          Regenerate summaries with OpenAI (optional key; server key used if set)
        </label>
        {useOpenai ? (
          <div className="mt-2 space-y-2">
            <input
              type="password"
              autoComplete="off"
              placeholder="OpenAI API key (optional)"
              value={apiKey}
              onChange={(e) => persistKey(e.target.value)}
              className="w-full text-[11px] px-2 py-1.5 rounded border border-gray-200 dark:border-[#222] bg-white dark:bg-[#111] text-black dark:text-[#e1e1e1]"
            />
            <button
              type="button"
              disabled={aiLoading}
              onClick={() => void runOpenAiInsights()}
              className="text-[11px] px-2.5 py-1 rounded bg-black dark:bg-[#e1e1e1] text-white dark:text-black disabled:opacity-50"
            >
              {aiLoading ? "Generating…" : "Run OpenAI insights"}
            </button>
            {aiError ? (
              <p className="text-[10px] text-red-600 dark:text-red-400">{aiError}</p>
            ) : null}
          </div>
        ) : null}
      </div>

      <div className="flex items-start gap-4">
        <svg
          width="52"
          height="52"
          viewBox="0 0 52 52"
          className="flex-shrink-0"
        >
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="#e5e7eb"
            className="dark:[stroke:#161616]"
            strokeWidth="4"
          />
          <circle
            cx="26"
            cy="26"
            r="20"
            fill="none"
            stroke="#111111"
            className="dark:[stroke:#e1e1e1]"
            strokeWidth="4"
            strokeDasharray={`${fill.toFixed(1)} ${(circ - fill).toFixed(1)}`}
            strokeLinecap="round"
            transform="rotate(-90 26 26)"
            style={{
              transition:
                "stroke-dasharray 0.9s 0.2s cubic-bezier(0.4,0,0.2,1)",
            }}
          />
        </svg>

        <div className="flex-1 flex flex-col gap-1.5">
          <p className="text-[10px] text-gray-400 dark:text-[#444] mb-1">
            Risk signals
          </p>
          {data.risk_signals.length === 0 ? (
            <p className="text-[11px] text-[#3d9970]">
              No risk signals detected
            </p>
          ) : (
            data.risk_signals.map((signal, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-amber-400 flex-shrink-0" />
                <span className="text-[11px] text-gray-500 dark:text-[#666] capitalize">
                  {signal}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="bg-gray-50 dark:bg-[#0d0d0d] border border-gray-200 dark:border-[#161616] rounded-lg p-[18px]">
      <Skeleton className="h-2.5 w-20 mb-2" />
      <Skeleton className="h-4 w-16 mb-4" />
      <div className="flex items-start gap-4">
        <Skeleton className="w-[52px] h-[52px] rounded-full flex-shrink-0" />
        <div className="flex-1 flex flex-col gap-2">
          <Skeleton className="h-2 w-20 mb-1" />
          <Skeleton className="h-2.5 w-32" />
          <Skeleton className="h-2.5 w-28" />
          <Skeleton className="h-2.5 w-24" />
        </div>
      </div>
    </div>
  );
}
