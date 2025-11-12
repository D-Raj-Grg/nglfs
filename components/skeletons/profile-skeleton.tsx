import { Skeleton } from "@/components/ui/skeleton";
import { MagicCard } from "@/components/ui/magic-card";

export function ProfileSkeleton() {
  return (
    <MagicCard className="p-8">
      <div className="space-y-6">
        {/* Avatar */}
        <div className="flex justify-center">
          <Skeleton className="h-32 w-32 rounded-full" />
        </div>

        {/* Form fields */}
        <div className="space-y-4">
          {/* Username */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Display name */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-lg" />
          </div>

          {/* Bio */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-24 rounded-lg" />
          </div>
        </div>
      </div>
    </MagicCard>
  );
}

export function ProfileCardSkeleton() {
  return (
    <MagicCard className="p-6">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </MagicCard>
  );
}
