import axios from "axios";

import type {
  Repo,
  Stats,
  CommitActivity,
  CommitDay,
  Issue,
  IssueListItem,
  CommitListItem,
  Contributor,
  PullRequest,
  ActivityItem,
  HealthScore,
  ContributionPrediction,
  Range,
  GenerateReadmeOptions,
  GenerateReadmeResult,
  InsightsEnhanceOptions,
  Language,
  RepoCompareRow,
} from "../types/type";

import {
  mockRepo,
  mockStats,
  mockCommitActivity,
  mockCommitsPerDay,
  mockIssues,
  mockIssueList,
  mockCommitList,
  mockContributors,
  mockPullRequests,
  mockActivity,
  mockHealthScore,
  mockContributionPrediction,
  mockLanguages,
} from "../data/mockData";

const USE_MOCK = true;

const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Rust: "#dea584",
  Go: "#00ADD8",
  CSS: "#563d7c",
  HTML: "#e34c26",
  Java: "#b07219",
  "C++": "#f34b7d",
  Ruby: "#701516",
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000/api",
  timeout: 10000,
});

const fakeFetch = <T>(data: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export async function fetchRepoOverview(
  owner: string,
  repo: string,
): Promise<Repo> {
  if (USE_MOCK) return fakeFetch(mockRepo);
  const { data } = await api.get(`/repo/${owner}/${repo}`);
  return {
    name: data.name,
    description: data.description ?? null,
    language: data.language ?? null,
    stars: data.stars,
    forks: data.forks,
    topics: data.topics ?? [],
  };
}

export async function fetchStats(
  owner: string,
  repo: string,
  range: Range,
): Promise<Stats> {
  if (USE_MOCK) return fakeFetch(mockStats);
  const { data } = await api.get<Stats>(`/repo/${owner}/${repo}/stats`, {
    params: { range },
  });
  return data;
}

export async function fetchCommitActivity(
  owner: string,
  repo: string,
  range: Range,
): Promise<CommitActivity> {
  if (USE_MOCK) return fakeFetch(mockCommitActivity[range]);
  const { data } = await api.get(`/repo/${owner}/${repo}/activity`);
  // GitHub returns array of { week, days, total } objects
  return {
    points: data.map((w: any) => w.total),
    dates: data.map((w: any) =>
      new Date(w.week * 1000).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    ),
    total: data.reduce((sum: number, w: any) => sum + w.total, 0),
    change: "",
    range: "52 weeks",
  };
}

export async function fetchCommitsPerDay(
  owner: string,
  repo: string,
): Promise<CommitDay[]> {
  if (USE_MOCK) return fakeFetch(mockCommitsPerDay);
  const { data } = await api.get<CommitDay[]>(
    `/repo/${owner}/${repo}/commits/per-day`,
  );
  return data;
}

export async function fetchIssues(
  owner: string,
  repo: string,
): Promise<Issue[]> {
  if (USE_MOCK) return fakeFetch(mockIssues);
  const { data } = await api.get(`/repo/${owner}/${repo}/issue-stats`);
  const total = data.total_issues || 1;
  return [
    {
      label: "Open",
      count: data.open_issues,
      color: "#6b7280",
      pct: Math.round((data.open_issues / total) * 100),
    },
    {
      label: "Closed",
      count: data.closed_issues,
      color: "#3d9970",
      pct: Math.round((data.closed_issues / total) * 100),
    },
  ];
}

export async function fetchIssueList(
  owner: string,
  repo: string,
): Promise<IssueListItem[]> {
  if (USE_MOCK) return fakeFetch(mockIssueList);
  const { data } = await api.get<IssueListItem[]>(
    `/repo/${owner}/${repo}/issues/list`,
  );
  return data;
}

export async function fetchCommitList(
  owner: string,
  repo: string,
): Promise<CommitListItem[]> {
  if (USE_MOCK) return fakeFetch(mockCommitList);
  const { data } = await api.get<CommitListItem[]>(
    `/repo/${owner}/${repo}/commits/list`,
  );
  return data;
}

export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<Contributor[]> {
  if (USE_MOCK) return fakeFetch(mockContributors);
  const { data } = await api.get(`/repo/${owner}/${repo}/contributors`);
  const max = data[0]?.contributions ?? 1;
  return data.slice(0, 5).map((c: any) => ({
    initials: c.login.slice(0, 2).toUpperCase(),
    name: c.login,
    commits: c.contributions,
    color: "#7c8cf8",
    bg: "#12122a",
    pct: Math.round((c.contributions / max) * 100),
  }));
}

export async function fetchPullRequests(
  owner: string,
  repo: string,
): Promise<PullRequest[]> {
  if (USE_MOCK) return fakeFetch(mockPullRequests);
  const { data } = await api.get(`/repo/${owner}/${repo}/pulls`, {
    params: { state: "all" },
  });
  return data.map((pr: any) => ({
    id: `#${pr.number}`,
    title: pr.title,
    author: pr.user?.login ?? "",
    status: pr.merged_at ? "merged" : pr.state === "closed" ? "closed" : "open",
    time: new Date(pr.updated_at).toLocaleDateString(),
  }));
}

export async function fetchActivity(
  owner: string,
  repo: string,
): Promise<ActivityItem[]> {
  if (USE_MOCK) return fakeFetch(mockActivity);
  const { data } = await api.get<ActivityItem[]>(
    `/repo/${owner}/${repo}/activity`,
  );
  return data;
}

/** Normalizes analytics insight responses for both GET (heuristic) and POST (optional OpenAI). */
function mapInsightsPayload(data: Record<string, unknown>): HealthScore {
  return {
    repo_health_score: Number(data.repo_health_score),
    activity_trend: String(data.activity_trend),
    risk_signals: Array.isArray(data.risk_signals)
      ? data.risk_signals.map(String)
      : [],
    high_impact_insights: Array.isArray(data.high_impact_insights)
      ? data.high_impact_insights.map(String)
      : [],
    used_openai: Boolean(data.used_openai),
  };
}

export async function fetchHealthScore(
  owner: string,
  repo: string,
): Promise<HealthScore> {
  if (USE_MOCK) return fakeFetch(mockHealthScore);
  const { data } = await api.get(`/analytics/repo/${owner}/${repo}/insights`);
  return mapInsightsPayload(data as Record<string, unknown>);
}

/**
 * POST /analytics/repo/.../insights — when `use_openai` is true, server may replace
 * `high_impact_insights` using the request key or OPENAI_API_KEY.
 */
export async function postRepoInsights(
  owner: string,
  repo: string,
  options?: InsightsEnhanceOptions,
): Promise<HealthScore> {
  if (USE_MOCK) {
    return fakeFetch({
      ...mockHealthScore,
      used_openai: Boolean(options?.use_openai),
      high_impact_insights: options?.use_openai
        ? [
            "AI (mock): Activity looks healthy relative to the sampled metrics.",
            "AI (mock): Consider monitoring PR throughput if the backlog grows.",
          ]
        : mockHealthScore.high_impact_insights,
    });
  }
  const encOwner = encodeURIComponent(owner);
  const encRepo = encodeURIComponent(repo);
  const { data } = await api.post(
    `/analytics/repo/${encOwner}/${encRepo}/insights`,
    {
      use_openai: options?.use_openai ?? false,
      openai_api_key: options?.openai_api_key ?? null,
    },
    { timeout: 90000 },
  );
  return mapInsightsPayload(data as Record<string, unknown>);
}

/** Heuristic next-week commit hint from weekly GitHub stats (no AI). */
export async function fetchContributionPrediction(
  owner: string,
  repo: string,
): Promise<ContributionPrediction> {
  if (USE_MOCK) return fakeFetch(mockContributionPrediction);
  const { data } = await api.get(
    `/analytics/repo/${owner}/${repo}/prediction`,
  );
  return {
    trend_direction: String(data.trend_direction),
    recent_weekly_avg: Number(data.recent_weekly_avg),
    prior_weekly_avg: Number(data.prior_weekly_avg),
    predicted_next_week_commits: Number(data.predicted_next_week_commits),
    method_note: String(data.method_note ?? ""),
  };
}

/** POST /analytics/compare/repos — 2–3 repos, parallel server-side aggregation. */
export async function compareRepositories(
  repos: { owner: string; repo: string }[],
): Promise<RepoCompareRow[]> {
  if (USE_MOCK) {
    return fakeFetch([
      {
        owner: repos[0]?.owner ?? "octocat",
        repo: repos[0]?.repo ?? "Hello-World",
        full_name: `${repos[0]?.owner ?? "octocat"}/${repos[0]?.repo ?? "Hello-World"}`,
        stars: 500,
        forks: 120,
        language: "JavaScript",
        open_issues_count: 12,
        repo_health_score: 78,
        activity_trend: "stable",
        merge_rate: 0.72,
        stars_delta_snapshot: 2,
        forks_delta_snapshot: 0,
        high_impact_preview: "Mock comparison row A.",
      },
      {
        owner: repos[1]?.owner ?? "octocat",
        repo: repos[1]?.repo ?? "Spoon-Knife",
        full_name: `${repos[1]?.owner ?? "octocat"}/${repos[1]?.repo ?? "Spoon-Knife"}`,
        stars: 12000,
        forks: 13200,
        language: "HTML",
        open_issues_count: 4,
        repo_health_score: 65,
        activity_trend: "decreasing",
        merge_rate: 0.41,
        stars_delta_snapshot: -1,
        forks_delta_snapshot: 0,
        high_impact_preview: "Mock comparison row B.",
      },
    ]);
  }
  const { data } = await api.post<{ rows: RepoCompareRow[] }>(
    `/analytics/compare/repos`,
    { repos },
    { timeout: 120000 },
  );
  return data.rows;
}

export async function generateReadme(
  owner: string,
  repo: string,
  options?: GenerateReadmeOptions,
): Promise<GenerateReadmeResult> {
  if (USE_MOCK) {
    return fakeFetch({
      markdown: `# ${owner}/${repo}\n\n_Auto-generated README (mock)._\n\n## Summary\nPlaceholder content while \`USE_MOCK\` is enabled in \`api.ts\`.\n`,
      html: `<!DOCTYPE html><html><body><h1>${owner}/${repo}</h1><p>Mock README</p></body></html>`,
      template_id: "default",
      used_openai: false,
      pdf_export_hint:
        "For PDF: open the HTML export in a browser and use Print → Save as PDF.",
    });
  }
  const encOwner = encodeURIComponent(owner);
  const encRepo = encodeURIComponent(repo);
  const { data } = await api.post<GenerateReadmeResult>(
    `/repo/${encOwner}/${encRepo}/generate-readme`,
    options ?? {},
    { timeout: 90000 },
  );
  return data;
}

export async function fetchLanguages(
  owner: string,
  repo: string,
): Promise<Language[]> {
  if (USE_MOCK) return fakeFetch(mockLanguages);
  const { data } = await api.get(`/repo/${owner}/${repo}/languages`);
  const total = Object.values(data as Record<string, number>).reduce(
    (a, b) => a + b,
    0,
  );
  return Object.entries(data as Record<string, number>).map(
    ([name, bytes]) => ({
      name,
      percentage: Math.round((bytes / total) * 100),
      color: LANGUAGE_COLORS[name] ?? "#6b7280",
    }),
  );
}
