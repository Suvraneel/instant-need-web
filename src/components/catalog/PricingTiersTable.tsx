import { formatCurrency } from "@/lib/utils";
import type { PricingTierDTO } from "@/lib/types/catalog";

interface PricingTiersTableProps {
  tiers: PricingTierDTO[];
  currencyCode: string;
  basePrice: number;
  mrp?: number;
}

export function PricingTiersTable({ tiers, currencyCode, basePrice, mrp }: PricingTiersTableProps) {
  if (!tiers || tiers.length === 0) {
    return (
      <div className="rounded-lg border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">Price</p>
        {mrp && mrp > basePrice && (
          <p className="text-sm text-muted-foreground line-through mb-0.5">
            MRP {formatCurrency(mrp, currencyCode)}
          </p>
        )}
        <p className="text-xl font-bold text-foreground">
          {formatCurrency(basePrice, currencyCode)}
          <span className="text-sm font-normal text-muted-foreground ml-1">/ item</span>
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="bg-muted/40 px-4 py-2 border-b">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Volume pricing
        </p>
      </div>
      <div className="divide-y">
        {tiers.map((tier, i) => (
          <div
            key={tier.id ?? i}
            className="flex items-center justify-between px-4 py-2.5"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {tier.minQty}
                {tier.maxQty ? `–${tier.maxQty}` : "+"} items
              </span>
              {tier.discountPercent && tier.discountPercent > 0 && (
                <span className="text-xs font-semibold text-green-700 bg-green-100 rounded px-1.5 py-0.5">
                  {tier.discountPercent}% off
                </span>
              )}
            </div>
            <div className="text-right">
              {mrp && mrp > tier.unitPrice && (
                <p className="text-xs text-muted-foreground line-through">
                  MRP {formatCurrency(mrp, tier.currencyCode)}
                </p>
              )}
              <span className="text-sm font-semibold">
                {formatCurrency(tier.unitPrice, tier.currencyCode)}
                <span className="text-xs font-normal text-muted-foreground ml-1">/ item</span>
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-muted/20 px-4 py-2 border-t">
        <p className="text-xs text-muted-foreground">
          Prices shown are all-inclusive. No hidden fees or extra charges.
        </p>
      </div>
    </div>
  );
}
