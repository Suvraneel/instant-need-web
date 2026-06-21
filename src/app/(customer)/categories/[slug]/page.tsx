"use client";

import { use } from "react";
import Link from "next/link";
import { Suspense } from "react";
import { ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategory } from "@/lib/hooks/useCatalog";
import { ProductsContent } from "@/app/(customer)/products/ProductsContent";

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = use(params);
  const { data: category, isLoading } = useCategory(slug);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      {isLoading ? (
        <Skeleton className="h-8 w-48" />
      ) : (
        <div>
          <nav className="flex items-center gap-1.5 text-sm text-muted-foreground mb-2">
            <Link href="/home" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href="/categories" className="hover:text-foreground transition-colors">Categories</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-foreground font-medium">{category?.name ?? slug}</span>
          </nav>
          <h1 className="text-2xl font-bold">{category?.name ?? "Category"}</h1>
          {category?.description && (
            <p className="text-muted-foreground text-sm mt-1">{category.description}</p>
          )}
        </div>
      )}

      {/* Products filtered to this category */}
      <Suspense fallback={
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      }>
        {category && <ProductsContent fixedCategoryId={category.id} />}
      </Suspense>
    </div>
  );
}
