"use client";

import { useState, useRef } from "react";
import { Tag, Pencil, Trash2, Loader2, Plus, Search, ImageOff, Upload, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import Image from "next/image";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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

import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useUploadCategoryImage,
} from "@/lib/hooks/useAdmin";
import { categorySchema, type CategoryFormData } from "@/lib/validations/admin";
import type { CategoryDTO } from "@/lib/types/catalog";
import { getApiError } from "@/lib/errors";

// ── Category form dialog ───────────────────────────────────────────────────

interface CategoryDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: CategoryDTO;
}

function CategoryDialog({ open, onClose, editing }: CategoryDialogProps) {
  const isEdit = !!editing;
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const uploadImage = useUploadCategoryImage();

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(editing?.imageUrl ?? null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    values: editing
      ? { name: editing.name, slug: editing.slug ?? "", description: editing.description ?? "" }
      : { name: "", slug: "", description: "" },
  });

  function handleClose() {
    reset();
    setPendingFile(null);
    setPreviewUrl(null);
    onClose();
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  }

  function clearImage() {
    setPendingFile(null);
    setPreviewUrl(editing?.imageUrl ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function onSubmit(data: CategoryFormData) {
    try {
      let categoryId: string;

      if (isEdit && editing) {
        const updated = await updateCategory.mutateAsync({
          id: editing.id,
          body: {
            name: data.name,
            slug: data.slug || undefined,
            description: data.description || undefined,
          },
        });
        categoryId = updated.id;
        if (!pendingFile) {
          toast.success(`"${data.name}" updated`);
          handleClose();
          return;
        }
      } else {
        const created = await createCategory.mutateAsync({
          name: data.name,
          description: data.description || undefined,
        });
        categoryId = created.id;
      }

      if (pendingFile) {
        await uploadImage.mutateAsync({ id: categoryId, file: pendingFile });
      }

      toast.success(isEdit ? `"${data.name}" updated` : `"${data.name}" created`);
      handleClose();
    } catch (err) {
      toast.error(getApiError(err, isEdit ? "Failed to update category" : "Failed to create category"));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Category" : "New Category"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-2">
          <div className="space-y-1">
            <Label htmlFor="cat-name">Name *</Label>
            <Input
              id="cat-name"
              placeholder="e.g. Grains & Cereals"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {isEdit && (
            <div className="space-y-1">
              <Label htmlFor="cat-slug">Slug</Label>
              <Input
                id="cat-slug"
                placeholder="e.g. cleaning-essentials"
                {...register("slug")}
              />
              <p className="text-xs text-muted-foreground">
                Used in URLs. Use lowercase letters, numbers, and hyphens only.
              </p>
              {errors.slug && (
                <p className="text-xs text-destructive">{errors.slug.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1">
            <Label htmlFor="cat-desc">Description</Label>
            <Textarea
              id="cat-desc"
              placeholder="Optional description…"
              rows={3}
              {...register("description")}
            />
          </div>

          {/* Image upload */}
          <div className="space-y-2">
            <Label>Category Image</Label>
            {previewUrl ? (
              <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                <Image
                  src={previewUrl}
                  alt="Category image preview"
                  fill
                  className="object-cover"
                  unoptimized={previewUrl.startsWith("blob:")}
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 p-1 rounded-full bg-background/80 hover:bg-background border shadow-sm"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-2 right-2 flex items-center gap-1.5 text-xs px-2 py-1 rounded-md bg-background/80 hover:bg-background border shadow-sm"
                >
                  <Upload className="h-3 w-3" />
                  Change
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-2 h-28 rounded-lg border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/50 hover:bg-muted/50 transition-colors text-muted-foreground"
              >
                <Upload className="h-6 w-6" />
                <span className="text-sm">Click to upload image</span>
                <span className="text-xs">JPEG, PNG, WebP — max 5 MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function CategoriesPage() {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<CategoryDTO | undefined>(undefined);

  const { data: categories = [], isLoading } = useAdminCategories();
  const deleteCategory = useDeleteCategory();

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(cat: CategoryDTO) {
    setEditing(cat);
    setDialogOpen(true);
  }

  async function handleDelete(id: string, name: string) {
    try {
      await deleteCategory.mutateAsync(id);
      toast.success(`"${name}" deleted`);
    } catch (err) {
      toast.error(getApiError(err, "Failed to delete category"));
    }
  }

  return (
    <>
      <AdminHeader
        title="Categories"
        actions={
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4 mr-1" />
            New Category
          </Button>
        }
      />

      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="rounded-lg border bg-background">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12" />
                <TableHead>Name</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Products</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-16">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Tag className="h-8 w-8" />
                      <p className="text-sm">
                        {search ? "No categories match your search" : "No categories yet"}
                      </p>
                      {!search && (
                        <Button variant="outline" size="sm" onClick={openCreate}>
                          Create your first category
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((cat) => (
                  <TableRow key={cat.id}>
                    <TableCell>
                      {cat.imageUrl ? (
                        <Image
                          src={cat.imageUrl}
                          alt={cat.name}
                          width={36}
                          height={36}
                          className="h-9 w-9 rounded object-cover"
                        />
                      ) : (
                        <div className="h-9 w-9 rounded bg-muted flex items-center justify-center">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium">{cat.name}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs">
                        {cat.slug}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {cat.description ?? "—"}
                    </TableCell>
                    <TableCell className="text-right text-sm">
                      {cat.productCount ?? 0}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => openEdit(cat)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger
                            render={
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                              />
                            }
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete category?</AlertDialogTitle>
                              <AlertDialogDescription>
                                &quot;{cat.name}&quot; will be soft-deleted. Products in this
                                category will not be affected.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(cat.id, cat.name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                {deleteCategory.isPending ? (
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
      </div>

      <CategoryDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </>
  );
}
