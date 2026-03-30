import { useState, useEffect, useCallback } from "react";
import type { RepoData, Range, UseRepoDataReturn } from "../types/type";
import {
  fetchRepoOverview,
  fetchStats,
  fetchCommitActivity,
  fetchCommitsPerDay,
  fetchIssues,
  fetchContributors,
  fetchPullRequests,
  fetchActivity,
  fetchHealthScore,
  fetchLanguages,
} from "../services/api";

const DEFAULT_OWNER = "Inengs";
const DEFAULT_REPO = "Github_Project_Visualizer";

export function useRepoData(
  owner: string = DEFAULT_OWNER,
  repo: string = DEFAULT_REPO,
): UseRepoDataReturn {
  const [range, setRange] = useState<Range>("30d");
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [
        repoInfo,
        stats,
        commitActivity,
        commitsPerDay,
        issues,
        contributors,
        pullRequests,
        activity,
        healthScore,
        languages,
      ] = await Promise.all([
        fetchRepoOverview(owner, repo),
        fetchStats(owner, repo, range),
        fetchCommitActivity(owner, repo, range),
        fetchCommitsPerDay(owner, repo),
        fetchIssues(owner, repo),
        fetchContributors(owner, repo),
        fetchPullRequests(owner, repo),
        fetchActivity(owner, repo),
        fetchHealthScore(owner, repo),
        fetchLanguages(owner, repo),
      ]);

      setData({
        repoInfo,
        stats,
        commitActivity,
        commitsPerDay,
        issues,
        contributors,
        pullRequests,
        activity,
        healthScore,
        languages,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load data";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, range]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, range, setRange, refetch: load };
}
