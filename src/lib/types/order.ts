export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface AddressSnapshot {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

export interface OrderItemDTO {
  id: string;
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currencyCode: string;
}

export interface OrderDTO {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: string;
  subtotalAmount: number;
  discountAmount: number;
  shippingAmount: number;
  totalAmount: number;
  currencyCode: string;
  notes?: string;
  placedAt: string;
  updatedAt: string;
  shippingAddress: AddressSnapshot;
  items: OrderItemDTO[];
  customerName?: string;
  customerBusinessName?: string;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  currencyCode: string;
  itemCount: number;
  placedAt: string;
}

export interface PlaceOrderRequest {
  shippingAddressId: string;
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusRequest {
  status: OrderStatus;
}
