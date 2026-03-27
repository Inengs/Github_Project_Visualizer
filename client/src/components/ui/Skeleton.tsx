interface SkeletonProps {
  className?: string;
}

export default function Skeleton({ className }: SkeletonProps) {
  return <div className={`bg-[#161616] rounded animate-pulse ${className}`} />;
}
