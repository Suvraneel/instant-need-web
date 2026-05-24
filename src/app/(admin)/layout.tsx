import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      <AdminSidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Individual admin pages render their own AdminHeader with a title */}
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
