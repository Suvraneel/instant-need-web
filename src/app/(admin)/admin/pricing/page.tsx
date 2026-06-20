"use client";

import { useState, useEffect } from "react";
import {
  CircleDollarSign,
  Plus,
  Trash2,
  Loader2,
  Search,
  Package,
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminProducts } from "@/lib/hooks/useAdmin";
import { useGetPricingTiers, useReplacePricingTiers } from "@/lib/hooks/useAdmin";
import { formatCurrency } from "@/lib/utils";
import { calcTotalPages } from "@/lib/types/common";
import { getApiError } from "@/lib/errors";
import type { ProductListItem } from "@/lib/types/catalog";

// ── Tier form schema ───────────────────────────────────────────────────────

const tierRowSchema = z.object({
  minQty: z.coerce.number().int().min(1, "Min qty ≥ 1"),
  maxQty: z.coerce.number().int().min(1).optional().or(z.literal("")),
  unitPrice: z.coerce.number().positive("Price must be positive"),
  currencyCode: z.string().default("INR"),
});

const tiersFormSchema = z.object({
  tiers: z.array(tierRowSchema),
});

type TiersFormData = z.infer<typeof tiersFormSchema>;

// ── Pricing tier sheet ────────────────────────────────────────────────────

interface PricingSheetProps {
  product: ProductListItem | null;
  onClose: () => void;
}

function PricingSheet({ product, onClose }: PricingSheetProps) {
  const open = product !== null;
  const { data: tiers = [], isLoading: tiersLoading } = useGetPricingTiers(
    product?.id ?? "",
    open
  );
  const replaceTiers = useReplacePricingTiers(product?.id ?? "");

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<TiersFormData>({
    resolver: zodResolver(tiersFormSchema) as any,
    defaultValues: { tiers: [] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "tiers" });

  // Sync fetched tiers into the form when the sheet opens or data arrives
  useEffect(() => {
    if (open && !tiersLoading) {
      reset({
        tiers: tiers.map((t) => ({
          minQty: t.minQty,
          maxQty: t.maxQty,
          unitPrice: t.unitPrice,
          currencyCode: t.currencyCode,
        })),
      });
    }
  }, [open, tiersLoading, tiers, reset]);

  async function onSave(data: TiersFormData) {
    const payload = data.tiers.map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty === "" || t.maxQty === undefined ? undefined : t.maxQty,
      unitPrice: t.unitPrice,
      currencyCode: t.currencyCode || "INR",
    }));

    try {
      await replaceTiers.mutateAsync(payload);
      toast.success("Pricing tiers saved");
      onClose();
    } catch (err) {
      toast.error(getApiError(err, "Failed to save pricing tiers"));
    }
  }

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-xl flex flex-col gap-0 p-0">
        <SheetHeader className="px-6 py-4 border-b shrink-0">
          <SheetTitle className="text-base">
            Pricing Tiers
            {product && (
              <span className="text-muted-foreground font-normal ml-2">
                — {product.name}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        <form
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onSubmit={handleSubmit(onSave as any)}
          className="flex flex-col flex-1 min-h-0"
        >
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {tiersLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-9 w-full" />
                ))}
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Volume Pricing Tiers</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Customers pay the tier price matching their order quantity.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      append({
                        minQty: 1,
                        maxQty: undefined,
                        unitPrice: 0,
                        currencyCode: "INR",
                      })
                    }
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    Add Tier
                  </Button>
                </div>

                {fields.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-8 text-center text-muted-foreground text-sm">
                    <CircleDollarSign className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    No tiers — customers pay the base price of{" "}
                    {product && formatCurrency(product.basePrice, product.currencyCode)}.
                    <br />
                    Add a tier to enable volume discounts.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Column headers */}
                    <div className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 px-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Min Qty
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Max Qty
                      </span>
                      <span className="text-xs font-medium text-muted-foreground">
                        Unit Price (₹)
                      </span>
                      <span />
                    </div>

                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-[1fr_1fr_1fr_32px] gap-2 items-start"
                      >
                        <div>
                          <Input
                            type="number"
                            min={1}
                            placeholder="e.g. 10"
                            className="h-8 text-sm"
                            {...register(`tiers.${index}.minQty`)}
                          />
                          {errors.tiers?.[index]?.minQty && (
                            <p className="text-xs text-destructive mt-0.5">
                              {errors.tiers[index]?.minQty?.message}
                            </p>
                          )}
                        </div>
                        <Input
                          type="number"
                          min={1}
                          placeholder="∞ (leave blank)"
                          className="h-8 text-sm"
                          {...register(`tiers.${index}.maxQty`)}
                        />
                        <div>
                          <Input
                            type="number"
                            min={0.01}
                            step={0.01}
                            placeholder="0.00"
                            className="h-8 text-sm"
                            {...register(`tiers.${index}.unitPrice`)}
                          />
                          {errors.tiers?.[index]?.unitPrice && (
                            <p className="text-xs text-destructive mt-0.5">
                              {errors.tiers[index]?.unitPrice?.message}
                            </p>
                          )}
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
              </>
            )}
          </div>

          <SheetFooter className="px-6 py-4 border-t shrink-0">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || tiersLoading}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Tiers
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

// ── Tier summary helper ────────────────────────────────────────────────────

function TierSummaryBadge({ count }: { count: number }) {
  if (count === 0)
    return (
      <Badge variant="secondary" className="text-xs">
        Base price only
      </Badge>
    );
  return (
    <Badge variant="outline" className="text-xs tabular-nums">
      {count} tier{count !== 1 ? "s" : ""}
    </Badge>
  );
}

// ── Main page content ─────────────────────────────────────────────────────

function PricingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [selected, setSelected] = useState<ProductListItem | null>(null);

  const page = parseInt(searchParams.get("page") ?? "1", 10);

  const { data, isLoading } = useAdminProducts({
    search: search || undefined,
    page,
    size: 20,
  });

  const products = data?.items ?? [];
  const totalPgs = data ? calcTotalPages(data) : 0;

  return (
    <>
      <AdminHeader title="Pricing" />

      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <p className="text-sm text-muted-foreground pt-2 shrink-0">
            Click &quot;Manage&quot; to edit volume pricing tiers for any product.
          </p>
        </div>

        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead>Tiers</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 8 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Package className="h-8 w-8" />
                      <p className="text-sm">No products found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.primaryImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="h-8 w-8 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted flex items-center justify-center shrink-0">
                            <Package className="h-3.5 w-3.5 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {p.sku}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(p.basePrice, p.currencyCode)}
                    </TableCell>
                    <TableCell>
                      {/* ProductListItem doesn't carry tier count — show a neutral state */}
                      <TierSummaryBadge count={0} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={p.active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelected(p)}
                      >
                        <CircleDollarSign className="h-3.5 w-3.5 mr-1.5" />
                        Manage
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && totalPgs > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {products.length} of {data.total} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.page <= 1}
                onClick={() =>
                  router.push(`/admin/pricing?page=${data.page - 1}`)
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.page >= totalPgs}
                onClick={() =>
                  router.push(`/admin/pricing?page=${data.page + 1}`)
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <PricingSheet product={selected} onClose={() => setSelected(null)} />
    </>
  );
}

export default function PricingPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminHeader title="Pricing" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-72" />
            <Skeleton className="h-64 w-full" />
          </div>
        </>
      }
    >
      <PricingContent />
    </Suspense>
  );
}
