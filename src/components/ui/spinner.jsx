import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "../../utils/cn";
import PropTypes from "prop-types";

const spinnerVariants = cva(
  "animate-spin rounded-full border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]",
  {
    variants: {
      size: {
        sm: "h-4 w-4 border-2",
        default: "h-8 w-8 border-4",
        lg: "h-12 w-12 border-4",
      },
      variant: {
        default: "text-primary",
        secondary: "text-secondary",
        muted: "text-muted-foreground",
      }
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  }
);

const Spinner = React.forwardRef(({ className, size, variant, ...props }, ref) => {
  return (
    <div
      className={cn(spinnerVariants({ size, variant }), className)}
      role="status"
      aria-label="Loading"
      ref={ref}
      {...props}
    />
  );
});

Spinner.displayName = "Spinner";

Spinner.propTypes = {
  className: PropTypes.string,
  size: PropTypes.oneOf(["sm", "default", "lg"]),
  variant: PropTypes.oneOf(["default", "secondary", "muted"]),
};

export { Spinner, spinnerVariants };