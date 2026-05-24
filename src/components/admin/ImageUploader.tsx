"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Loader2, Trash2, Upload, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUploadProductImage, useDeleteProductImage } from "@/lib/hooks/useAdmin";
import { getApiError } from "@/lib/errors";
import type { ProductImageDTO } from "@/lib/types/catalog";

interface ImageUploaderProps {
  productId: string;
  images: ProductImageDTO[];
}

const ACCEPTED = "image/jpeg,image/png,image/webp,image/gif";
const MAX_MB = 5;

export function ImageUploader({ productId, images }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const upload = useUploadProductImage(productId);
  const remove = useDeleteProductImage(productId);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];

    // Client-side guard
    if (file.size > MAX_MB * 1024 * 1024) {
      toast.error(`File too large — maximum is ${MAX_MB} MB`);
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are supported (JPEG, PNG, WebP, GIF)");
      return;
    }

    try {
      await upload.mutateAsync({ file, altText: file.name.replace(/\.[^.]+$/, "") });
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(getApiError(err, "Upload failed"));
    }
  }

  async function handleDelete(imageId: string) {
    try {
      await remove.mutateAsync(imageId);
      toast.success("Image removed");
    } catch (err) {
      toast.error(getApiError(err, "Could not remove image"));
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Product Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing images */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {images
              .slice()
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border bg-muted aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img.url}
                    alt={img.altText ?? "product image"}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDelete(img.id)}
                    disabled={remove.isPending}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1
                               opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                    aria-label="Remove image"
                  >
                    {remove.isPending ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Trash2 className="h-3 w-3" />
                    )}
                  </button>
                </div>
              ))}
          </div>
        )}

        {/* Drop zone */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={`
            flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed
            p-8 text-center cursor-pointer transition-colors
            ${dragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/50 hover:bg-muted/50"
            }
            ${upload.isPending ? "pointer-events-none opacity-60" : ""}
          `}
        >
          {upload.isPending ? (
            <>
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Uploading…</p>
            </>
          ) : (
            <>
              <div className="rounded-full bg-muted p-3">
                {images.length === 0 ? (
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                ) : (
                  <Upload className="h-6 w-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <p className="text-sm font-medium">
                  {images.length === 0 ? "Add product images" : "Upload another image"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Drag &amp; drop or click — JPEG, PNG, WebP, GIF · Max {MAX_MB} MB
                </p>
              </div>
            </>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {images.length === 0 && (
          <p className="text-xs text-muted-foreground">
            Save the product first, then upload images here.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
