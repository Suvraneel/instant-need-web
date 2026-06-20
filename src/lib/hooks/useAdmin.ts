"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminCatalogApi } from "@/lib/api/catalog";
import { adminOrdersApi } from "@/lib/api/orders";
import { adminCustomerApi } from "@/lib/api/customer";
import type {
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
  CategoryDTO,
  PricingTierRequest,
} from "@/lib/types/catalog";
import type { AdminOrderFilterParams } from "@/lib/types/admin";
import type { UpdateOrderStatusRequest } from "@/lib/types/order";

// ── Products ──────────────────────────────────────────────────────────────

export const adminProductKeys = {
  all: ["admin", "products"] as const,
  list: (p?: ProductFilterParams) => [...adminProductKeys.all, "list", p ?? {}] as const,
  detail: (id: string) => [...adminProductKeys.all, "detail", id] as const,
};

export function useAdminProducts(params?: ProductFilterParams) {
  return useQuery({
    queryKey: adminProductKeys.list(params),
    queryFn: () => adminCatalogApi.getProducts(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminProduct(id: string) {
  return useQuery({
    queryKey: adminProductKeys.detail(id),
    queryFn: () => adminCatalogApi.getProduct(id),
    enabled: !!id,
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateProductRequest) => adminCatalogApi.createProduct(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminProductKeys.all }),
  });
}

export function useUpdateProduct(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProductRequest) => adminCatalogApi.updateProduct(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminProductKeys.all });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCatalogApi.deleteProduct(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminProductKeys.all }),
  });
}

export function useUploadProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, altText, sortOrder }: { file: File; altText?: string; sortOrder?: number }) =>
      adminCatalogApi.uploadImage(productId, file, altText, sortOrder),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminProductKeys.detail(productId) }),
  });
}

export function useDeleteProductImage(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (imageId: string) => adminCatalogApi.deleteImage(productId, imageId),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminProductKeys.detail(productId) }),
  });
}

// ── Orders ────────────────────────────────────────────────────────────────

export const adminOrderKeys = {
  all: ["admin", "orders"] as const,
  list: (p?: AdminOrderFilterParams) => [...adminOrderKeys.all, "list", p ?? {}] as const,
  detail: (id: string) => [...adminOrderKeys.all, "detail", id] as const,
};

export function useAdminOrders(params?: AdminOrderFilterParams) {
  return useQuery({
    queryKey: adminOrderKeys.list(params),
    queryFn: () => adminOrdersApi.getOrders(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminOrder(id: string) {
  return useQuery({
    queryKey: adminOrderKeys.detail(id),
    queryFn: () => adminOrdersApi.getOrder(id),
    enabled: !!id,
  });
}

export function useUpdateOrderStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateOrderStatusRequest) => adminOrdersApi.updateStatus(id, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: adminOrderKeys.detail(id) });
      qc.invalidateQueries({ queryKey: adminOrderKeys.all });
    },
  });
}

// ── Customers ─────────────────────────────────────────────────────────────

export const adminCustomerKeys = {
  all: ["admin", "customers"] as const,
  list: (p?: object) => [...adminCustomerKeys.all, "list", p ?? {}] as const,
  detail: (id: string) => [...adminCustomerKeys.all, "detail", id] as const,
};

export function useAdminCustomers(params?: { search?: string; page?: number; size?: number }) {
  return useQuery({
    queryKey: adminCustomerKeys.list(params),
    queryFn: () => adminCustomerApi.getCustomers(params),
    placeholderData: (prev) => prev,
  });
}

export function useAdminCustomer(id: string) {
  return useQuery({
    queryKey: adminCustomerKeys.detail(id),
    queryFn: () => adminCustomerApi.getCustomer(id),
    enabled: !!id,
  });
}

// ── Categories ────────────────────────────────────────────────────────────

export const adminCategoryKeys = {
  all: ["admin", "categories"] as const,
  list: () => [...adminCategoryKeys.all, "list"] as const,
};

export function useAdminCategories() {
  return useQuery({
    queryKey: adminCategoryKeys.list(),
    queryFn: () => adminCatalogApi.getCategories(),
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<CategoryDTO>) => adminCatalogApi.createCategory(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCategoryKeys.all }),
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: Partial<CategoryDTO> }) =>
      adminCatalogApi.updateCategory(id, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCategoryKeys.all }),
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminCatalogApi.deleteCategory(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: adminCategoryKeys.all }),
  });
}

// ── Pricing tiers ─────────────────────────────────────────────────────────

export const pricingTierKeys = {
  detail: (productId: string) => ["admin", "pricing-tiers", productId] as const,
};

export function useGetPricingTiers(productId: string, enabled = true) {
  return useQuery({
    queryKey: pricingTierKeys.detail(productId),
    queryFn: () => adminCatalogApi.getPricingTiers(productId),
    enabled: enabled && !!productId,
  });
}

export function useReplacePricingTiers(productId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (tiers: PricingTierRequest[]) =>
      adminCatalogApi.replacePricingTiers(productId, tiers),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pricingTierKeys.detail(productId) });
      qc.invalidateQueries({ queryKey: adminProductKeys.all });
    },
  });
}
