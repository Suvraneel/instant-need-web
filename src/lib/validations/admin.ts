import { z } from "zod";

export const categorySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().optional(),
  description: z.string().optional(),
});

export type CategoryFormData = z.infer<typeof categorySchema>;

export const pricingTierSchema = z.object({
  minQty: z.coerce.number().int().min(1, "Min qty must be ≥ 1"),
  maxQty: z.coerce.number().int().min(1).optional().or(z.literal("")),
  unitPrice: z.coerce.number().positive("Price must be positive"),
  currencyCode: z.string().default("INR"),
});

export const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  sku: z.string().min(1, "SKU is required"),
  description: z.string().optional(),
  categoryId: z.string().min(1, "Category is required"),
  mrp: z.coerce.number().positive("MRP must be positive").optional().or(z.literal("")),
  basePrice: z.coerce.number().positive("Base price must be positive"),
  currencyCode: z.string().default("INR"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  moq: z.coerce.number().int().min(1, "MOQ must be at least 1"),
  active: z.boolean().default(true),
  pricingTiers: z.array(pricingTierSchema).default([]),
});

export type ProductFormData = z.infer<typeof productSchema>;
export type PricingTierFormData = z.infer<typeof pricingTierSchema>;
