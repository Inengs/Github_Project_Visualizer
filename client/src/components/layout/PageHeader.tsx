import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6 mb-6">
      <div className="min-w-0 flex-1">
        <h2 className="text-[15px] font-medium text-gray-900 dark:text-[#e1e1e1] tracking-[-0.02em]">
          {title}
        </h2>
        <p className="text-[11px] text-gray-500 dark:text-[#444] mt-1 max-w-xl leading-relaxed">
          {description}
        </p>
      </div>
      {children ? (
        <div className="flex flex-shrink-0 items-start gap-2">{children}</div>
      ) : null}
    </div>
  );
}
