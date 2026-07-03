import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { ProductListItem } from "@/lib/types/catalog";

interface ProductCardProps {
  product: ProductListItem;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
        {/* Image */}
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.primaryImageUrl ? (
            <Image
              src={product.primaryImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Package className="h-12 w-12 text-muted-foreground/30" strokeWidth={1} />
            </div>
          )}
          {product.stock > 0 && product.mrp && product.mrp > product.basePrice && (
            <Badge className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[10px] font-bold shadow-sm [a]:hover:bg-red-600">
              {Math.round((1 - product.basePrice / product.mrp) * 100)}% OFF
            </Badge>
          )}
          {product.stock === 0 && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center">
              <Badge variant="secondary">Out of stock</Badge>
            </div>
          )}
        </div>

        <CardContent className="p-3 space-y-1">
          <p className="text-xs text-muted-foreground truncate">{product.categoryName}</p>
          <h3 className="text-sm font-medium leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono">{product.sku}</p>
          <div className="flex items-end justify-between pt-1">
            <div>
              {product.mrp && product.mrp > product.basePrice && (
                <p className="text-xs text-muted-foreground line-through">
                  MRP {formatCurrency(product.mrp, product.currencyCode)}
                </p>
              )}
              <p className="text-base font-semibold">
                {formatCurrency(product.basePrice, product.currencyCode)}
              </p>
              <p className="text-[10px] text-muted-foreground">
                Min. order: {product.moq} items
              </p>
            </div>
            {product.stock > 0 && product.stock <= 20 && (
              <Badge variant="destructive" className="text-[10px]">
                Only {product.stock} left
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export function ProductCardSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="aspect-square bg-muted animate-pulse" />
      <div className="p-3 space-y-2">
        <div className="h-3 w-16 bg-muted animate-pulse rounded" />
        <div className="h-4 w-full bg-muted animate-pulse rounded" />
        <div className="h-3 w-20 bg-muted animate-pulse rounded" />
        <div className="h-5 w-24 bg-muted animate-pulse rounded mt-2" />
      </div>
    </div>
  );
}
