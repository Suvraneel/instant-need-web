"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Package, Truck, ShieldCheck, LayoutGrid } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard, ProductCardSkeleton } from "@/components/catalog/ProductCard";
import { useCategories, useProducts } from "@/lib/hooks/useCatalog";
import { useAuthStore } from "@/lib/stores/authStore";
import { cn } from "@/lib/utils";

const FEATURES = [
  { icon: Package, title: "Bulk Ordering", description: "Tiered pricing that rewards volume." },
  { icon: Truck, title: "Fast Delivery", description: "Reliable B2B logistics with real-time tracking." },
  { icon: ShieldCheck, title: "Verified Suppliers", description: "Every product from vetted wholesale suppliers." },
];

function FeaturedCategories() {
  const { data: categories, isLoading } = useCategories();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!categories || categories.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {categories.slice(0, 8).map((cat) => (
        <Link key={cat.id} href={`/categories/${cat.slug}`} className="group block">
          <Card className="overflow-hidden h-full transition-shadow hover:shadow-md">
            <div className="relative h-24 bg-muted overflow-hidden">
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
                  <LayoutGrid className="h-8 w-8 text-muted-foreground/20" strokeWidth={1} />
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                {cat.name}
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

function FeaturedProducts() {
  const { data, isLoading } = useProducts({ size: 8, sort: "createdAt,desc" });

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)}
      </div>
    );
  }

  if (!data || (data.items?.length ?? 0) === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {(data.items ?? []).map((p) => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

export default function HomePage() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-background py-24 px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
            Wholesale made <span className="text-primary">simple</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Browse thousands of B2B products, unlock volume discounts, and manage
            your business orders, all in one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
              Browse Catalog <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/register" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Shop by Category</h2>
            <Link href="/categories" className="text-sm text-primary hover:underline flex items-center gap-1">
              All categories <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FeaturedCategories />
        </div>
      </section>

      {/* Featured products */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Latest Products</h2>
            <Link href="/products" className="text-sm text-primary hover:underline flex items-center gap-1">
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <FeaturedProducts />
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-10">Built for B2B businesses</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div key={f.title} className="flex flex-col items-center text-center gap-3 p-6 rounded-xl bg-background border">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-5">
          <h2 className="text-2xl font-bold">Ready to start ordering?</h2>
          <p className="text-muted-foreground">Join thousands of businesses already using InstantNeed.</p>
          {isAuthenticated ? (
            <Link href="/products" className={cn(buttonVariants({ size: "lg" }))}>
              Browse products
            </Link>
          ) : (
            <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
              Get started for free
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
