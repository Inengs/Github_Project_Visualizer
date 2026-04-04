interface DataErrorPanelProps {
  message: string;
  onRetry: () => void;
}

export default function DataErrorPanel({
  message,
  onRetry,
}: DataErrorPanelProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh] px-4">
      <div className="text-center max-w-sm">
        <p className="text-gray-600 dark:text-[#555] text-sm mb-2">
          Failed to load data
        </p>
        <p className="text-gray-400 dark:text-[#333] text-xs break-words">
          {message}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 border border-gray-300 dark:border-[#222] rounded-md text-[12px] text-gray-600 dark:text-[#666] hover:text-gray-900 dark:hover:text-[#aaa] transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
