import { RefreshCw, Search } from "lucide-react";
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
}

export default function NavBar({
  title,
  subtitle,
  range,
  onRangeChange,
  onRefresh,
  onSearch,
}: NavBarProps) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    const [owner, repo] = input.trim().split("/");
    if (!owner || !repo) return;
    onSearch(owner.trim(), repo.trim());
  };

  return (
    <header className="flex items-center justify-between px-6 py-3.5 border-b border-[#161616] bg-[#080808]">
      {/* LEFT */}
      <div>
        <h1 className="text-[13px] font-medium text-[#e1e1e1]">{title}</h1>
        <p className="text-[11px] text-[#333] mt-0.5">{subtitle}</p>
      </div>

      {/* CENTER SEARCH */}
      <div className="flex items-center bg-[#111] border border-[#1a1a1a] rounded-[6px] px-2 py-1.5 w-[320px]">
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
              ? "text-[#e1e1e1] border-[#2e2e2e] bg-[#141414]"
              : "text-[#444] border-[#1a1a1a] bg-transparent hover:text-[#aaa] hover:border-[#252525]"
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

        <div className="w-[1px] h-4 bg-[#1a1a1a]" />

        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-7 h-7 rounded-full bg-[#1a1a1a] border border-[#222] flex items-center justify-center text-[10px] text-[#666] group-hover:border-[#333] transition-colors">
            ZK
          </div>
          <span className="text-[11px] text-[#555] group-hover:text-[#888] transition-colors">
            Zik
          </span>
        </div>
      </div>
    </header>
  );
}
