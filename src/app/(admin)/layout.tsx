"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/stores/authStore";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin/dashboard");
    } else if (user?.role !== "ADMIN") {
      router.replace("/home");
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || user?.role !== "ADMIN") return null;

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <main id="main-content" className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
