import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";

export function StatCardSkeleton() {
  return (
    <MagicCard className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-12 w-12 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </MagicCard>
  );
}

export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <MagicCard className="p-6">
      <div className="space-y-4">
        {/* Chart title */}
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Chart area */}
        <div className={`${height} flex items-end gap-2 px-4`}>
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1"
              style={{
                height: `${30 + Math.random() * 70}%`,
              }}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex gap-4 justify-center">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-24" />
        </div>
      </div>
    </MagicCard>
  );
}

export function AnalyticsDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartSkeleton />
        <ChartSkeleton />
      </div>
    </div>
  );
}
