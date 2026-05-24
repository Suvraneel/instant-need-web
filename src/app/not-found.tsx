import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center gap-6 bg-background">
      {/* Large numeric indicator */}
      <p className="text-9xl font-extrabold text-muted-foreground/20 select-none leading-none">
        404
      </p>

      <div className="space-y-2 -mt-4">
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted-foreground max-w-sm">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/" className={cn(buttonVariants())}>
          Go home
        </Link>
        <Link href="/products" className={cn(buttonVariants({ variant: "outline" }))}>
          Browse products
        </Link>
      </div>
    </div>
  );
}
