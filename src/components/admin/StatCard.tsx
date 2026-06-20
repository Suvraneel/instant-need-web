import type { LucideIcon } from "lucide-react";
import { TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type StatCardColor = "blue" | "green" | "purple" | "amber";

const COLOR_MAP: Record<StatCardColor, { bg: string; icon: string }> = {
  blue:   { bg: "bg-blue-50",   icon: "text-blue-600" },
  green:  { bg: "bg-green-50",  icon: "text-green-600" },
  purple: { bg: "bg-purple-50", icon: "text-purple-600" },
  amber:  { bg: "bg-amber-50",  icon: "text-amber-600" },
};

interface StatCardProps {
  title: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  trend?: number; // positive = good, negative = bad
  color?: StatCardColor;
  className?: string;
}

export function StatCard({ title, value, sub, icon: Icon, trend, color = "blue", className }: StatCardProps) {
  const { bg, icon } = COLOR_MAP[color];
  return (
    <Card className={cn("", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1 flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <p className="text-2xl font-bold tabular-nums">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center shrink-0", bg)}>
            <Icon className={cn("h-5 w-5", icon)} />
          </div>
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 mt-3 text-xs font-medium",
            trend >= 0 ? "text-green-600" : "text-destructive"
          )}>
            <TrendingUp className={cn("h-3 w-3", trend < 0 && "rotate-180")} />
            {trend >= 0 ? "+" : ""}{trend}% vs last month
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-5 space-y-3">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-3 w-20" />
      </CardContent>
    </Card>
  );
}
