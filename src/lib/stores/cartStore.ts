"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { PricingTierDTO } from "@/lib/types/catalog";

export interface CartItem {
  productId: string;
  productName: string;
  sku: string;
  slug: string;
  imageUrl?: string;
  quantity: number;
  unitPrice: number;
  currencyCode: string;
  moq: number;
  pricingTiers: PricingTierDTO[];
}

function priceForQty(tiers: PricingTierDTO[], qty: number, fallback: number): number {
  if (!tiers || tiers.length === 0) return fallback;
  const matched = tiers.find(
    (t) => t.minQty <= qty && (t.maxQty == null || t.maxQty >= qty)
  );
  return matched ? matched.unitPrice : tiers[0].unitPrice;
}

interface CartState {
  items: CartItem[];

  addItem: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, quantity: number) => void;
  clear: () => void;

  totalItems: () => number;
  subtotal: () => number;
  currencyCode: () => string;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (incoming) => {
        const qty = incoming.quantity ?? incoming.moq;
        const tiers = incoming.pricingTiers ?? [];
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === incoming.productId
          );
          if (existing) {
            const newQty = existing.quantity + qty;
            return {
              items: state.items.map((i) =>
                i.productId === incoming.productId
                  ? { ...i, quantity: newQty, unitPrice: priceForQty(i.pricingTiers, newQty, i.unitPrice) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              { ...incoming, quantity: qty, unitPrice: priceForQty(tiers, qty, incoming.unitPrice) },
            ],
          };
        });
      },

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQty: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId
              ? { ...i, quantity, unitPrice: priceForQty(i.pricingTiers, quantity, i.unitPrice) }
              : i
          ),
        })),

      clear: () => set({ items: [] }),

      totalItems: () =>
        get().items.reduce((sum, i) => sum + i.quantity, 0),

      subtotal: () =>
        get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      currencyCode: () => get().items[0]?.currencyCode ?? "INR",
    }),
    {
      name: "instant-need-cart",
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? sessionStorage : localStorage
      ),
    }
  )
);
