import type { ReactNode } from "react";
import Link from "next/link";
import { Package2 } from "lucide-react";
import { InstantNeedIcon, InstantNeedWordmark } from "@/components/ui/brand";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 px-4 py-12">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mb-8">
        <InstantNeedIcon size={32} />
        <InstantNeedWordmark className="text-xl" />
      </Link>

      {/* Card shell — pages fill this */}
      <main id="main-content" className="w-full max-w-md">{children}</main>

      <p className="mt-8 text-xs text-muted-foreground">
        © {new Date().getFullYear()} InstantNeed. All rights reserved.
      </p>
    </div>
  );
}
