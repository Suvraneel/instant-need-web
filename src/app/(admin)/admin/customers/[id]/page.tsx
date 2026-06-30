"use client";

import { use } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, FileDown } from "lucide-react";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminCustomer, useAdminCustomerAddresses } from "@/lib/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MapPin } from "lucide-react";

interface CustomerDetailPageProps {
  params: Promise<{ id: string }>;
}

const STATUS_BADGE: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

export default function CustomerDetailPage({ params }: CustomerDetailPageProps) {
  const { id } = use(params);
  const { data, isLoading } = useAdminCustomer(id);

  // The admin customer API response may have nested profile + orders
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const customer = data as any;

  const { data: fetchedAddresses } = useAdminCustomerAddresses(id, customer);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const addresses: any[] = customer?.addresses ?? fetchedAddresses ?? [];

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Customer" />
        <div className="p-6 space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  if (!customer) {
    return (
      <>
        <AdminHeader title="Customer" />
        <div className="p-6">
          <p className="text-muted-foreground">Customer not found.</p>
        </div>
      </>
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orders: any[] = customer.recentOrders ?? customer.orders ?? [];

  return (
    <>
      <AdminHeader
        title={customer.fullName ?? "Customer"}
        actions={
          <Link
            href="/admin/customers"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        }
      />
      <div className="p-6 space-y-5 max-w-4xl">
        {/* Profile */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Full Name</p>
                <p className="font-medium">{customer.fullName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Business</p>
                <p className="font-medium">{customer.businessName ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium">{customer.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Phone</p>
                <p className="font-medium">{customer.phoneNumber ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Joined</p>
                <p className="font-medium">
                  {customer.createdAt
                    ? format(new Date(customer.createdAt), "dd MMM yyyy")
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant={customer.active !== false ? "default" : "secondary"}
                  className="text-xs mt-0.5"
                >
                  {customer.active !== false ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats */}
        {(customer.orderCount !== undefined || customer.totalRevenue !== undefined) && (
          <div className="grid sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Orders
                </p>
                <p className="text-2xl font-bold mt-1">{customer.orderCount ?? 0}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold mt-1">
                  {formatCurrency(customer.totalRevenue ?? 0, "INR")}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">
                  Avg. Order Value
                </p>
                <p className="text-2xl font-bold mt-1">
                  {customer.orderCount
                    ? formatCurrency(
                        (customer.totalRevenue ?? 0) / customer.orderCount,
                        "INR"
                      )
                    : "—"}
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Addresses */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Saved Addresses</CardTitle>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2">
                <MapPin className="h-6 w-6 opacity-30" />
                <p className="text-sm">No saved addresses</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {addresses.map((addr: any, i: number) => {
                  const line1: string = addr.addressLine1 ?? addr.line1 ?? "";
                  const line2: string | undefined = addr.addressLine2 ?? addr.line2;
                  const isDefault: boolean = addr.isDefault ?? (addr.id === customer?.defaultShippingAddressId);
                  return (
                    <div key={addr.id ?? i} className="rounded-lg border p-4 text-sm space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{addr.fullName}</span>
                        {addr.label && (
                          <span className="text-xs bg-muted text-muted-foreground rounded-full px-2 py-0.5">
                            {addr.label}
                          </span>
                        )}
                        {isDefault && (
                          <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5">
                            Default
                          </span>
                        )}
                      </div>
                      {line1 && <p className="text-muted-foreground">{line1}{line2 ? `, ${line2}` : ""}</p>}
                      <p className="text-muted-foreground">
                        {addr.city}, {addr.state} {addr.postalCode}
                      </p>
                      <p className="text-muted-foreground">{addr.country}</p>
                      {addr.phoneNumber && (
                        <p className="text-muted-foreground">{addr.phoneNumber}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order History */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm">Order History</CardTitle>
            <Link
              href={`/admin/orders?customerId=${id}`}
              className="text-xs text-primary hover:underline"
            >
              View all
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {orders.length === 0 ? (
              <p className="text-sm text-muted-foreground p-5">No orders yet.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order #</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Invoice</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`text-xs ${STATUS_BADGE[order.status] ?? ""}`}
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(order.totalAmount, order.currencyCode ?? "INR")}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {order.placedAt
                          ? format(new Date(order.placedAt), "dd MMM yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        {order.invoiceUrl ? (
                          <a
                            href={order.invoiceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <FileDown className="h-3 w-3" />
                            Download
                          </a>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
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
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
