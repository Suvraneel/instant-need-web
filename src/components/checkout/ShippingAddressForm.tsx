import { type UseFormReturn } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CheckoutFormData } from "@/lib/validations/checkout";

interface ShippingAddressFormProps {
  form: UseFormReturn<CheckoutFormData>;
}

export function ShippingAddressForm({ form }: ShippingAddressFormProps) {
  const { register, formState: { errors } } = form;

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="fullName">Full name *</Label>
        <Input
          id="fullName"
          placeholder="Raj Sharma"
          aria-invalid={!!errors.fullName}
          {...register("fullName")}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="phoneNumber">Phone number *</Label>
        <div className="flex gap-2">
          <span className="flex items-center rounded-lg border border-input px-3 text-sm text-muted-foreground bg-muted/40 shrink-0">
            +91
          </span>
          <Input
            id="phoneNumber"
            type="tel"
            placeholder="9876543210"
            aria-invalid={!!errors.phoneNumber}
            {...register("phoneNumber")}
          />
        </div>
        {errors.phoneNumber && (
          <p className="text-xs text-destructive">{errors.phoneNumber.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addressLine1">Address line 1 *</Label>
        <Input
          id="addressLine1"
          placeholder="Building, street name"
          aria-invalid={!!errors.addressLine1}
          {...register("addressLine1")}
        />
        {errors.addressLine1 && (
          <p className="text-xs text-destructive">{errors.addressLine1.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="addressLine2">Address line 2 <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input
          id="addressLine2"
          placeholder="Apartment, floor, landmark"
          {...register("addressLine2")}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="city">City *</Label>
          <Input
            id="city"
            placeholder="Mumbai"
            aria-invalid={!!errors.city}
            {...register("city")}
          />
          {errors.city && (
            <p className="text-xs text-destructive">{errors.city.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="state">State *</Label>
          <Input
            id="state"
            placeholder="Maharashtra"
            aria-invalid={!!errors.state}
            {...register("state")}
          />
          {errors.state && (
            <p className="text-xs text-destructive">{errors.state.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="postalCode">PIN code *</Label>
          <Input
            id="postalCode"
            placeholder="400001"
            maxLength={6}
            aria-invalid={!!errors.postalCode}
            {...register("postalCode")}
          />
          {errors.postalCode && (
            <p className="text-xs text-destructive">{errors.postalCode.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="country">Country</Label>
          <Input id="country" defaultValue="India" disabled {...register("country")} />
        </div>
      </div>

      <p className="text-xs text-muted-foreground pt-1">
        This address will be saved to your account for future orders.
      </p>
    </div>
  );
}
