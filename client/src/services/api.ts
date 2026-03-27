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
} from "../types/type";

import {
  mockRepo,
  mockStats,
  mockCommitActivity,
  mockCommitsPerDay,
  mockIssues,
  mockContributors,
  mockPullRequests,
  mockActivity,
  mockHealthScore,
} from "../data/mockData";

const USE_MOCK = true;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8000",
  timeout: 10000,
});

const fakeFetch = <T>(data: T, ms = 400): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(data), ms));

export async function fetchRepoOverview(
  owner: string,
  repo: string,
): Promise<Repo> {
  if (USE_MOCK) return fakeFetch({ ...mockRepo, owner, name: repo });
  const { data } = await api.get<Repo>(`/repo/${owner}/${repo}`);
  return data;
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
  const { data } = await api.get<CommitActivity>(
    `/repo/${owner}/${repo}/commits/activity`,
    { params: { range } },
  );
  return data;
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
  const { data } = await api.get<Issue[]>(`/repo/${owner}/${repo}/issues`);
  return data;
}

export async function fetchContributors(
  owner: string,
  repo: string,
): Promise<Contributor[]> {
  if (USE_MOCK) return fakeFetch(mockContributors);
  const { data } = await api.get<Contributor[]>(
    `/repo/${owner}/${repo}/contributors`,
  );
  return data;
}

export async function fetchPullRequests(
  owner: string,
  repo: string,
): Promise<PullRequest[]> {
  if (USE_MOCK) return fakeFetch(mockPullRequests);
  const { data } = await api.get<PullRequest[]>(`/repo/${owner}/${repo}/pulls`);
  return data;
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
  const { data } = await api.get<HealthScore>(`/repo/${owner}/${repo}/health`);
  return data;
}
