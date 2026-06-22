"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { format } from "date-fns";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useAdminOrders } from "@/lib/hooks/useAdmin";
import { calcTotalPages } from "@/lib/types/common";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/order";

const STATUS_OPTIONS: { label: string; value: string }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

function OrdersContent() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<string>(
    searchParams.get("status") ?? "ALL"
  );
  const [page, setPage] = useState(1); // 1-indexed to match backend

  const params = {
    status: status === "ALL" ? undefined : (status as OrderStatus),
    page,
    size: 20,
  };

  const { data, isLoading } = useAdminOrders(params);
  const orders = data?.items ?? [];
  const totalPgs = data ? calcTotalPages(data) : 0;

  return (
    <>
      <AdminHeader title="Orders" />
      <div className="p-6 space-y-4">
        {/* Status tabs */}
        <Tabs
          value={status}
          onValueChange={(v) => {
            setStatus(v);
            setPage(1);
          }}
        >
          <TabsList className="flex-wrap h-auto gap-1 bg-muted/50">
            {STATUS_OPTIONS.map((opt) => (
              <TabsTrigger key={opt.value} value={opt.value}>
                {opt.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Table */}
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Items</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Placed</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 7 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : orders.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-12 text-muted-foreground"
                  >
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {order.orderNumber}
                    </TableCell>
                    <TableCell className="text-sm">
                      <p className="font-medium">{order.customerName || "—"}</p>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-xs ${STATUS_BADGE[order.status] ?? ""}`}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {order.itemCount}
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      {formatCurrency(order.totalAmount, order.currencyCode)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(order.placedAt), "dd MMM yyyy")}
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-primary hover:underline"
                      >
                        View
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && totalPgs > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Page {data.page} of {totalPgs} — {data.total} orders
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= totalPgs}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminHeader title="Orders" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        </>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}
