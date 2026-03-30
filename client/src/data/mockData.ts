import type {
  Repo,
  Stats,
  CommitActivity,
  CommitDay,
  Range,
  Issue,
  Contributor,
  PullRequest,
  ActivityItem,
  HealthScore,
} from "../types/type";

export const mockRepo: Repo = {
  name: "Inengs",
  description: "The React Framework for the Web",
  language: "JavaScript",
  stars: 118000,
  forks: 24800,
  topics: ["react", "typescript", "dashboard", "github"],
};

export const mockStats: Stats = {
  total_commits: 1482,
  open_issues: 238,
  pull_requests: 87,
  contributors: 3100,
  commits_delta: "+12%",
  issues_delta: "+4 today",
  prs_delta: "3 merged today",
  contributors_delta: "Active community",
};

export const mockCommitActivity: Record<Range, CommitActivity> = {
  "7d": {
    points: [18, 20, 19, 22, 21, 24, 26],
    dates: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    total: 312,
    change: "+8%",
    range: "Mon → Sun",
  },
  "30d": {
    points: [
      18, 19, 19, 20, 20, 21, 21, 22, 22, 23, 24, 24, 25, 26, 26, 27, 28, 28,
      29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 40, 42,
    ],
    dates: ["Jan 1", "Jan 8", "Jan 15", "Jan 22", "Jan 30"],
    total: 1482,
    change: "+12%",
    range: "Jan 1 → Jan 30",
  },
  "90d": {
    points: [
      12, 13, 13, 14, 15, 16, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27,
      28, 29, 30, 32, 33, 35, 36, 38, 40, 41, 43, 45,
    ],
    dates: ["Oct", "Nov", "Dec", "Jan"],
    total: 4210,
    change: "+24%",
    range: "Oct → Jan",
  },
  "1y": {
    points: [
      8, 9, 10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 30, 32, 34, 36, 38,
      40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60,
    ],
    dates: ["Jan", "Mar", "May", "Jul", "Sep", "Dec"],
    total: 14800,
    change: "+41%",
    range: "Jan → Dec",
  },
};

export const mockCommitsPerDay: CommitDay[] = [
  { day: "Mon", count: 8 },
  { day: "Tue", count: 12 },
  { day: "Wed", count: 6 },
  { day: "Thu", count: 14 },
  { day: "Fri", count: 10 },
  { day: "Sat", count: 4 },
  { day: "Sun", count: 3 },
];

export const mockIssues: Issue[] = [
  { label: "Closed", count: 380, color: "#3d9970", pct: 84 },
  { label: "Open", count: 238, color: "#6b7280", pct: 53 },
  { label: "Bug", count: 82, color: "#ef4444", pct: 36 },
  { label: "Feature", count: 64, color: "#3b82f6", pct: 28 },
  { label: "Docs", count: 42, color: "#f59e0b", pct: 15 },
];

export const mockContributors: Contributor[] = [
  {
    initials: "TN",
    name: "timneutkens",
    commits: 245,
    color: "#7c8cf8",
    bg: "#12122a",
    pct: 100,
  },
  {
    initials: "SH",
    name: "shuding",
    commits: 191,
    color: "#5db87a",
    bg: "#0f2a1a",
    pct: 78,
  },
  {
    initials: "IJ",
    name: "ijjk",
    commits: 152,
    color: "#e07070",
    bg: "#2a1212",
    pct: 62,
  },
  {
    initials: "BK",
    name: "balazsorban44",
    commits: 118,
    color: "#d4914a",
    bg: "#251a08",
    pct: 48,
  },
  {
    initials: "HU",
    name: "huozhi",
    commits: 88,
    color: "#a78cf8",
    bg: "#12122a",
    pct: 36,
  },
];

export const mockPullRequests: PullRequest[] = [
  {
    id: "#52341",
    title: "feat: app router parallel routes support",
    author: "timneutkens",
    status: "merged",
    time: "2h ago",
  },
  {
    id: "#52338",
    title: "fix: hydration mismatch in server components",
    author: "shuding",
    status: "open",
    time: "4h ago",
  },
  {
    id: "#52330",
    title: "chore: upgrade turbopack dependencies",
    author: "ijjk",
    status: "open",
    time: "6h ago",
  },
  {
    id: "#52318",
    title: "docs: update middleware configuration guide",
    author: "balazsorban44",
    status: "merged",
    time: "1d ago",
  },
  {
    id: "#52310",
    title: "perf: optimize image component rendering",
    author: "huozhi",
    status: "closed",
    time: "1d ago",
  },
];

export const mockActivity: ActivityItem[] = [
  {
    type: "push",
    actor: "timneutkens",
    text: "pushed 3 commits to main",
    time: "2m",
  },
  {
    type: "issue",
    actor: "shuding",
    text: "opened issue · hydration error",
    time: "18m",
  },
  {
    type: "merge",
    actor: "ijjk",
    text: "merged PR #52341 into main",
    time: "2h",
  },
  {
    type: "push",
    actor: "huozhi",
    text: "pushed 7 commits to canary",
    time: "3h",
  },
  {
    type: "release",
    actor: "balazsorban44",
    text: "released v14.2.1",
    time: "5h",
  },
];

export const mockHealthScore: HealthScore = {
  repo_health_score: 82,
  activity_trend: "increasing",
  risk_signals: ["low documentation", "no recent releases"],
};
