import apiClient from "./client";
import type {
  CustomerProfileDTO,
  UpdateProfileRequest,
  AddressDTO,
  CreateAddressRequest,
} from "@/lib/types/customer";

export const customerApi = {
  getProfile: () =>
    apiClient.get<CustomerProfileDTO>("/me").then((r) => r.data),

  updateProfile: (body: UpdateProfileRequest) =>
    apiClient.put<CustomerProfileDTO>("/me", body).then((r) => r.data),

  getAddresses: () =>
    apiClient.get<AddressDTO[]>("/me/addresses").then((r) => r.data),

  createAddress: (body: CreateAddressRequest) =>
    apiClient
      .post<AddressDTO>("/me/addresses", body)
      .then((r) => r.data),

  updateAddress: (id: string, body: Partial<CreateAddressRequest>) =>
    apiClient
      .patch<AddressDTO>(`/me/addresses/${id}`, body)
      .then((r) => r.data),

  deleteAddress: (id: string) =>
    apiClient.delete<void>(`/me/addresses/${id}`).then((r) => r.data),

  setDefaultAddress: (id: string) =>
    apiClient
      .patch<AddressDTO>(`/me/addresses/${id}/default`)
      .then((r) => r.data),
};

export const adminCustomerApi = {
  getCustomers: (params?: { search?: string; page?: number; size?: number }) =>
    apiClient.get("/admin/customers", { params }).then((r) => r.data),

  getCustomer: (id: string) =>
    apiClient.get(`/admin/customers/${id}`).then((r) => r.data),
};
