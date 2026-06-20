"use client";

import { useMemo } from "react";
import Link from "next/link";
import {
  ShoppingCart,
  IndianRupee,
  Users,
  Package,
  Clock,
} from "lucide-react";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { StatCard, StatCardSkeleton } from "@/components/admin/StatCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { TopProductsChart } from "@/components/admin/TopProductsChart";
import {
  useDashboardSummary,
  useSalesReport,
  useTopProducts,
  useCustomerActivity,
} from "@/lib/hooks/useReports";
import { formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  SHIPPED: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
};

export default function DashboardPage() {
  // Use last 30 days for charts
  const from = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  }, []);
  const to = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const { data: summary, isLoading: summaryLoading } = useDashboardSummary();
  const { data: salesData, isLoading: salesLoading } = useSalesReport({ from, to });
  const { data: topProducts, isLoading: topLoading } = useTopProducts({ limit: 6 });
  const { data: customerActivity, isLoading: activityLoading } = useCustomerActivity({ limit: 5 });

  return (
    <>
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {summaryLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              <StatCard
                title="Revenue This Month"
                value={formatCurrency(summary?.revenueThisMonth ?? 0, "INR")}
                icon={IndianRupee}
                color="green"
              />
              <StatCard
                title="Total Orders"
                value={summary?.totalOrders ?? 0}
                sub={`${summary?.pendingOrders ?? 0} pending`}
                icon={ShoppingCart}
                color="blue"
              />
              <StatCard
                title="Customers"
                value={summary?.totalCustomers ?? 0}
                sub={`+${summary?.newCustomersThisMonth ?? 0} this month`}
                icon={Users}
                color="purple"
              />
              <StatCard
                title="Active Products"
                value={summary?.activeProducts ?? 0}
                icon={Package}
                color="amber"
              />
            </>
          )}
        </div>

        {/* Charts row */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <RevenueChart data={salesData?.breakdown ?? []} isLoading={salesLoading} />
          </div>
          <div className="lg:col-span-2">
            <TopProductsChart data={topProducts ?? []} isLoading={topLoading} />
          </div>
        </div>

        {/* Recent Activity row */}
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Pending Orders quick view */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Orders to Process</CardTitle>
              <Link
                href="/admin/orders?status=PENDING"
                className="text-xs text-primary hover:underline"
              >
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {(
                    [
                      { label: "Pending", count: summary?.pendingOrders ?? 0, status: "PENDING" },
                      { label: "Processing", count: summary?.processingOrders ?? 0, status: "PROCESSING" },
                      { label: "Shipped", count: summary?.shippedOrders ?? 0, status: "SHIPPED" },
                    ] as const
                  ).map(({ label, count, status }) => (
                    <Link
                      key={status}
                      href={`/admin/orders?status=${status}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{label}</span>
                      </div>
                      <Badge
                        className={`text-xs font-medium ${STATUS_COLOR[status]}`}
                        variant="outline"
                      >
                        {count}
                      </Badge>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top Customers */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Top Customers (30 days)</CardTitle>
              <Link href="/admin/customers" className="text-xs text-primary hover:underline">
                View all
              </Link>
            </CardHeader>
            <CardContent>
              {activityLoading ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-9 w-full" />
                  ))}
                </div>
              ) : !customerActivity?.length ? (
                <p className="text-sm text-muted-foreground py-4 text-center">
                  No activity yet
                </p>
              ) : (
                <div className="space-y-1">
                  {customerActivity.map((c) => (
                    <Link
                      key={c.customerId}
                      href={`/admin/customers/${c.customerId}`}
                      className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-muted transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{c.fullName}</p>
                        {c.businessName && (
                          <p className="text-xs text-muted-foreground truncate">
                            {c.businessName}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-sm font-medium">
                          {formatCurrency(c.totalRevenue, "INR")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {c.orderCount} orders
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
