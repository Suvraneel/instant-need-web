import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight, Package, Truck, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: Package,
    title: "Bulk Ordering",
    description: "Order in bulk with tiered pricing that rewards volume.",
  },
  {
    icon: Truck,
    title: "Fast Delivery",
    description: "Reliable B2B logistics with real-time order tracking.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Suppliers",
    description: "Every product is sourced from vetted wholesale suppliers.",
  },
];

export default function HomePage() {
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
            your business orders — all in one place.
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

      {/* Features */}
      <section className="py-20 px-4 bg-muted/20">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            Built for B2B businesses
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="flex flex-col items-center text-center gap-4 p-6 rounded-xl bg-background border"
                >
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Ready to start ordering?
          </h2>
          <p className="text-muted-foreground">
            Join thousands of businesses already using InstantNeed.
          </p>
          <Link href="/register" className={cn(buttonVariants({ size: "lg" }))}>
            Get started for free
          </Link>
        </div>
      </section>
    </div>
  );
}
