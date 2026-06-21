"use client";

import { useSearchParams } from "next/navigation";
import { Package, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FilterSidebar } from "@/components/catalog/FilterSidebar";
import { ProductCard, ProductCardSkeleton } from "@/components/catalog/ProductCard";
import { Pagination } from "@/components/catalog/Pagination";
import { EmptyState } from "@/components/ui/empty-state";
import { useProducts } from "@/lib/hooks/useCatalog";
import { calcTotalPages } from "@/lib/types/common";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const PAGE_SIZE = 20;

const SORT_OPTIONS = [
  { label: "Newest first", value: "" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
  { label: "Name A–Z", value: "name_asc" },
];

interface ProductsContentProps {
  /** When set (e.g. on a category page), locks the category filter to this ID. */
  fixedCategoryId?: string;
}

export function ProductsContent({ fixedCategoryId }: ProductsContentProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = parseInt(searchParams.get("page") ?? "0", 10); // 0-indexed in URL
  const search = searchParams.get("search") ?? undefined;

  const [searchInput, setSearchInput] = useState(search ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Keep input in sync if URL param changes externally (e.g. clear all filters)
  useEffect(() => {
    setSearchInput(search ?? "");
  }, [search]);
  const categoryId = fixedCategoryId ?? searchParams.get("categoryId") ?? undefined;
  const minPrice = searchParams.get("minPrice") ? Number(searchParams.get("minPrice")) : undefined;
  const maxPrice = searchParams.get("maxPrice") ? Number(searchParams.get("maxPrice")) : undefined;
  const inStock = searchParams.get("inStock") === "true" ? true : undefined;
  const sort = searchParams.get("sort") ?? "";

  const { data, isLoading } = useProducts({
    search,
    categoryId,
    minPrice,
    maxPrice,
    inStock,
    page: page + 1, // backend is 1-indexed; URL param is 0-indexed
    size: PAGE_SIZE,
    sort,
  });

  const totalPgs = data ? calcTotalPages(data) : 0;
  const items = data?.items ?? [];

  const updateParam = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex gap-8">
      {/* Filter sidebar — hidden on mobile, shown on md+ */}
      <div className="hidden md:block w-52 shrink-0">
        <FilterSidebar fixedCategoryId={fixedCategoryId} />
      </div>

      {/* Main content */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search products…"
              value={searchInput}
              className="pl-9"
              onChange={(e) => {
                const val = e.target.value;
                setSearchInput(val);
                if (debounceRef.current) clearTimeout(debounceRef.current);
                debounceRef.current = setTimeout(() => {
                  updateParam("search", val);
                }, 350);
              }}
            />
          </div>
          <Select
            value={sort}
            onValueChange={(v) => updateParam("sort", v)}
            items={SORT_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
          >
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        {data && (
          <p className="text-sm text-muted-foreground">
            {data.total} product{data.total !== 1 ? "s" : ""}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products found"
            description="Try adjusting your filters or search term."
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && totalPgs > 1 && (
          <div className="pt-4">
            <Pagination currentPage={data.page - 1} totalPages={totalPgs} />
          </div>
        )}
      </div>
    </div>
  );
}
