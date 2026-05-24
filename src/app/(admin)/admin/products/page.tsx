"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { Plus, Search, Pencil, Trash2, Loader2, Package } from "lucide-react";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useAdminProducts, useDeleteProduct } from "@/lib/hooks/useAdmin";
import { useCategories } from "@/lib/hooks/useCatalog";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { getApiError } from "@/lib/errors";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function ProductsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId] = useState(searchParams.get("categoryId") ?? "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("active") ?? "");

  const { data: categoriesData } = useCategories();
  const categories = categoriesData ?? [];

  const params = {
    search: search || undefined,
    categoryId: categoryId || undefined,
    ...(activeFilter !== "" ? { inStock: activeFilter === "active" } : {}),
  };

  const { data, isLoading } = useAdminProducts(params);
  const deleteProduct = useDeleteProduct();
  const products = data?.content ?? [];

  async function handleDelete(id: string, name: string) {
    try {
      await deleteProduct.mutateAsync(id);
      toast.success(`"${name}" deleted`);
    } catch (err) {
      toast.error(getApiError(err, "Failed to delete product"));
    }
  }

  return (
    <>
      <AdminHeader
        title="Products"
        actions={
          <Link
            href="/admin/products/new"
            className={cn(buttonVariants({ size: "sm" }))}
          >
            <Plus className="h-4 w-4 mr-1" />
            New Product
          </Link>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={categoryId || "all"} onValueChange={(v) => setCategoryId(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={activeFilter || "all"} onValueChange={(v) => setActiveFilter(!v || v === "all" ? "" : v)}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead className="text-right">MOQ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 8 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : products.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {p.primaryImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={p.primaryImageUrl}
                            alt={p.name}
                            className="h-9 w-9 rounded object-cover shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded bg-muted flex items-center justify-center shrink-0">
                            <Package className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                        <span className="font-medium text-sm">{p.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground font-mono">
                      {p.sku}
                    </TableCell>
                    <TableCell className="text-sm">{p.categoryName}</TableCell>
                    <TableCell className="text-right text-sm">
                      {formatCurrency(p.basePrice, p.currencyCode)}
                    </TableCell>
                    <TableCell className="text-right text-sm">{p.stock}</TableCell>
                    <TableCell className="text-right text-sm">{p.moq}</TableCell>
                    <TableCell>
                      <Badge
                        variant={p.active ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {p.active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => router.push(`/admin/products/${p.id}/edit`)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" />}>
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete product?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{p.name}&quot; will be permanently deleted and cannot be restored.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(p.id, p.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteProduct.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  "Delete"
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <p>
              Showing {products.length} of {data.totalElements} products
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={data.first}
                onClick={() =>
                  router.push(
                    `/admin/products?page=${(data.number ?? 0) - 1}`
                  )
                }
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={data.last}
                onClick={() =>
                  router.push(
                    `/admin/products?page=${(data.number ?? 0) + 1}`
                  )
                }
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <>
          <AdminHeader title="Products" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full max-w-xs" />
            <Skeleton className="h-64 w-full" />
          </div>
        </>
      }
    >
      <ProductsContent />
    </Suspense>
  );
}
