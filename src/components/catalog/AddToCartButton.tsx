"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/lib/stores/cartStore";
import { toast } from "sonner";
import type { ProductDTO } from "@/lib/types/catalog";

interface AddToCartButtonProps {
  product: ProductDTO;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [qty, setQty] = useState(product.moq);
  const addItem = useCartStore((s) => s.addItem);

  const outOfStock = product.stock === 0;

  function decrement() {
    setQty((q) => Math.max(product.moq, q - 1));
  }

  function increment() {
    setQty((q) => Math.min(product.stock, q + 1));
  }

  function handleQtyChange(value: string) {
    const n = parseInt(value, 10);
    if (!isNaN(n)) {
      setQty(Math.max(product.moq, Math.min(product.stock, n)));
    }
  }

  function handleAddToCart() {
    addItem({
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      slug: product.slug,
      imageUrl: product.images?.[0]?.url,
      unitPrice: product.basePrice,
      currencyCode: product.currencyCode,
      moq: product.moq,
      quantity: qty,
      pricingTiers: product.pricingTiers ?? [],
    });
    toast.success(`${product.name} added to cart`, {
      description: `${qty} units added`,
    });
  }

  if (outOfStock) {
    return (
      <Button className="w-full" disabled size="lg">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Qty selector */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={decrement}
          disabled={qty <= product.moq}
          aria-label="Decrease quantity"
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          type="number"
          value={qty}
          onChange={(e) => handleQtyChange(e.target.value)}
          className="w-20 text-center h-9"
          min={product.moq}
          max={product.stock}
        />
        <Button
          variant="outline"
          size="icon"
          onClick={increment}
          disabled={qty >= product.stock}
          aria-label="Increase quantity"
        >
          <Plus className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground">
          Minimum order: {product.moq} units
        </span>
      </div>

      <Button onClick={handleAddToCart} className="w-full" size="lg">
        <ShoppingCart className="mr-2 h-5 w-5" />
        Add to cart
      </Button>
    </div>
  );
}
