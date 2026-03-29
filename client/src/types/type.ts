export interface Repo {
  name: string;
  owner: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  health_score: number;
}

export interface Stats {
  total_commits: number;
  open_issues: number;
  pull_requests: number;
  contributors: number;
  commits_delta: string;
  issues_delta: string;
  prs_delta: string;
  contributors_delta: string;
}

export type Range = "7d" | "30d" | "90d" | "1y";

export interface CommitActivity {
  points: number[];
  dates: string[];
  total: number;
  change: string;
  range: string;
}

export interface CommitDay {
  day: string;
  count: number;
}

export type PRStatus = "open" | "merged" | "closed";

export interface PullRequest {
  id: string;
  title: string;
  author: string;
  status: PRStatus;
  time: string;
}

export type ActivityType = "push" | "issue" | "merge" | "release";

export interface ActivityItem {
  type: ActivityType;
  actor: string;
  text: string;
  time: string;
}

export interface HealthBreakdown {
  label: string;
  value: number;
  color: string;
}

export interface HealthScore {
  score: number;
  label: string;
  breakdown: HealthBreakdown[];
}

export interface Contributor {
  initials: string;
  name: string;
  commits: number;
  color: string;
  bg: string;
  pct: number;
}

export interface Issue {
  label: string;
  count: number;
  color: string;
  pct: number;
}
export interface RepoData {
  repoInfo: Repo;
  stats: Stats;
  commitActivity: CommitActivity;
  commitsPerDay: CommitDay[];
  issues: Issue[];
  contributors: Contributor[];
  pullRequests: PullRequest[];
  activity: ActivityItem[];
  healthScore: HealthScore;
}

export interface UseRepoDataReturn {
  data: RepoData | null;
  loading: boolean;
  error: string | null;
  range: Range;
  setRange: (range: Range) => void;
  refetch: () => void;
}

export type ReadmeExportFormat = "markdown" | "html" | "both";

export interface GenerateReadmeOptions {
  template_id?: string;
  export_format?: ReadmeExportFormat;
  use_openai?: boolean;
  openai_api_key?: string | null;
}

export interface GenerateReadmeResult {
  markdown: string;
  html: string | null;
  template_id: string;
  used_openai: boolean;
  pdf_export_hint: string;
}
