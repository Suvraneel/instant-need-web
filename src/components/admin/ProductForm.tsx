"use client";

import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { getApiError } from "@/lib/errors";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { productSchema, type ProductFormData } from "@/lib/validations/admin";
import { useCategories } from "@/lib/hooks/useCatalog";
import { useCreateProduct, useUpdateProduct } from "@/lib/hooks/useAdmin";
import type { ProductDTO } from "@/lib/types/catalog";
import { PricingTierEditor } from "./PricingTierEditor";

interface ProductFormProps {
  product?: ProductDTO; // undefined = create mode
}

export function ProductForm({ product }: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!product;

  const { data: categoriesData, isLoading: catLoading } = useCategories();
  const categories = categoriesData ?? [];

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct(product?.id ?? "");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const methods = useForm<ProductFormData>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: {
      name: "",
      sku: "",
      description: "",
      categoryId: "",
      basePrice: 0,
      currencyCode: "INR",
      stock: 0,
      moq: 1,
      active: true,
      pricingTiers: [],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
    reset,
  } = methods;

  // Populate form in edit mode
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku,
        description: product.description ?? "",
        categoryId: product.categoryId,
        basePrice: product.basePrice,
        currencyCode: product.currencyCode,
        stock: product.stock,
        moq: product.moq,
        active: product.active,
        pricingTiers: product.pricingTiers.map((t) => ({
          minQty: t.minQty,
          maxQty: t.maxQty,
          unitPrice: t.unitPrice,
          currencyCode: t.currencyCode,
        })),
      });
    }
  }, [product, reset]);

  async function onSubmit(data: ProductFormData) {
    // Sanitise pricingTiers — remove empty maxQty
    const tiers = data.pricingTiers.map((t) => ({
      minQty: t.minQty,
      maxQty: t.maxQty === "" || t.maxQty === undefined ? undefined : t.maxQty,
      unitPrice: t.unitPrice,
      currencyCode: t.currencyCode,
    }));

    const payload = { ...data, pricingTiers: tiers };

    try {
      if (isEdit) {
        await updateProduct.mutateAsync(payload);
        toast.success("Product updated");
      } else {
        await createProduct.mutateAsync(payload);
        toast.success("Product created");
        router.push("/admin/products");
      }
    } catch (err) {
      toast.error(getApiError(err, isEdit ? "Failed to update product" : "Failed to create product"));
    }
  }

  const activeValue = watch("active");

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-3xl">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="name">Product Name *</Label>
                <Input id="name" {...register("name")} placeholder="e.g. Basmati Rice 5kg" />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" {...register("sku")} placeholder="e.g. RICE-BAS-5KG" />
                {errors.sku && (
                  <p className="text-xs text-destructive">{errors.sku.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                {...register("description")}
                placeholder="Optional product description..."
                rows={3}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="categoryId">Category *</Label>
              <Select
                value={watch("categoryId")}
                onValueChange={(v) => setValue("categoryId", v ?? "", { shouldValidate: true })}
                disabled={catLoading}
              >
                <SelectTrigger id="categoryId">
                  <SelectValue placeholder={catLoading ? "Loading…" : "Select a category"} />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pricing & Stock */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pricing & Stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label htmlFor="basePrice">Base Price (₹) *</Label>
                <Input
                  id="basePrice"
                  type="number"
                  min={0.01}
                  step={0.01}
                  {...register("basePrice")}
                  placeholder="0.00"
                />
                {errors.basePrice && (
                  <p className="text-xs text-destructive">{errors.basePrice.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min={0}
                  {...register("stock")}
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="text-xs text-destructive">{errors.stock.message}</p>
                )}
              </div>
              <div className="space-y-1">
                <Label htmlFor="moq">Min. Order Qty (MOQ) *</Label>
                <Input
                  id="moq"
                  type="number"
                  min={1}
                  {...register("moq")}
                  placeholder="1"
                />
                {errors.moq && (
                  <p className="text-xs text-destructive">{errors.moq.message}</p>
                )}
              </div>
            </div>

            <Separator />
            <PricingTierEditor />
          </CardContent>
        </Card>

        {/* Status */}
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">
                  Inactive products won't appear in the catalog
                </p>
              </div>
              <Switch
                checked={activeValue}
                onCheckedChange={(v) => setValue("active", v)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEdit ? "Save Changes" : "Create Product"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/admin/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
