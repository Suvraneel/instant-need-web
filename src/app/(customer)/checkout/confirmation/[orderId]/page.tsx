"use client";

import { use } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Package,
  MapPin,
  CreditCard,
  ArrowRight,
  ClipboardList,
  Printer,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/ui/status-badge";
import { buttonVariants } from "@/components/ui/button";
import { useOrder } from "@/lib/hooks/useOrders";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface ConfirmationPageProps {
  params: Promise<{ orderId: string }>;
}

export default function OrderConfirmationPage({ params }: ConfirmationPageProps) {
  const { orderId } = use(params);
  const { data: order, isLoading } = useOrder(orderId);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-16 w-16 rounded-full mx-auto" />
        <Skeleton className="h-8 w-64 mx-auto" />
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">Order not found</h1>
        <p className="text-muted-foreground text-sm">
          We couldn&apos;t load your order details. Your order may still have been placed.
        </p>
        <Link href="/account/orders" className={cn(buttonVariants())}>
          View my orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-8 print:py-4 print:px-0">
      {/* Success header */}
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-9 w-9 text-green-600" />
          </div>
        </div>
        <h1 className="text-2xl font-bold">Order placed!</h1>
        <p className="text-muted-foreground">
          Thank you for your order. We&apos;ll notify you when it ships.
        </p>
        <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-1.5 text-sm font-medium">
          <ClipboardList className="h-4 w-4" />
          {order.orderNumber}
        </div>
      </div>

      {/* Order details card */}
      <div className="rounded-xl border bg-card overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-muted/40 border-b">
          <div className="text-sm">
            <span className="text-muted-foreground">Placed on </span>
            <span className="font-medium">{formatDateTime(order.placedAt)}</span>
          </div>
          <StatusBadge status={order.status} />
        </div>

        {/* Items */}
        <div className="divide-y">
          {order.items?.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-5 py-3">
              <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                <Package className="h-5 w-5 text-muted-foreground/40" strokeWidth={1} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  {item.sku} · qty {item.quantity}
                </p>
              </div>
              <p className="text-sm font-medium shrink-0">
                {formatCurrency(item.lineTotal, item.currencyCode)}
              </p>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="px-5 py-4 bg-muted/20 border-t space-y-1.5 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span>{formatCurrency(order.subtotalAmount, order.currencyCode)}</span>
          </div>
          {order.shippingAmount > 0 && (
            <div className="flex justify-between text-muted-foreground">
              <span>Shipping</span>
              <span>{formatCurrency(order.shippingAmount, order.currencyCode)}</span>
            </div>
          )}
          {order.discountAmount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Discount</span>
              <span>−{formatCurrency(order.discountAmount, order.currencyCode)}</span>
            </div>
          )}
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-base">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount, order.currencyCode)}</span>
          </div>
        </div>
      </div>

      {/* Shipping + payment info */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Shipping to
          </div>
          {order.shippingAddress ? (
            <div className="text-sm text-muted-foreground space-y-0.5">
              <p className="font-medium text-foreground">{order.shippingAddress.fullName}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && (
                <p>{order.shippingAddress.addressLine2}</p>
              )}
              <p>
                {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
                {order.shippingAddress.postalCode}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Address not available</p>
          )}
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <CreditCard className="h-4 w-4 text-muted-foreground" />
            Payment
          </div>
          <p className="text-sm text-muted-foreground capitalize">
            {order.paymentMethod === "cod"
              ? "Cash on Delivery"
              : order.paymentMethod}
          </p>
          <p className="text-xs text-muted-foreground">
            Payment due on delivery
          </p>
        </div>
      </div>

      {/* CTAs — hidden on print */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 print:hidden">
        <Link
          href={`/account/orders/${order.id}`}
          className={cn(buttonVariants(), "flex-1 justify-center")}
        >
          Track order <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "outline" }), "flex-1 justify-center")}
        >
          Continue shopping
        </Link>
        <button
          onClick={() => window.print()}
          className={cn(buttonVariants({ variant: "ghost" }), "sm:ml-auto")}
          aria-label="Print order confirmation"
        >
          <Printer className="h-4 w-4 mr-2" />
          Print
        </button>
      </div>
    </div>
  );
}
