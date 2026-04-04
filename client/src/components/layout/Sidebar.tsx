import {
  LayoutGrid,
  GitCommitHorizontal,
  CircleDot,
  GitPullRequest,
  Users,
  BarChart2,
  type LucideIcon,
} from "lucide-react";

import { useNavigate, useLocation } from "react-router-dom";

interface NavItem {
  label: string;
  icon: LucideIcon;
  path: string;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface SidebarProps {
  owner: string;
  repo: string;
  onNavigate: () => void;
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: "Project",
    items: [
      { label: "Overview", icon: LayoutGrid, path: "/dashboard" },
      {
        label: "Commits",
        icon: GitCommitHorizontal,
        path: "/dashboard/commits",
      },
      { label: "Issues", icon: CircleDot, path: "/dashboard/issues" },
      {
        label: "Pull requests",
        icon: GitPullRequest,
        path: "/dashboard/pulls",
      },
    ],
  },
  {
    section: "Insights",
    items: [
      {
        label: "Contributors",
        icon: Users,
        path: "/dashboard/contributors",
      },
      {
        label: "Analytics",
        icon: BarChart2,
        path: "/dashboard/analytics",
      },
    ],
  },
];

export default function Sidebar({ owner, repo, onNavigate }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const path =
    location.pathname.replace(/\/$/, "") || "/";

  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-white dark:bg-[#080808] border-r border-gray-200 dark:border-[#161616]">
      <div className="flex items-center gap-2.5 px-[18px] py-5 border-b border-gray-200 dark:border-[#161616]">
        <svg
          width="16"
          height="14"
          viewBox="0 0 76 65"
          fill="currentColor"
          className="text-black dark:text-[#e1e1e1]"
        >
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        <span className="text-[13px] font-medium text-black dark:text-[#e1e1e1] tracking-[-0.01em]">
          Visualizer
        </span>
      </div>

      <div className="mx-2.5 mt-3 mb-1 px-3 py-2.5 bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-lg">
        <p className="text-[12px] font-medium text-black dark:text-[#e1e1e1] truncate">
          {owner} / {repo}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-[5px] h-[5px] rounded-full bg-[#3d9970] animate-pulse flex-shrink-0" />
          <span className="text-[10px] text-gray-400 dark:text-[#444]">
            synced 2 min ago
          </span>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-1">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[10px] text-gray-300 dark:text-[#2e2e2e] tracking-[.07em] uppercase px-[18px] pt-4 pb-1.5">
              {section}
            </p>

            {items.map(({ label, icon: Icon, path: to }) => {
              const isActive = path === to;

              return (
                <button
                  key={label}
                  onClick={() => {
                    navigate(to);
                    onNavigate();
                  }}
                  className={`
                    flex items-center gap-2.5 w-full px-[14px] py-[7px] mx-1.5 rounded-md
                    text-[12px] text-left transition-colors duration-150
                    ${
                      isActive
                        ? "text-black dark:text-[#e1e1e1] bg-gray-100 dark:bg-[#121212] border border-gray-200 dark:border-[#1c1c1c]"
                        : "text-gray-400 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] border border-transparent hover:bg-gray-50 dark:hover:bg-[#0c0c0c]"
                    }
                  `}
                >
                  <Icon
                    size={13}
                    strokeWidth={1.5}
                    className={`flex-shrink-0 transition-colors duration-150
                        ${
                          isActive
                            ? "text-black dark:text-[#e1e1e1]"
                            : "text-gray-300 dark:text-[#444]"
                        }
                    `}
                  />
                  {label}
                </button>
              );
            })}
          </div>
        ))}
      </nav>
    </aside>
  );
}
