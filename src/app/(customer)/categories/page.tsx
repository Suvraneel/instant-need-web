"use client";

import Link from "next/link";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { useCategories } from "@/lib/hooks/useCatalog";

export default function CategoriesPage() {
  const { data: categories, isLoading } = useCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Shop by Category</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse our curated wholesale categories
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-video rounded-xl" />
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No categories yet"
          description="Categories will appear here once products are added."
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="group block">
              <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
                <div className="relative aspect-video bg-muted overflow-hidden">
                  {cat.imageUrl ? (
                    <Image
                      src={cat.imageUrl}
                      alt={cat.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <LayoutGrid className="h-10 w-10 text-muted-foreground/20" strokeWidth={1} />
                    </div>
                  )}
                </div>
                <CardContent className="p-3">
                  <h3 className="font-medium text-sm group-hover:text-primary transition-colors">
                    {cat.name}
                  </h3>
                  {cat.productCount !== undefined && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {cat.productCount} products
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
