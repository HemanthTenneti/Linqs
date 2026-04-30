function SkeletonBlock({
  className,
}: {
  className: string;
}) {
  return <div className={`skeleton-shimmer rounded-[12px] ${className}`} />;
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <SkeletonBlock className="h-9 w-56" />
        <SkeletonBlock className="h-5 w-80 mt-3 max-w-full" />
      </section>

      <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <div className="flex items-center justify-between mb-4">
          <SkeletonBlock className="h-7 w-36" />
          <SkeletonBlock className="h-9 w-28" />
        </div>
        <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4 space-y-4">
          <SkeletonBlock className="h-32 w-full rounded-[14px]" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <SkeletonBlock className="h-14 w-full" />
            <SkeletonBlock className="h-14 w-full" />
          </div>
        </div>
      </section>

      <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
        <SkeletonBlock className="h-7 w-24 mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
          <SkeletonBlock className="h-24 w-full" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
          <SkeletonBlock className="h-16 w-full" />
        </div>
      </section>
    </div>
  );
}
