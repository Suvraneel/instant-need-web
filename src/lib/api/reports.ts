import apiClient from "./client";
import type {
  DashboardSummary,
  SalesReportResponse,
  TopProductEntry,
  CustomerActivityEntry,
} from "@/lib/types/admin";

export const reportsApi = {
  getSummary: () =>
    apiClient.get<DashboardSummary>("/admin/reports/summary").then((r) => r.data),

  getSalesReport: (params?: { from?: string; to?: string }) =>
    apiClient
      .get<SalesReportResponse>("/admin/reports/sales", { params })
      .then((r) => r.data),

  getTopProducts: (params?: { limit?: number; from?: string; to?: string }) =>
    apiClient
      .get<TopProductEntry[]>("/admin/reports/top-products", { params })
      .then((r) => r.data),

  getCustomerActivity: (params?: { limit?: number }) =>
    apiClient
      .get<CustomerActivityEntry[]>("/admin/reports/customer-activity", { params })
      .then((r) => r.data),

  exportCsv: (params?: { status?: string; from?: string; to?: string }) =>
    apiClient
      .get<Blob>("/admin/reports/orders.csv", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),

  exportXlsx: (params?: { status?: string; from?: string; to?: string }) =>
    apiClient
      .get<Blob>("/admin/reports/orders.xlsx", {
        params,
        responseType: "blob",
      })
      .then((r) => r.data),
};
