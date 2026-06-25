import Image from "next/image";
import { Package } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/stores/cartStore";
import { formatCurrency } from "@/lib/utils";

export function OrderSummaryPanel() {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const currencyCode = useCartStore((s) => s.currencyCode());

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4 sticky top-24">
      <h2 className="font-semibold">Order Summary</h2>
      <Separator />

      {/* Items */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.productId} className="flex gap-3 items-start">
            <div className="relative h-12 w-12 rounded-md border bg-muted overflow-hidden shrink-0">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.productName}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <Package className="h-5 w-5 text-muted-foreground/30" />
                </div>
              )}
              {/* Qty badge */}
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-medium">
                {item.quantity > 99 ? "99+" : item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.productName}</p>
              <p className="text-xs text-muted-foreground">{item.sku}</p>
            </div>
            <p className="text-sm font-medium shrink-0">
              {formatCurrency(item.unitPrice * item.quantity, item.currencyCode)}
            </p>
          </div>
        ))}
      </div>

      <Separator />

      {/* Totals */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(subtotal, currencyCode)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Shipping</span>
          <span className="text-green-600">Free</span>
        </div>

      </div>

      <Separator />

      <div className="flex justify-between font-semibold">
        <span>Total</span>
        <span>{formatCurrency(subtotal, currencyCode)}</span>
      </div>

      <p className="text-xs text-muted-foreground">
        By placing your order you agree to our Terms of Service.
      </p>
    </div>
  );
}
