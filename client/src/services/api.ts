import axios from "axios";

import type {
  Repo,
  Stats,
  CommitActivity,
  CommitDay,
  Issue,
  Contributor,
  PullRequest,
  ActivityItem,
  HealthScore,
  Range,
  GenerateReadmeOptions,
  GenerateReadmeResult,
} from "../types/type";

import {
  // mockRepo,
  mockStats,
  // mockCommitActivity,
  mockCommitsPerDay,
  // mockIssues,
  // mockContributors,
  // mockPullRequests,
  mockActivity,
  // mockHealthScore,
} from "../data/mockData";

const USE_MOCK = false;

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
  const { data } = await api.get(`/repo/${owner}/${repo}`);
  return {
    name: data.name,
    owner,
    description: data.description ?? "",
    language: data.language ?? "",
    stars: data.stars,
    forks: data.forks,
    health_score: 0, // comes from /analytics endpoint separately
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
): Promise<CommitActivity> {
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

export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<Contributor[]> {
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
  const { data } = await api.get(`/repo/${owner}/${repo}/pulls`, {
    params: { state: "all", per_page: 10 },
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
  const { data } = await api.get(`/analytics/repo/${owner}/${repo}/insights`);
  return {
    score: data.repo_health_score,
    label: data.activity_trend,
    breakdown: data.risk_signals.map((s: string, i: number) => ({
      label: s,
      value: 100 - i * 15,
      color: "#3d9970",
    })),
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
