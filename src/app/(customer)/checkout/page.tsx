"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, CreditCard, Truck, ShieldCheck, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { FormError } from "@/components/forms/FormError";
import { ShippingAddressForm } from "@/components/checkout/ShippingAddressForm";
import { SavedAddressPicker } from "@/components/checkout/SavedAddressPicker";
import { OrderSummaryPanel } from "@/components/checkout/OrderSummaryPanel";

import { checkoutSchema, type CheckoutFormData } from "@/lib/validations/checkout";
import { useCartStore } from "@/lib/stores/cartStore";
import { useAuthStore } from "@/lib/stores/authStore";
import { usePlaceOrder } from "@/lib/hooks/useOrders";
import { useCustomerAddresses } from "@/lib/hooks/useCustomer";
import { pincodeApi } from "@/lib/api/catalog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getApiError } from "@/lib/errors";

const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    description: "Pay when your order arrives",
    icon: Truck,
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)();
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal)();
  const clearCart = useCartStore((s) => s.clear);
  const [serverError, setServerError] = useState("");

  // Authenticated users start with saved-address mode; guests always use new
  const [addressMode, setAddressMode] = useState<"saved" | "new">(
    isAuthenticated ? "saved" : "new"
  );

  const { mutateAsync: placeOrder, isPending } = usePlaceOrder();
  const { data: savedAddresses } = useCustomerAddresses();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      addressMode: isAuthenticated ? "saved" : "new",
      paymentMethod: "cod",
      country: "India",
    },
  });

  // Derive the current pincode for min-order lookup
  const savedAddressId = form.watch("savedAddressId");
  const newPostalCode = form.watch("postalCode");

  const activePincode =
    addressMode === "saved"
      ? (savedAddresses?.find((a) => a.id === savedAddressId)?.postalCode ?? "")
      : (newPostalCode ?? "");

  const { data: pincodeRule } = useQuery({
    queryKey: ["pincode-min-order", activePincode],
    queryFn: () => pincodeApi.getMinOrder(activePincode),
    enabled: activePincode.length === 6,
    retry: false,
  });

  const belowMinOrder =
    pincodeRule != null && subtotal < pincodeRule.minAmount;

  // Redirect if cart is empty
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-4">
        <h1 className="text-xl font-semibold">Your cart is empty</h1>
        <p className="text-muted-foreground text-sm">Add products before checking out.</p>
        <Link href="/products" className={cn(buttonVariants())}>
          Browse products
        </Link>
      </div>
    );
  }

  function switchToNew() {
    setAddressMode("new");
    form.setValue("addressMode", "new");
    form.setValue("savedAddressId", undefined);
  }

  function switchToSaved() {
    setAddressMode("saved");
    form.setValue("addressMode", "saved");
  }

  async function onSubmit(data: CheckoutFormData) {
    setServerError("");
    try {
      const orderItems = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const order = await placeOrder({
        items: orderItems,
        paymentMethod: data.paymentMethod,
        notes: data.notes,
        ...(data.addressMode === "saved"
          ? { shippingAddressId: data.savedAddressId }
          : {
              shippingAddress: {
                fullName: data.fullName!,
                addressLine1: data.addressLine1!,
                addressLine2: data.addressLine2,
                city: data.city!,
                state: data.state!,
                postalCode: data.postalCode!,
                country: data.country ?? "India",
                phoneNumber: data.phoneNumber || undefined,
                saveAddress: data.saveAddress,
              },
            }),
      });

      toast.success("Order placed successfully!");
      router.push(`/checkout/confirmation/${order.id}`);
      clearCart();
    } catch (err: unknown) {
      setServerError(getApiError(err, "Failed to place order. Please try again."));
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">Checkout</h1>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <div className="grid md:grid-cols-3 gap-8">
          {/* Left column — address + payment */}
          <div className="md:col-span-2 space-y-8">
            <FormError message={serverError} />

            {/* ── Shipping address ─────────────────────────────── */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-lg">Shipping address</h2>
                {isAuthenticated && addressMode === "new" && (
                  <button
                    type="button"
                    onClick={switchToSaved}
                    className="text-xs text-primary hover:underline"
                  >
                    Use saved address
                  </button>
                )}
              </div>

              {isAuthenticated && addressMode === "saved" ? (
                <SavedAddressPicker form={form} onAddNew={switchToNew} />
              ) : (
                <ShippingAddressForm form={form} />
              )}
            </section>

            <Separator />

            {/* ── Payment method ───────────────────────────────── */}
            <section className="space-y-4">
              <h2 className="font-semibold text-lg">Payment method</h2>

              <div className="space-y-2">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const selected = form.watch("paymentMethod") === method.id;
                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors",
                        selected
                          ? "border-primary bg-primary/5"
                          : "hover:border-muted-foreground/40"
                      )}
                    >
                      <input
                        type="radio"
                        className="accent-primary"
                        value={method.id}
                        checked={selected}
                        onChange={() =>
                          form.setValue("paymentMethod", method.id as "cod", {
                            shouldValidate: true,
                          })
                        }
                      />
                      <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-sm font-medium">{method.label}</p>
                        <p className="text-xs text-muted-foreground">{method.description}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </section>

            <Separator />

            {/* ── Order notes ──────────────────────────────────── */}
            <section className="space-y-2">
              <Label htmlFor="notes" className="font-semibold text-base">
                Order notes{" "}
                <span className="font-normal text-muted-foreground text-sm">(optional)</span>
              </Label>
              <textarea
                id="notes"
                rows={3}
                placeholder="Special delivery instructions, reference numbers…"
                className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 outline-none resize-none"
                {...form.register("notes")}
              />
            </section>

            {/* ── Pincode minimum order warning ────────────────── */}
            {belowMinOrder && pincodeRule && (
              <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700 px-4 py-3 text-sm">
                <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                <p className="text-amber-800 dark:text-amber-300">
                  Minimum order for pincode <strong>{activePincode}</strong> is{" "}
                  <strong>₹{pincodeRule.minAmount.toLocaleString("en-IN")}</strong>. Your
                  current subtotal is ₹{subtotal.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.
                  Please add more items to proceed.
                </p>
              </div>
            )}

            {/* ── Trust badges ─────────────────────────────────── */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-green-500" />
                Secure checkout
              </div>
              <div className="flex items-center gap-1.5">
                <CreditCard className="h-4 w-4 text-blue-500" />
                No hidden charges
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="h-4 w-4 text-orange-500" />
                Free shipping
              </div>
            </div>
          </div>

          {/* Right column — order summary + CTA */}
          <div className="md:col-span-1 md:sticky md:top-6 md:self-start md:flex md:flex-col md:max-h-[calc(100vh-3rem)]">
            {/* Summary scrolls if too tall */}
            <div className="md:overflow-y-auto md:flex-1 space-y-4">
              <OrderSummaryPanel />
            </div>
            {/* Button always pinned at bottom of the sticky panel */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isPending || belowMinOrder}
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Place order
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
