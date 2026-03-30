import { useCallback, useState } from "react";
import axios from "axios";
import { X, Copy, Download, FileText, Sparkles } from "lucide-react";

import { generateReadme } from "../../services/api";
import type { GenerateReadmeResult, ReadmeExportFormat } from "../../types/type";

interface GenerateReadmeModalProps {
  open: boolean;
  onClose: () => void;
  owner: string;
  repo: string;
}

const FORMATS: ReadmeExportFormat[] = ["both", "markdown", "html"];

function downloadText(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function GenerateReadmeModal({
  open,
  onClose,
  owner,
  repo,
}: GenerateReadmeModalProps) {
  const [exportFormat, setExportFormat] = useState<ReadmeExportFormat>("both");
  const [useOpenai, setUseOpenai] = useState(false);
  const [openaiKey, setOpenaiKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GenerateReadmeResult | null>(null);

  const runGenerate = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await generateReadme(owner, repo, {
        export_format: exportFormat,
        use_openai: useOpenai,
        openai_api_key: openaiKey.trim() ? openaiKey.trim() : undefined,
      });
      setResult(data);
    } catch (e: unknown) {
      let msg = "Failed to generate README";
      if (axios.isAxiosError(e)) {
        const d = e.response?.data;
        if (d && typeof d === "object" && d !== null && "detail" in d) {
          msg = String((d as { detail: unknown }).detail);
        } else if (e.message) {
          msg = e.message;
        }
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [owner, repo, exportFormat, useOpenai, openaiKey]);

  const copyMarkdown = useCallback(async () => {
    if (!result?.markdown) return;
    await navigator.clipboard.writeText(result.markdown);
  }, [result]);

  if (!open) return null;

  const slug = `${owner}-${repo}`.replace(/[^a-zA-Z0-9._-]+/g, "_");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="readme-modal-title"
    >
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-lg border border-[#222] bg-[#0c0c0c] shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          <div className="flex items-center gap-2">
            <FileText size={14} className="text-[#666]" />
            <h2
              id="readme-modal-title"
              className="text-[13px] font-medium text-[#e1e1e1]"
            >
              Generate README
            </h2>
            <span className="text-[11px] text-[#444]">
              {owner}/{repo}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded border border-transparent hover:border-[#2a2a2a] text-[#555] hover:text-[#aaa]"
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3 items-end">
            <label className="flex flex-col gap-1 text-[11px] text-[#666]">
              Export
              <select
                value={exportFormat}
                onChange={(e) =>
                  setExportFormat(e.target.value as ReadmeExportFormat)
                }
                className="bg-[#111] border border-[#222] rounded px-2 py-1.5 text-[11px] text-[#ccc] min-w-[120px]"
              >
                {FORMATS.map((f) => (
                  <option key={f} value={f}>
                    {f}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-2 text-[11px] text-[#888] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={useOpenai}
                onChange={(e) => setUseOpenai(e.target.checked)}
                className="rounded border-[#333] bg-[#111]"
              />
              <Sparkles size={12} className="text-[#666]" />
              OpenAI narrative (optional key)
            </label>

            <button
              type="button"
              onClick={runGenerate}
              disabled={loading}
              className="ml-auto px-3 py-1.5 rounded-md text-[11px] border border-[#2a2a2a] bg-[#141414] text-[#ccc] hover:border-[#3a3a3a] hover:text-[#eee] disabled:opacity-50"
            >
              {loading ? "Generating…" : "Generate"}
            </button>
          </div>

          {useOpenai && (
            <label className="flex flex-col gap-1 text-[11px] text-[#666]">
              OpenAI API key (sent only to your backend for this request; not stored
              here)
              <input
                type="password"
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                autoComplete="off"
                placeholder="sk-… or leave empty to use server OPENAI_API_KEY"
                className="bg-[#111] border border-[#222] rounded px-2 py-1.5 text-[11px] text-[#ccc] font-mono"
              />
            </label>
          )}

          {error && (
            <p className="text-[11px] text-red-400/90 border border-red-900/40 rounded px-2 py-1.5 bg-red-950/20">
              {error}
            </p>
          )}

          {result && (
            <>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyMarkdown}
                  disabled={!result.markdown}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#252525] text-[11px] text-[#aaa] hover:text-[#ddd] disabled:opacity-40"
                >
                  <Copy size={12} />
                  Copy Markdown
                </button>
                <button
                  type="button"
                  onClick={() =>
                    result.markdown &&
                    downloadText(
                      `${slug}-README.md`,
                      result.markdown,
                      "text/markdown;charset=utf-8",
                    )
                  }
                  disabled={!result.markdown}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#252525] text-[11px] text-[#aaa] hover:text-[#ddd] disabled:opacity-40"
                >
                  <Download size={12} />
                  README.md
                </button>
                <button
                  type="button"
                  onClick={() =>
                    result.html &&
                    downloadText(
                      `${slug}-README.html`,
                      result.html,
                      "text/html;charset=utf-8",
                    )
                  }
                  disabled={!result.html}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#252525] text-[11px] text-[#aaa] hover:text-[#ddd] disabled:opacity-40"
                >
                  <Download size={12} />
                  README.html
                </button>
              </div>
              <p className="text-[10px] text-[#555] leading-relaxed">
                {result.pdf_export_hint}
                {result.used_openai
                  ? " OpenAI narrative was included."
                  : useOpenai
                    ? " OpenAI was not used (no key or request failed)."
                    : ""}
              </p>
              <textarea
                readOnly
                value={result.markdown}
                className="w-full min-h-[220px] text-[11px] font-mono leading-relaxed bg-[#080808] border border-[#1a1a1a] rounded p-2 text-[#bbb] resize-y"
                spellCheck={false}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}
