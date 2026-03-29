interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={`bg-gray-200 dark:bg-[#161616] rounded animate-pulse ${className}`}
    />
  );
}
