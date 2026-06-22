"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api/orders";
import type { PlaceOrderRequest } from "@/lib/types/order";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => [...orderKeys.all, "list"] as const,
  list: (params?: { page?: number; size?: number }) =>
    [...orderKeys.lists(), params ?? {}] as const,
  detail: (id: string) => [...orderKeys.all, "detail", id] as const,
};

export function useMyOrders(params?: { page?: number; size?: number }) {
  return useQuery({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getMyOrders(params),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
  });
}

export function usePlaceOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: PlaceOrderRequest) => ordersApi.placeOrder(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}

export function useCancelOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => ordersApi.cancelOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.lists() });
    },
  });
}
