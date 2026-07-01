"use client";

import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore, type CartItem } from "@/lib/stores/cartStore";
import { useProduct } from "@/lib/hooks/useCatalog";
import { formatCurrency } from "@/lib/utils";

interface CartLineItemProps {
  item: CartItem;
}

export function CartLineItem({ item }: CartLineItemProps) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const { data: product } = useProduct(item.slug);

  // Use live stock from the API; fall back to the value stored at add-time
  const stockLimit = product?.stock ?? item.stock ?? Infinity;

  function handleQty(value: string) {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= item.moq && n <= stockLimit) {
      updateQty(item.productId, n);
    }
  }

  return (
    <div className="flex gap-4 py-4">
      {/* Image */}
      <Link href={`/products/${item.slug}`} className="shrink-0">
        <div className="relative h-20 w-20 rounded-lg border bg-muted overflow-hidden">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.productName}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-8 w-8 text-muted-foreground/30" strokeWidth={1} />
            </div>
          )}
        </div>
      </Link>

      {/* Details */}
      <div className="flex flex-1 min-w-0 gap-4">
        <div className="flex-1 min-w-0 space-y-1">
          <Link
            href={`/products/${item.slug}`}
            className="text-sm font-medium hover:text-primary transition-colors line-clamp-2"
          >
            {item.productName}
          </Link>
          <p className="text-xs text-muted-foreground font-mono">{item.sku}</p>
          <p className="text-xs text-muted-foreground">
            {formatCurrency(item.unitPrice, item.currencyCode)} / unit
          </p>
        </div>

        {/* Qty + price + remove */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <p className="text-sm font-semibold">
            {formatCurrency(item.unitPrice * item.quantity, item.currencyCode)}
          </p>

          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQty(item.productId, Math.max(item.moq, item.quantity - 1))}
              disabled={item.quantity <= item.moq}
              aria-label="Decrease quantity"
            >
              <Minus className="h-3 w-3" />
            </Button>
            <Input
              type="number"
              value={item.quantity}
              onChange={(e) => handleQty(e.target.value)}
              className="h-7 w-14 text-center text-sm px-1"
              min={item.moq}
              max={stockLimit === Infinity ? undefined : stockLimit}
            />
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7"
              onClick={() => updateQty(item.productId, Math.min(stockLimit, item.quantity + 1))}
              disabled={item.quantity >= stockLimit}
              aria-label="Increase quantity"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-muted-foreground hover:text-destructive px-2"
            onClick={() => removeItem(item.productId)}
          >
            <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove
          </Button>
        </div>
      </div>
    </div>
  );
}
