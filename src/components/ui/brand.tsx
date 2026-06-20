import { cn } from "@/lib/utils";

export function InstantNeedIcon({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <rect width="64" height="64" rx="15" fill="#2563eb" />
      <path d="M35 10L19 37L30 37L24 54L40 27L30 27Z" fill="white" />
    </svg>
  );
}

export function InstantNeedWordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-bold", className)}>
      Instant<span className="text-primary">Need</span>
    </span>
  );
}
