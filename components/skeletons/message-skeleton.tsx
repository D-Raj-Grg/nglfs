import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";

export function MessageSkeleton() {
  return (
    <MagicCard className="p-6">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          {/* Message content */}
          <div className="flex-1 space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>

        {/* Bottom actions */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-800">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-8 w-32" />
        </div>
      </div>
    </MagicCard>
  );
}

export function MessageListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <MessageSkeleton key={i} />
      ))}
    </div>
  );
}
