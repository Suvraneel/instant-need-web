"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useCategories } from "@/lib/hooks/useCatalog";
import { cn } from "@/lib/utils";

interface FilterSidebarProps {
  fixedCategoryId?: string;
}

export function FilterSidebar({ fixedCategoryId }: FilterSidebarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: categories } = useCategories();

  const currentCategory = fixedCategoryId ?? searchParams.get("categoryId") ?? "";
  const minPrice = searchParams.get("minPrice") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const inStock = searchParams.get("inStock") === "true";

  const [minInput, setMinInput] = useState(minPrice);
  const [maxInput, setMaxInput] = useState(maxPrice);
  const minDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync inputs when URL params change externally (e.g. clear all)
  useEffect(() => { setMinInput(minPrice); }, [minPrice]);
  useEffect(() => { setMaxInput(maxPrice); }, [maxPrice]);

  const activeFilterCount = [currentCategory, minPrice, maxPrice, inStock].filter(Boolean).length;

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page"); // reset page on filter change
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  function clearAll() {
    router.push(pathname, { scroll: false });
  }

  return (
    <aside className="w-full space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4" />
          <span className="font-semibold text-sm">Filters</span>
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFilterCount}
            </Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAll}
            className="text-xs h-7 px-2 text-muted-foreground"
          >
            <X className="h-3 w-3 mr-1" /> Clear all
          </Button>
        )}
      </div>

      {/* Category */}
      {categories && categories.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Category
            </Label>
            <div className="flex flex-col gap-1">
              <button
                onClick={() => updateParam("categoryId", null)}
                className={cn(
                  "text-left text-sm px-2 py-1.5 rounded-md transition-colors",
                  !currentCategory
                    ? "bg-primary text-primary-foreground font-medium"
                    : "hover:bg-muted text-muted-foreground"
                )}
              >
                All categories
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => updateParam("categoryId", cat.id)}
                  className={cn(
                    "text-left text-sm px-2 py-1.5 rounded-md transition-colors truncate",
                    currentCategory === cat.id
                      ? "bg-primary text-primary-foreground font-medium"
                      : "hover:bg-muted text-muted-foreground"
                  )}
                >
                  {cat.name}
                  {cat.productCount !== undefined && (
                    <span className="ml-1 opacity-60">({cat.productCount})</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Price range */}
      <Separator />
      <div className="space-y-2">
        <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Price range (₹)
        </Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            placeholder="Min"
            className="h-8 text-sm"
            value={minInput}
            onChange={(e) => {
              setMinInput(e.target.value);
              if (minDebounceRef.current) clearTimeout(minDebounceRef.current);
              minDebounceRef.current = setTimeout(() => {
                updateParam("minPrice", e.target.value);
              }, 500);
            }}
          />
          <span className="text-muted-foreground text-sm shrink-0">—</span>
          <Input
            type="number"
            placeholder="Max"
            className="h-8 text-sm"
            value={maxInput}
            onChange={(e) => {
              setMaxInput(e.target.value);
              if (maxDebounceRef.current) clearTimeout(maxDebounceRef.current);
              maxDebounceRef.current = setTimeout(() => {
                updateParam("maxPrice", e.target.value);
              }, 500);
            }}
          />
        </div>
      </div>

      {/* In stock */}
      <Separator />
      <div className="flex items-center justify-between">
        <Label htmlFor="inStock" className="text-sm cursor-pointer">
          In stock only
        </Label>
        <button
          id="inStock"
          role="switch"
          aria-checked={inStock}
          onClick={() => updateParam("inStock", inStock ? null : "true")}
          className={cn(
            "relative h-5 w-9 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            inStock ? "bg-primary" : "bg-muted-foreground/30"
          )}
        >
          <span
            className={cn(
              "absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform",
              inStock && "translate-x-4"
            )}
          />
        </button>
      </div>
    </aside>
  );
}
