import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types/order";

interface StatusBadgeProps {
  status: OrderStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge variant={ORDER_STATUS_COLORS[status] ?? "outline"}>
      {ORDER_STATUS_LABELS[status] ?? status}
    </Badge>
  );
}
