import { Skeleton } from "@/components/ui/skeleton";

/**
 * Shown by Next.js while the customer route segment is loading.
 * Renders inside the (customer) layout shell (with Navbar/Footer visible).
 */
export default function CustomerLoading() {
  return (
    <div
      id="main-content"
      className="max-w-7xl mx-auto px-4 py-8 space-y-6"
      aria-busy="true"
      aria-label="Loading page content…"
    >
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}
