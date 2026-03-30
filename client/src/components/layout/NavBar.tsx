import { RefreshCw, Search, FileText } from "lucide-react";
import { Moon, Sun } from "lucide-react";
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
}

export default function NavBar({
  title,
  subtitle,
  range,
  onRangeChange,
  onRefresh,
  onSearch,
  onGenerateReadme,
  theme,
  onThemeToggle,
}: NavBarProps) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    const [owner, repo] = input.trim().split("/");
    if (!owner || !repo) return;
    onSearch(owner.trim(), repo.trim());
  };

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-gray-200 dark:border-[#161616] bg-white dark:bg-[#080808]">
      {/* LEFT */}
      <div>
        <h1 className="text-[13px] font-medium text-black dark:text-[#e1e1e1]">
          {title}
        </h1>
        <p className="text-[11px] text-gray-400 dark:text-[#333] mt-0.5">
          {subtitle}
        </p>
      </div>

      {/* CENTER SEARCH */}
      <div className="flex items-center bg-gray-100 dark:bg-[#111] border border-gray-200 dark:border-[#1a1a1a] rounded-[6px] px-2 py-1.5 w-[320px]">
        <Search size={12} className="text-[#444]" />

        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="owner/repo (e.g. facebook/react)"
          className="bg-transparent outline-none text-[11px] text-[#ccc] ml-2 w-full placeholder:text-[#444]"
        />
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-3">
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

        <button
          onClick={onRefresh}
          title="Refresh data"
          className="w-7 h-7 flex items-center justify-center border border-[#1a1a1a] rounded-[5px] hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-150 group"
        >
          <RefreshCw
            size={11}
            className="text-[#444] group-hover:text-[#888] transition-colors"
          />
        </button>

        {onGenerateReadme && (
          <button
            type="button"
            onClick={onGenerateReadme}
            title="Generate README from analytics"
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] border border-[#1a1a1a] text-[11px] text-[#666] hover:text-[#aaa] hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-150"
          >
            <FileText size={11} />
            Generate README
          </button>
        )}

        <div className="w-[1px] h-4 bg-[#1a1a1a]" />
        <button
          onClick={onThemeToggle}
          title="Toggle theme"
          className="w-7 h-7 flex items-center justify-center border border-[#1a1a1a] rounded-[5px] hover:border-[#2a2a2a] hover:bg-[#111] transition-all duration-150 group"
        >
          {theme === "dark" ? (
            <Sun
              size={11}
              className="text-[#444] group-hover:text-[#888] transition-colors"
            />
          ) : (
            <Moon
              size={11}
              className="text-[#444] group-hover:text-[#888] transition-colors"
            />
          )}
        </button>

        <div className="w-[1px] h-4 bg-gray-200 dark:bg-[#1a1a1a]" />

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[10px] text-[#666] group-hover:border-[#333] transition-colors">
            ZK
          </div>
          {/* <span className="text-[11px] text-[#555] group-hover:text-[#888] transition-colors">
            Zik
          </span> */}
        </div>
      </div>
    </header>
  );
}
