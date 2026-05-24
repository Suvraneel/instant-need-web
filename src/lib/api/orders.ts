import apiClient from "./client";
import type {
  OrderDTO,
  OrderListItem,
  PlaceOrderRequest,
  UpdateOrderStatusRequest,
} from "@/lib/types/order";
import type { AdminOrderFilterParams } from "@/lib/types/admin";
import type { PagedResponse } from "@/lib/types/common";

export const ordersApi = {
  // ── Customer ─────────────────────────────────────────────────────────────
  getMyOrders: (params?: { page?: number; size?: number }) =>
    apiClient
      .get<PagedResponse<OrderListItem>>("/orders", { params })
      .then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<OrderDTO>(`/orders/${id}`).then((r) => r.data),

  placeOrder: (body: PlaceOrderRequest) =>
    apiClient.post<OrderDTO>("/orders", body).then((r) => r.data),

  cancelOrder: (id: string) =>
    apiClient.post<OrderDTO>(`/orders/${id}/cancel`).then((r) => r.data),
};

export const adminOrdersApi = {
  getOrders: (params?: AdminOrderFilterParams) =>
    apiClient
      .get<PagedResponse<OrderDTO>>("/admin/orders", { params })
      .then((r) => r.data),

  getOrder: (id: string) =>
    apiClient.get<OrderDTO>(`/admin/orders/${id}`).then((r) => r.data),

  updateStatus: (id: string, body: UpdateOrderStatusRequest) =>
    apiClient
      .patch<OrderDTO>(`/admin/orders/${id}/status`, body)
      .then((r) => r.data),
};
