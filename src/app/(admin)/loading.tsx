import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown while admin route segments are loading.
 * Renders inside the (admin) layout shell (with AdminSidebar visible).
 */
export default function AdminLoading() {
  return (
    <div
      className="p-6 space-y-6"
      aria-busy="true"
      aria-label="Loading…"
    >
      {/* Header skeleton */}
      <div className="flex h-16 items-center border-b -mx-6 -mt-6 px-6">
        <Skeleton className="h-6 w-40" />
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>

      {/* Content area */}
      <Skeleton className="h-64 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
