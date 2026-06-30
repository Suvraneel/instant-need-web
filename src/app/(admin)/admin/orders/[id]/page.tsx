"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, FileDown } from "lucide-react";
import { toast } from "sonner";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAdminOrder, useUpdateOrderStatus, useRegenerateInvoice } from "@/lib/hooks/useAdmin";
import { getApiError } from "@/lib/errors";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/order";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Link from "next/link";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const STATUS_BADGE: Record<OrderStatus, string> = {
  PENDING: "bg-yellow-100 text-yellow-800 border-yellow-200",
  PROCESSING: "bg-blue-100 text-blue-800 border-blue-200",
  SHIPPED: "bg-purple-100 text-purple-800 border-purple-200",
  DELIVERED: "bg-green-100 text-green-800 border-green-200",
  CANCELLED: "bg-red-100 text-red-800 border-red-200",
};

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { data: order, isLoading } = useAdminOrder(id);
  const updateStatus = useUpdateOrderStatus(id);
  const regenerateInvoice = useRegenerateInvoice(id);
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | "">("");

  async function handleStatusUpdate() {
    if (!selectedStatus || selectedStatus === order?.status) return;
    try {
      await updateStatus.mutateAsync({ status: selectedStatus });
      toast.success(`Order status updated to ${selectedStatus}`);
      setSelectedStatus("");
    } catch (err) {
      toast.error(getApiError(err, "Failed to update status"));
    }
  }

  if (isLoading) {
    return (
      <>
        <AdminHeader title="Order Detail" />
        <div className="p-6 space-y-4 max-w-4xl">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <AdminHeader title="Order Detail" />
        <div className="p-6">
          <p className="text-muted-foreground">Order not found.</p>
        </div>
      </>
    );
  }

  const currentStatus = (selectedStatus || order.status) as OrderStatus;

  return (
    <>
      <AdminHeader
        title={`Order ${order.orderNumber}`}
        actions={
          <Link
            href="/admin/orders"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        }
      />
      <div className="p-6 space-y-5 max-w-4xl">
        {/* Summary banner */}
        <div className="flex flex-wrap items-center gap-4 rounded-lg border p-4 bg-background">
          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">Order Number</p>
            <p className="font-mono font-semibold">{order.orderNumber}</p>
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">Placed At</p>
            <p className="text-sm">{format(new Date(order.placedAt), "dd MMM yyyy, HH:mm")}</p>
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">Current Status</p>
            <Badge
              variant="outline"
              className={`text-xs font-medium ${STATUS_BADGE[order.status]}`}
            >
              {order.status}
            </Badge>
          </div>
          <div className="flex-1 space-y-0.5">
            <p className="text-xs text-muted-foreground">Payment</p>
            <p className="text-sm capitalize">{order.paymentMethod.toLowerCase()}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-5">
          {/* Customer */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Customer</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p className="font-medium">{order.customerName ?? "—"}</p>
              {order.customerBusinessName && (
                <p className="text-muted-foreground">{order.customerBusinessName}</p>
              )}
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Shipping Address</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-0.5 text-muted-foreground">
              <p className="text-foreground font-medium">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phoneNumber && (
                <p>{order.shippingAddress.phoneNumber}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Items ({order.items.length})</CardTitle>
          </CardHeader>
          <CardContent className="divide-y">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{item.productName}</p>
                  <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
                </div>
                <div className="text-right text-sm shrink-0">
                  <p className="text-muted-foreground">
                    {item.quantity} × {formatCurrency(item.unitPrice, item.currencyCode)}
                  </p>
                  <p className="font-medium">{formatCurrency(item.lineTotal, item.currencyCode)}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Totals */}
        <Card>
          <CardContent className="p-5 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{formatCurrency(order.subtotalAmount, order.currencyCode)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>−{formatCurrency(order.discountAmount, order.currencyCode)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>
                {order.shippingAmount === 0
                  ? "Free"
                  : formatCurrency(order.shippingAmount, order.currencyCode)}
              </span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{formatCurrency(order.totalAmount, order.currencyCode)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Status Update */}
        {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Update Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Select
                  value={selectedStatus || order.status}
                  onValueChange={(v) => setSelectedStatus(v as OrderStatus)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {STATUS_OPTIONS.filter((s) => s !== "PENDING").map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  disabled={
                    !selectedStatus ||
                    selectedStatus === order.status ||
                    updateStatus.isPending
                  }
                  onClick={handleStatusUpdate}
                >
                  {updateStatus.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Invoice */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Invoice</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-3">
            {order.invoiceUrl ? (
              <a href={order.invoiceUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <FileDown className="h-4 w-4 mr-2" />
                  Download Invoice PDF
                </Button>
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">No invoice generated yet.</p>
            )}
            <Button
              variant="ghost"
              size="sm"
              disabled={regenerateInvoice.isPending}
              onClick={() => regenerateInvoice.mutate()}
            >
              {regenerateInvoice.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {order.invoiceUrl ? "Regenerate" : "Generate Invoice"}
            </Button>
          </CardContent>
        </Card>

        {/* Notes */}
        {order.notes && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
