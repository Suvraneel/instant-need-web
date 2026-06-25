"use client";

import Link from "next/link";
import { ShoppingCart, ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { EmptyState } from "@/components/ui/empty-state";
import { useCartStore } from "@/lib/stores/cartStore";
import { formatCurrency, cn } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const currencyCode = useCartStore((s) => s.currencyCode());
  const clear = useCartStore((s) => s.clear);

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <EmptyState
          icon={ShoppingCart}
          title="Your cart is empty"
          description="Add some products to get started."
          action={
            <Link href="/products" className={cn(buttonVariants())}>
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          Shopping Cart{" "}
          <span className="text-muted-foreground font-normal text-base">
            ({items.length} item{items.length !== 1 ? "s" : ""})
          </span>
        </h1>
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive text-xs"
          onClick={clear}
        >
          Clear cart
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Line items */}
        <div className="md:col-span-2">
          <div className="rounded-xl border divide-y bg-card">
            {items.map((item) => (
              <div key={item.productId} className="px-4">
                <CartLineItem item={item} />
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Link
              href="/products"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              ← Continue shopping
            </Link>
          </div>
        </div>

        {/* Order summary */}
        <div className="md:col-span-1">
          <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-24">
            <h2 className="font-semibold text-base">Order Summary</h2>
            <Separator />

            <div className="space-y-2 text-sm">
              {items.map((item) => (
                <div key={item.productId} className="flex justify-between text-muted-foreground">
                  <span className="truncate max-w-[60%]">
                    {item.productName}{" "}
                    <span className="text-xs">×{item.quantity}</span>
                  </span>
                  <span>{formatCurrency(item.unitPrice * item.quantity, item.currencyCode)}</span>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal, currencyCode)}</span>
            </div>
            <Link href="/checkout" className={cn(buttonVariants({ size: "lg" }), "w-full")}>
              Proceed to checkout <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
