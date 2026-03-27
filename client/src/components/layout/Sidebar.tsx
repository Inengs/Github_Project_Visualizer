import {
  LayoutGrid,
  GitCommitHorizontal,
  CircleDot,
  GitPullRequest,
  Users,
  BarChart2,
  type LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
}

interface NavSection {
  section: string;
  items: NavItem[];
}

interface SidebarProps {
  owner: string;
  repo: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const NAV_SECTIONS: NavSection[] = [
  {
    section: "Project",
    items: [
      { label: "Overview", icon: LayoutGrid },
      { label: "Commits", icon: GitCommitHorizontal },
      { label: "Issues", icon: CircleDot },
      { label: "Pull requests", icon: GitPullRequest },
    ],
  },
  {
    section: "Insights",
    items: [
      { label: "Contributors", icon: Users },
      { label: "Analytics", icon: BarChart2 },
    ],
  },
];

export default function Sidebar({
  owner,
  repo,
  activeTab,
  onTabChange,
}: SidebarProps) {
  return (
    <aside className="w-[220px] flex-shrink-0 flex flex-col bg-[#080808] border-r border-[#161616]">
      {/* Brand */}
      <div className="flex items-center gap-2.5 px-[18px] py-5 border-b border-[#161616]">
        <svg width="16" height="14" viewBox="0 0 76 65" fill="#e1e1e1">
          <path d="M37.5274 0L75.0548 65H0L37.5274 0Z" />
        </svg>
        <span className="text-[13px] font-medium text-[#e1e1e1] tracking-[-0.01em]">
          Visualizer
        </span>
      </div>

      {/* Repo pill */}
      <div className="mx-2.5 mt-3 mb-1 px-3 py-2.5 bg-[#111] border border-[#1a1a1a] rounded-lg">
        <p className="text-[12px] font-medium text-[#e1e1e1] truncate">
          {owner} / {repo}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          <span className="w-[5px] h-[5px] rounded-full bg-[#3d9970] animate-pulse flex-shrink-0" />
          <span className="text-[10px] text-[#444]">synced 2 min ago</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-1">
        {NAV_SECTIONS.map(({ section, items }) => (
          <div key={section}>
            <p className="text-[10px] text-[#2e2e2e] tracking-[.07em] uppercase px-[18px] pt-4 pb-1.5">
              {section}
            </p>
            {items.map(({ label, icon: Icon }) => {
              const isActive = activeTab === label;
              return (
                <button
                  key={label}
                  onClick={() => onTabChange(label)}
                  className={`
                    flex items-center gap-2.5 w-full px-[18px] py-[7px]
                    text-[12px] text-left transition-colors duration-150
                    ${isActive ? "text-[#e1e1e1]" : "text-[#555] hover:text-[#aaa]"}
                  `}
                >
                  <Icon
                    size={13}
                    strokeWidth={1.5}
                    className={`flex-shrink-0 transition-colors duration-150
                      ${isActive ? "text-[#e1e1e1]" : "text-[#444]"}
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
