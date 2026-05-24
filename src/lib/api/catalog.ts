import apiClient from "./client";
import type {
  CategoryDTO,
  ProductDTO,
  ProductListItem,
  ProductFilterParams,
  CreateProductRequest,
  UpdateProductRequest,
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
    apiClient.put<ProductDTO>(`/admin/products/${id}`, body).then((r) => r.data),

  deleteProduct: (id: string) =>
    apiClient.delete<void>(`/admin/products/${id}`).then((r) => r.data),

  uploadImage: (productId: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return apiClient
      .post<{ url: string }>(`/admin/products/${productId}/images`, form, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then((r) => r.data);
  },

  getCategories: () =>
    apiClient.get<CategoryDTO[]>("/admin/categories").then((r) => r.data),

  createCategory: (body: Partial<CategoryDTO>) =>
    apiClient.post<CategoryDTO>("/admin/categories", body).then((r) => r.data),
};
