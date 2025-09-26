import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success:
          "border-transparent bg-green-600 text-white hover:bg-green-700",
        warning:
          "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        danger:
          "border-transparent bg-red-600 text-white hover:bg-red-700",
        info:
          "border-transparent bg-blue-500 text-white hover:bg-blue-600",
        "retention-badge-warning":
          "border-transparent text-white hover:opacity-80",
        "retention-badge-danger":
          "border-transparent text-white hover:opacity-80",
        "retention-badge-info":
          "border-transparent text-white hover:opacity-80",
        "retention-badge-primary":
          "border-transparent text-white hover:opacity-80",
        "retention-badge-secondary":
          "border-transparent text-white hover:opacity-80",
        "retention-badge-success":
          "border-transparent text-white hover:opacity-80",
        "snapshot-pin":
          "border-transparent text-white hover:opacity-80 cursor-pointer",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  bg?: string; // Legacy Bootstrap prop support
  text?: string; // Legacy Bootstrap text color prop (ignored in favor of variant-specific colors)
}

function Badge({
  className,
  variant,
  bg, // Legacy Bootstrap prop support
  text: _text, // Legacy Bootstrap text color prop (ignored in favor of variant-specific colors)
  ...props
}: BadgeProps): JSX.Element {
  // Convert legacy Bootstrap `bg` prop to variant
  const finalVariant = variant || (bg as any) || "default";

  // Apply CSS custom properties for retention badge colors
  const retentionBadgeStyle = (finalVariant as string).startsWith("retention-badge-")
    ? { backgroundColor: `var(--color-badge-${(finalVariant as string).replace("retention-badge-", "")})` }
    : finalVariant === "snapshot-pin"
    ? { backgroundColor: `var(--color-primary)` }
    : {};

  return (
    <div
      className={cn(badgeVariants({ variant: finalVariant }), className)}
      style={retentionBadgeStyle}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
