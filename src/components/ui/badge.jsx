import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import PropTypes from "prop-types";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        warning: "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        info: "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        danger: "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
        // Kopia-specific badge variants
        "policy-badge": "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
        "retention-badge-success": "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
        "retention-badge-warning": "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
        "retention-badge-danger": "border-transparent bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({ className, variant, bg, ...props }) {
  // Handle Bootstrap 'bg' prop for backward compatibility
  if (bg && !variant) {
    if (bg === "success" || bg.includes("success")) variant = "success";
    else if (bg === "warning" || bg.includes("warning")) variant = "warning";
    else if (bg === "info" || bg.includes("info")) variant = "info";
    else if (bg === "danger" || bg.includes("danger")) variant = "danger";
    else if (bg.includes("policy")) variant = "policy-badge";
    else if (bg.includes("retention-badge-success")) variant = "retention-badge-success";
    else if (bg.includes("retention-badge-warning")) variant = "retention-badge-warning";
    else if (bg.includes("retention-badge-danger")) variant = "retention-badge-danger";
    else variant = "default";
  }

  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

Badge.propTypes = {
  className: PropTypes.string,
  variant: PropTypes.oneOf([
    "default", "secondary", "destructive", "outline", "success", "warning",
    "info", "danger", "policy-badge", "retention-badge-success",
    "retention-badge-warning", "retention-badge-danger"
  ]),
  bg: PropTypes.string, // For Bootstrap compatibility
};

export { Badge, badgeVariants };