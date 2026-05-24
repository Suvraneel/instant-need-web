"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CustomerError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error("[CustomerError]", error);
  }, [error]);

  return (
    <div
      id="main-content"
      className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center gap-5"
    >
      <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl font-semibold">Something went wrong</h2>
        <p className="text-sm text-muted-foreground max-w-xs">
          An error occurred while loading this page.
        </p>
        {error.digest && (
          <p className="text-xs font-mono text-muted-foreground/50">
            {error.digest}
          </p>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} size="sm">
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          Retry
        </Button>
        <Link href="/home" className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
          Go home
        </Link>
      </div>
    </div>
  );
}
