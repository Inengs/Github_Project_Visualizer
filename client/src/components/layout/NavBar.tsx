import { RefreshCw, Search, Sun, Moon, FileText, Menu } from "lucide-react";
import type { Range } from "../../types/type";
import { useState } from "react";

const RANGES: Range[] = ["7d", "30d", "90d", "1y"];

interface NavBarProps {
  title: string;
  subtitle: string;
  range: Range;
  onRangeChange: (range: Range) => void;
  onRefresh: () => void;
  onSearch: (owner: string, repo: string) => void;
  theme: "dark" | "light";
  onThemeToggle: () => void;
  onGenerateReadme: () => void;
  onMenuToggle: () => void;
}

export default function NavBar({
  title,
  subtitle,
  range,
  onRangeChange,
  onRefresh,
  onSearch,
  theme,
  onThemeToggle,
  onGenerateReadme,
  onMenuToggle,
}: NavBarProps) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    const [owner, repo] = input.trim().split("/");
    if (!owner || !repo) return;
    onSearch(owner.trim(), repo.trim());
    setInput("");
  };

  return (
    <header className="flex items-center gap-2 px-4 sm:px-6 py-3.5 border-b border-gray-200 dark:border-[#161616] bg-white dark:bg-[#080808] min-w-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden w-7 h-7 flex items-center justify-center text-gray-400 dark:text-[#555] hover:text-gray-700 dark:hover:text-[#aaa] transition-colors flex-shrink-0"
      >
        <Menu size={16} />
      </button>

      {/* Title */}
      <div className="hidden sm:block flex-shrink-0 min-w-0">
        <h1 className="text-[13px] font-medium text-black dark:text-[#e1e1e1] truncate">
          {title}
        </h1>
        <p className="text-[11px] text-gray-400 dark:text-[#333] mt-0.5 truncate">
          {subtitle}
        </p>
      </div>

      {/* Search — takes remaining space */}
      <div className="flex items-center bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-[6px] px-2 py-1.5 flex-1 min-w-0 max-w-[320px] mx-auto sm:mx-2">
        <Search
          size={12}
          className="text-gray-400 dark:text-[#444] flex-shrink-0"
        />
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="owner/repo"
          className="bg-transparent outline-none text-[11px] text-gray-800 dark:text-[#ccc] ml-2 w-full min-w-0 placeholder:text-gray-400 dark:placeholder:text-[#444]"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 flex-shrink-0 ml-auto">
        {/* Range buttons — hidden on mobile and tablet */}
        <div className="hidden lg:flex items-center gap-1">
          {RANGES.map((r) => (
            <button
              key={r}
              onClick={() => onRangeChange(r)}
              className={`px-2.5 py-1 rounded-[5px] text-[11px] border transition-all duration-150
            ${
              range === r
                ? "text-black dark:text-[#e1e1e1] border-gray-400 dark:border-[#2e2e2e] bg-gray-100 dark:bg-[#141414]"
                : "text-gray-400 dark:text-[#444] border-gray-200 dark:border-[#1a1a1a] hover:text-gray-700 dark:hover:text-[#aaa]"
            }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* On mobile show active range only as a pill */}
        <div className="lg:hidden">
          <span className="px-2 py-1 rounded-[5px] text-[11px] border border-gray-200 dark:border-[#2e2e2e] bg-gray-100 dark:bg-[#141414] text-black dark:text-[#e1e1e1]">
            {range}
          </span>
        </div>

        <button
          onClick={onRefresh}
          title="Refresh"
          className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-[#1a1a1a] rounded-[5px] hover:border-gray-300 dark:hover:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-150 group"
        >
          <RefreshCw
            size={11}
            className="text-gray-400 dark:text-[#444] group-hover:text-gray-700 dark:group-hover:text-[#888] transition-colors"
          />
        </button>

        <button
          onClick={onGenerateReadme}
          title="Generate README"
          className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-[#1a1a1a] rounded-[5px] hover:border-gray-300 dark:hover:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-150 group"
        >
          <FileText
            size={11}
            className="text-gray-400 dark:text-[#444] group-hover:text-gray-700 dark:group-hover:text-[#888] transition-colors"
          />
        </button>

        <button
          onClick={onThemeToggle}
          title="Toggle theme"
          className="w-7 h-7 flex items-center justify-center border border-gray-200 dark:border-[#1a1a1a] rounded-[5px] hover:border-gray-300 dark:hover:border-[#2a2a2a] hover:bg-gray-100 dark:hover:bg-[#111] transition-all duration-150 group"
        >
          {theme === "dark" ? (
            <Sun
              size={11}
              className="text-gray-400 dark:text-[#444] group-hover:text-gray-700 dark:group-hover:text-[#888] transition-colors"
            />
          ) : (
            <Moon
              size={11}
              className="text-gray-400 dark:text-[#444] group-hover:text-gray-700 dark:group-hover:text-[#888] transition-colors"
            />
          )}
        </button>

        {/* <div className="w-[1px] h-4 bg-gray-200 dark:bg-[#1a1a1a] mx-1" />

          <div className="flex items-center gap-1.5 cursor-pointer group">
            <div className="w-7 h-7 rounded-full bg-gray-100 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#222] flex items-center justify-center text-[10px] text-gray-500 dark:text-[#666] group-hover:border-gray-300 dark:group-hover:border-[#333] transition-colors flex-shrink-0">
              ZK
            </div>
            <span className="hidden sm:block text-[11px] text-gray-400 dark:text-[#555] group-hover:text-gray-700 dark:group-hover:text-[#888] transition-colors">
              Zik
            </span>
          </div> */}
      </div>
    </header>
  );
}
