import apiClient from "./client";
import type {
  CategoryDTO,
  ProductDTO,
  ProductListItem,
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
  PricingTierDTO,
  PricingTierRequest,
  PriceCheckRequest,
  PriceCheckResponse,
} from "@/lib/types/catalog";
import type { PagedResponse } from "@/lib/types/common";

export const catalogApi = {
  // ── Categories ──────────────────────────────────────────────────────────
  getCategories: (tree = false) =>
    apiClient.get<CategoryDTO[]>("/categories", { params: { tree } }).then((r) => r.data),

  getCategory: (slug: string) =>
    apiClient.get<CategoryDTO>(`/categories/${slug}`).then((r) => r.data),

  // ── Products ────────────────────────────────────────────────────────────
  getProducts: (params?: ProductFilterParams) =>
    apiClient
      .get<PagedResponse<ProductListItem>>("/products", { params })
      .then((r) => r.data),

  getProduct: (slug: string) =>
    apiClient.get<ProductDTO>(`/products/${slug}`).then((r) => r.data),

  // ── Pricing ─────────────────────────────────────────────────────────────
  checkPrice: (body: PriceCheckRequest) =>
    apiClient.post<PriceCheckResponse>("/pricing/check", body).then((r) => r.data),
};

// ── Admin catalog ────────────────────────────────────────────────────────
export const adminCatalogApi = {
  getProducts: (params?: ProductFilterParams) =>
    apiClient
      .get<PagedResponse<ProductListItem>>("/admin/products", { params })
      .then((r) => r.data),

  getProduct: (id: string) =>
    apiClient.get<ProductDTO>(`/admin/products/${id}`).then((r) => r.data),

  createProduct: (body: CreateProductRequest) =>
    apiClient.post<ProductDTO>("/admin/products", body).then((r) => r.data),

  updateProduct: (id: string, body: UpdateProductRequest) =>
    apiClient.patch<ProductDTO>(`/admin/products/${id}`, body).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete<void>(`/admin/products/${id}`).then((r) => r.data),

  getPricingTiers: (productId: string) =>
    apiClient
      .get<PricingTierDTO[]>(`/admin/products/${productId}/pricing-tiers`)
      .then((r) => r.data),

  replacePricingTiers: (productId: string, tiers: PricingTierRequest[]) =>
    apiClient
      .put<PricingTierDTO[]>(`/admin/products/${productId}/pricing-tiers`, tiers)
      .then((r) => r.data),

  uploadImage: (productId: string, file: File, altText = "", sortOrder = 0) => {
    const form = new FormData();
    form.append("file", file);
    if (altText) form.append("altText", altText);
    form.append("sortOrder", String(sortOrder));
    return apiClient
      .post<{ id: string; url: string; altText?: string; sortOrder: number }>(
        `/admin/products/${productId}/images`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      )
      .then((r) => r.data);
  },

  deleteImage: (productId: string, imageId: string) =>
    apiClient
      .delete<void>(`/admin/products/${productId}/images/${imageId}`)
      .then((r) => r.data),

  getCategories: () =>
    apiClient.get<CategoryDTO[]>("/admin/categories").then((r) => r.data),

  createCategory: (body: Partial<CategoryDTO>) =>
    apiClient.post<CategoryDTO>("/admin/categories", body).then((r) => r.data),

  updateCategory: (id: string, body: Partial<CategoryDTO>) =>
    apiClient.patch<CategoryDTO>(`/admin/categories/${id}`, body).then((r) => r.data),

  deleteCategory: (id: string) =>
    apiClient.delete<void>(`/admin/categories/${id}`).then((r) => r.data),
};
