"use client";

import { useState } from "react";
import { MapPin, Pencil, Trash2, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { AdminHeader } from "@/components/layout/AdminHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  useAdminPincodeRules,
  useCreatePincodeRule,
  useUpdatePincodeRule,
  useDeletePincodeRule,
} from "@/lib/hooks/useAdmin";
import type { PincodeMinOrderDTO, PincodeMinOrderRequest } from "@/lib/types/catalog";
import { getApiError } from "@/lib/errors";

const ruleSchema = z.object({
  pincode: z.string().regex(/^\d{6}$/, "Must be exactly 6 digits"),
  minAmount: z.number().min(1, "Must be at least ₹1"),
  active: z.boolean().optional(),
});

type RuleFormData = z.infer<typeof ruleSchema>;

interface RuleDialogProps {
  open: boolean;
  onClose: () => void;
  editing?: PincodeMinOrderDTO;
}

function RuleDialog({ open, onClose, editing }: RuleDialogProps) {
  const isEdit = !!editing;
  const createRule = useCreatePincodeRule();
  const updateRule = useUpdatePincodeRule();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: {
      pincode: editing?.pincode ?? "",
      minAmount: editing?.minAmount ?? 0,
      active: editing?.active ?? true,
    },
  });

  function handleClose() {
    reset();
    onClose();
  }

  async function onSubmit(data: RuleFormData) {
    const body: PincodeMinOrderRequest = {
      pincode: data.pincode,
      minAmount: data.minAmount,
      active: data.active ?? true,
    };
    try {
      if (isEdit) {
        await updateRule.mutateAsync({ id: editing!.id, body });
        toast.success("Pincode rule updated");
      } else {
        await createRule.mutateAsync(body);
        toast.success("Pincode rule created");
      }
      handleClose();
    } catch (err) {
      toast.error(getApiError(err));
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Pincode Rule" : "Add Pincode Rule"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="pincode">Pincode</Label>
            <Input
              id="pincode"
              placeholder="e.g. 132001"
              maxLength={6}
              {...register("pincode")}
            />
            {errors.pincode && (
              <p className="text-sm text-destructive">{errors.pincode.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="minAmount">Minimum Order Amount (₹)</Label>
            <Input
              id="minAmount"
              type="number"
              min={1}
              step={1}
              placeholder="e.g. 15000"
              {...register("minAmount", { valueAsNumber: true })}
            />
            {errors.minAmount && (
              <p className="text-sm text-destructive">{errors.minAmount.message}</p>
            )}
          </div>
          {isEdit && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                className="h-4 w-4 rounded border-gray-300"
                defaultChecked={editing?.active ?? true}
                {...register("active")}
              />
              <Label htmlFor="active">Active</Label>
            </div>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving…" : isEdit ? "Save Changes" : "Create Rule"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function PincodeRulesPage() {
  const { data: rules, isLoading } = useAdminPincodeRules();
  const deleteRule = useDeletePincodeRule();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<PincodeMinOrderDTO | undefined>();

  function openCreate() {
    setEditing(undefined);
    setDialogOpen(true);
  }

  function openEdit(rule: PincodeMinOrderDTO) {
    setEditing(rule);
    setDialogOpen(true);
  }

  async function handleDelete(id: string) {
    try {
      await deleteRule.mutateAsync(id);
      toast.success("Rule deleted");
    } catch (err) {
      toast.error(getApiError(err));
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <AdminHeader
        title="Pincode Minimum Order Rules"
        actions={
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Rule
          </Button>
        }
      />

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Pincode</TableHead>
              <TableHead>Minimum Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 4 }).map((__, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : !rules?.length ? (
              <TableRow>
                <TableCell colSpan={4} className="py-12 text-center text-muted-foreground">
                  <MapPin className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  No pincode rules configured yet.
                </TableCell>
              </TableRow>
            ) : (
              rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono font-medium">{rule.pincode}</TableCell>
                  <TableCell>
                    ₹{rule.minAmount.toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <Badge variant={rule.active ? "default" : "secondary"}>
                      {rule.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(rule)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger
                          render={
                            <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" />
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Rule?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the minimum order rule for pincode{" "}
                              <strong>{rule.pincode}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              onClick={() => handleDelete(rule.id)}
                            >
                              Delete
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

      <RuleDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editing}
      />
    </div>
  );
}
