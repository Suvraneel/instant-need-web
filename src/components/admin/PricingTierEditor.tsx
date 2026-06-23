"use client";

import { useFieldArray, useFormContext } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProductFormData } from "@/lib/validations/admin";

export function PricingTierEditor() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ProductFormData>();

  const { fields, append, remove } = useFieldArray<ProductFormData>({
    name: "pricingTiers",
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Volume Pricing Tiers</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            append({ minQty: 1, maxQty: undefined, unitPrice: 0, discountPercent: undefined, currencyCode: "INR" })
          }
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Tier
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No tiers configured. Customers will always pay the base price.
        </p>
      ) : (
        <div className="space-y-2">
          {/* Header row */}
          <div className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 px-1">
            <span className="text-xs font-medium text-muted-foreground">Min Qty</span>
            <span className="text-xs font-medium text-muted-foreground">Max Qty</span>
            <span className="text-xs font-medium text-muted-foreground">Unit Price (₹)</span>
            <span className="text-xs font-medium text-muted-foreground">Discount %</span>
            <span />
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-[1fr_1fr_1fr_1fr_32px] gap-2 items-start">
              <div>
                <Input
                  type="number"
                  min={1}
                  placeholder="e.g. 10"
                  {...register(`pricingTiers.${index}.minQty`)}
                  className="h-8 text-sm"
                />
                {errors.pricingTiers?.[index]?.minQty && (
                  <p className="text-xs text-destructive mt-0.5">
                    {errors.pricingTiers[index]?.minQty?.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  min={1}
                  placeholder="∞ (leave blank)"
                  {...register(`pricingTiers.${index}.maxQty`)}
                  className="h-8 text-sm"
                />
              </div>
              <div>
                <Input
                  type="number"
                  min={0.01}
                  step={0.01}
                  placeholder="0.00"
                  {...register(`pricingTiers.${index}.unitPrice`)}
                  className="h-8 text-sm"
                />
                {errors.pricingTiers?.[index]?.unitPrice && (
                  <p className="text-xs text-destructive mt-0.5">
                    {errors.pricingTiers[index]?.unitPrice?.message}
                  </p>
                )}
              </div>
              <div>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  placeholder="e.g. 10"
                  {...register(`pricingTiers.${index}.discountPercent`)}
                  className="h-8 text-sm"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
