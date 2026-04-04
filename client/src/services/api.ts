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
  Range,
  GenerateReadmeOptions,
  GenerateReadmeResult,
  Language,
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

export async function fetchHealthScore(
  owner: string,
  repo: string,
): Promise<HealthScore> {
  if (USE_MOCK) return fakeFetch(mockHealthScore);
  const { data } = await api.get(`/analytics/repo/${owner}/${repo}/insights`);
  return {
    repo_health_score: data.repo_health_score,
    activity_trend: data.activity_trend,
    risk_signals: data.risk_signals,
  };
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
