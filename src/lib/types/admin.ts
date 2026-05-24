import type { OrderStatus } from "./order";

export interface DashboardSummary {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  revenueThisMonth: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  activeProducts: number;
}

export interface SalesBreakdownEntry {
  date: string;
  orderCount: number;
  revenue: number;
}

export interface SalesReportResponse {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  breakdown: SalesBreakdownEntry[];
}

export interface TopProductEntry {
  productId: string;
  productName: string;
  sku: string;
  currencyCode: string;
  totalQuantity: number;
  totalRevenue: number;
}

export interface CustomerActivityEntry {
  customerId: string;
  fullName: string;
  businessName?: string;
  email: string;
  orderCount: number;
  totalRevenue: number;
  lastOrderAt: string;
}

export interface AdminOrderFilterParams {
  status?: OrderStatus;
  from?: string;
  to?: string;
  page?: number;
  size?: number;
}

export interface AdminCustomerListItem {
  id: string;
  fullName: string;
  businessName?: string;
  email: string;
  phoneNumber: string;
  orderCount: number;
  createdAt: string;
  active: boolean;
}
