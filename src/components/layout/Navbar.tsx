"use client";

import Link from "next/link";
import { ShoppingCart, User, Menu, Package2, Search, LogOut } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useAuthStore } from "@/lib/stores/authStore";
import { useCartStore } from "@/lib/stores/cartStore";
import { useUIStore } from "@/lib/stores/uiStore";
import { authApi } from "@/lib/api/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Products", href: "/products" },
  { label: "Categories", href: "/categories" },
];

export function Navbar() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  const totalItems = useCartStore((s) => s.totalItems)();
  const { mobileMenuOpen, setMobileMenuOpen } = useUIStore();

  async function handleLogout() {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    logout();
    router.push("/login");
    toast.success("Logged out successfully");
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center px-4 gap-6">
        {/* Logo */}
        <Link href="/home" className="flex items-center gap-2 font-bold text-lg shrink-0">
          <Package2 className="h-6 w-6 text-primary" />
          <span>InstantNeed</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Search — desktop */}
        <Link
          href="/products"
          className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "hidden md:flex")}
        >
          <Search className="h-5 w-5" />
        </Link>

        {/* Cart */}
        <Link href="/cart" className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "relative")}>
          <ShoppingCart className="h-5 w-5" />
          {totalItems > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px]">
              {totalItems > 99 ? "99+" : totalItems}
            </Badge>
          )}
        </Link>

        {/* Auth */}
        {isAuthenticated && user ? (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" />}>
              <User className="h-5 w-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel className="font-normal">
                <p className="text-sm font-medium">{user.email}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role.toLowerCase()}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push("/account/profile")}>
                My Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/account/orders")}>
                My Orders
              </DropdownMenuItem>
              {user.role === "ADMIN" && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    Admin Dashboard
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} variant="destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="hidden md:flex items-center gap-2">
            <Link href="/login" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
              Sign in
            </Link>
            <Link href="/register" className={cn(buttonVariants({ size: "sm" }))}>
              Get started
            </Link>
          </div>
        )}

        {/* Mobile menu */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="w-72">
            <Link
              href="/home"
              className="flex items-center gap-2 font-bold text-lg mb-8"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Package2 className="h-6 w-6 text-primary" />
              InstantNeed
            </Link>
            <nav className="flex flex-col">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base font-medium py-3 pl-2 border-b border-border/50 hover:text-primary transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-4" />
              {isAuthenticated ? (
                <>
                  <Link href="/account/profile" className="text-base py-3 pl-2 border-b border-border/50 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    My Profile
                  </Link>
                  <Link href="/account/orders" className="text-base py-3 pl-2 border-b border-border/50 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    My Orders
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setMobileMenuOpen(false); }}
                    className="text-left text-base py-3 pl-2 text-destructive"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-base py-3 pl-2 border-b border-border/50 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Sign in
                  </Link>
                  <Link href="/register" className="text-base py-3 pl-2 hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Get started
                  </Link>
                </>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
