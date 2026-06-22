export interface CategoryDTO {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  productCount?: number;
}

export interface PricingTierDTO {
  id: string;
  minQty: number;
  maxQty?: number;
  unitPrice: number;
  currencyCode: string;
}

export interface ProductImageDTO {
  id: string;
  url: string;
  altText?: string;
  displayOrder: number;
}

export interface ProductDTO {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description?: string;
  categoryId: string;
  categoryName: string;
  mrp?: number;
  basePrice: number;
  currencyCode: string;
  stock: number;
  moq: number;
  active: boolean;
  images: ProductImageDTO[];
  pricingTiers: PricingTierDTO[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  sku: string;
  categoryName: string;
  mrp?: number;
  basePrice: number;
  currencyCode: string;
  stock: number;
  moq: number;
  active: boolean;
  primaryImageUrl?: string;
}

export interface ProductFilterParams {
  search?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  active?: boolean;
  page?: number;
  size?: number;
  sort?: string;
}

export interface PricingTierRequest {
  minQty: number;
  maxQty?: number;
  unitPrice: number;
  currencyCode: string;
}

export interface CreateProductRequest {
  name: string;
  sku: string;
  description?: string;
  categoryId: string;
  basePrice: number;
  currencyCode: string;
  stock: number;
  moq: number;
  active: boolean;
  pricingTiers?: PricingTierRequest[];
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface PriceCheckRequest {
  productId: string;
  quantity: number;
}

export interface PriceCheckResponse {
  productId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  currencyCode: string;
  tierApplied?: PricingTierDTO;
}
