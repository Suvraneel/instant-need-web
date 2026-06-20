"use client";

import { useQuery } from "@tanstack/react-query";
import { catalogApi } from "@/lib/api/catalog";
import type { ProductFilterParams } from "@/lib/types/catalog";

export const catalogKeys = {
  all: ["catalog"] as const,
  categories: () => [...catalogKeys.all, "categories"] as const,
  category: (slug: string) => [...catalogKeys.categories(), slug] as const,
  products: (params?: ProductFilterParams) =>
    [...catalogKeys.all, "products", params ?? {}] as const,
  product: (slug: string) => [...catalogKeys.all, "product", slug] as const,
};

export function useCategories(tree = false) {
  return useQuery({
    queryKey: catalogKeys.categories(),
    queryFn: () => catalogApi.getCategories(tree),
    staleTime: 5 * 60_000, // categories rarely change
  });
}

export function useCategory(slug: string) {
  const { data: categories, isLoading } = useCategories();
  const category = categories?.find((c) => c.slug === slug);
  return { data: category, isLoading };
}

export function useProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => catalogApi.getProducts(params),
    placeholderData: (prev) => prev, // keep previous data while fetching next page
  });
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: catalogKeys.product(slug),
    queryFn: () => catalogApi.getProduct(slug),
    enabled: !!slug,
  });
}
