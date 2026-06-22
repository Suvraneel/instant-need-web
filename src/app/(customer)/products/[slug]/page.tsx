"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { use } from "react";
import { ChevronRight, ChevronLeft, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { PricingTiersTable } from "@/components/catalog/PricingTiersTable";
import { AddToCartButton } from "@/components/catalog/AddToCartButton";
import { ProductCard, ProductCardSkeleton } from "@/components/catalog/ProductCard";
import { useProduct, useProducts } from "@/lib/hooks/useCatalog";
import { EmptyState } from "@/components/ui/empty-state";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = use(params);
  const { data: product, isLoading, isError } = useProduct(slug);
  const [activeImage, setActiveImage] = useState(0);

  // Related products — same category, exclude current
  const { data: related } = useProducts(
    product ? { categoryId: product.categoryId, size: 4 } : undefined
  );
  const relatedProducts = (related?.items ?? []).filter((p) => p.id !== product?.id).slice(0, 4);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8">
        <EmptyState
          icon={Package}
          title="Product not found"
          description="This product may have been removed or the link is incorrect."
          action={
            <Link href="/products" className="text-sm text-primary hover:underline">
              Browse all products
            </Link>
          }
        />
      </div>
    );
  }

  const images = (product.images ?? []).filter((img) => !img.url?.includes("placehold.co"));
  const primaryImage = images[activeImage]?.url ?? null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/home" className="hover:text-foreground transition-colors">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link
          href={`/categories/${product.categoryId}`}
          className="hover:text-foreground transition-colors"
        >
          {product.categoryName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
      </nav>

      {/* Main product grid */}
      <div className="grid md:grid-cols-2 gap-10">
        {/* Image gallery */}
        <div className="space-y-3">
          <div className="relative aspect-square rounded-xl bg-muted overflow-hidden border group">
            {primaryImage ? (
              <Image
                src={primaryImage}
                alt={images[activeImage]?.altText ?? product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Package className="h-20 w-20 text-muted-foreground/20" strokeWidth={1} />
              </div>
            )}

            {/* Prev / Next arrows — only shown when there are multiple images */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((activeImage - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setActiveImage((activeImage + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-background/80 shadow border opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>

                {/* Dot indicators */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === activeImage ? "w-4 bg-white" : "w-1.5 bg-white/60"
                      }`}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveImage(i)}
                  className={`relative h-16 w-16 rounded-lg border-2 shrink-0 overflow-hidden transition-colors ${
                    i === activeImage ? "border-primary" : "border-transparent hover:border-muted-foreground/40"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt={img.altText ?? `Image ${i + 1}`}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="secondary">{product.categoryName}</Badge>
              {product.stock === 0 ? (
                <Badge variant="destructive">Out of stock</Badge>
              ) : product.stock <= 20 ? (
                <Badge variant="outline">Only {product.stock} left</Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
                  In stock
                </Badge>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl font-bold leading-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground font-mono">SKU: {product.sku}</p>
          </div>

          {product.description && (
            <p className="text-muted-foreground text-sm leading-relaxed">{product.description}</p>
          )}

          <Separator />

          {/* Pricing tiers */}
          <PricingTiersTable
            tiers={product.pricingTiers}
            currencyCode={product.currencyCode}
            basePrice={product.basePrice}
            mrp={product.mrp}
          />

          <Separator />

          {/* Add to cart */}
          <AddToCartButton product={product} />

          {/* Meta */}
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            <p>Stock available: <span className="font-medium text-foreground">{product.stock} items</span></p>
            <p>Minimum order: <span className="font-medium text-foreground">{product.moq} items</span></p>
          </div>
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <Separator />
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">More from {product.categoryName}</h2>
            <Link
              href={`/products?categoryId=${product.categoryId}`}
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.length > 0
              ? relatedProducts.map((p) => <ProductCard key={p.id} product={p} />)
              : Array.from({ length: 4 }).map((_, i) => <ProductCardSkeleton key={i} />)}
          </div>
        </section>
      )}
    </div>
  );
}
