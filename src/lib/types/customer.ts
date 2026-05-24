export interface AddressDTO {
  id: string;
  label?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault: boolean;
}

export interface CustomerProfileDTO {
  id: string;
  userId: string;
  fullName: string;
  businessName: string;
  email: string;
  phoneNumber: string;
  createdAt: string;
}

export interface UpdateProfileRequest {
  fullName: string;
  businessName: string;
  phoneNumber?: string;
}

export interface CreateAddressRequest {
  label?: string;
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
  isDefault?: boolean;
}
