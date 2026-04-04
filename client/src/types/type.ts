export interface Repo {
  name: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
}

export interface RepoAnalytics {
  owner: string;
  repo: string;
  latest: Repo;
  previous: Repo | null;
  stars_delta: number;
  forks_delta: number;
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
  date: string;
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
  repo_health_score: number;
  activity_trend: string;
  risk_signals: string[];
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

/** Row on the Issues page (distinct from aggregate Issue stats). */
export type IssueRowState = "open" | "closed";

export interface IssueRowLabel {
  name: string;
  color: string;
}

export interface IssueListItem {
  number: number;
  title: string;
  state: IssueRowState;
  author: string;
  labels: IssueRowLabel[];
  comments: number;
  time: string;
}

/** Single commit row for the Commits page */
export interface CommitListItem {
  sha: string;
  message: string;
  author: string;
  author_initials: string;
  branch: string;
  time: string;
}

export interface RepoData {
  repoInfo: Repo;
  stats: Stats;
  commitActivity: CommitActivity;
  commitsPerDay: CommitDay[];
  issues: Issue[];
  issueList: IssueListItem[];
  commitList: CommitListItem[];
  contributors: Contributor[];
  pullRequests: PullRequest[];
  activity: ActivityItem[];
  healthScore: HealthScore;
  languages: Language[];
}

/** React Router outlet context from `DashboardLayout`. */
export interface DashboardLayoutContextValue {
  owner: string;
  repo: string;
  data: RepoData | null;
  loading: boolean;
  error: string | null;
  range: Range;
  setRange: (r: Range) => void;
  refetch: () => void;
  readmeModalOpen: boolean;
  setReadmeModalOpen: (open: boolean) => void;
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

export interface Language {
  name: string;
  percentage: number;
  color: string;
}
