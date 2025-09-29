import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";

interface FormActionsProps {
  primaryLabel?: string;
  secondaryLabel?: string;
  cancelLabel?: string;
  onPrimary?: () => void;
  onSecondary?: () => void;
  onCancel?: () => void;
  isPrimaryLoading?: boolean;
  isSecondaryLoading?: boolean;
  isPrimaryDisabled?: boolean;
  isSecondaryDisabled?: boolean;
  isCancelDisabled?: boolean;
  variant?: "default" | "destructive" | "success";
  align?: "left" | "center" | "right" | "between";
  className?: string;
  children?: React.ReactNode;
}

export function FormActions({
  primaryLabel = "Submit",
  secondaryLabel,
  cancelLabel = "Cancel",
  onPrimary,
  onSecondary,
  onCancel,
  isPrimaryLoading = false,
  isSecondaryLoading = false,
  isPrimaryDisabled = false,
  isSecondaryDisabled = false,
  isCancelDisabled = false,
  variant = "default",
  align = "left",
  className = "",
  children,
}: FormActionsProps) {
  const alignmentClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  const variantMap = {
    default: "default",
    destructive: "destructive",
    success: "default",
  } as const;

  return (
    <div className={`flex items-center gap-2 ${alignmentClasses[align]} ${className}`}>
      {children || (
        <>
          <div className="flex gap-2">
            {onPrimary && (
              <Button
                type={onPrimary ? "button" : "submit"}
                variant={variantMap[variant]}
                onClick={onPrimary}
                disabled={isPrimaryDisabled || isPrimaryLoading}
                className={variant === "success" ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isPrimaryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {primaryLabel}
              </Button>
            )}
            {onSecondary && secondaryLabel && (
              <Button
                type="button"
                variant="secondary"
                onClick={onSecondary}
                disabled={isSecondaryDisabled || isSecondaryLoading}
              >
                {isSecondaryLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {secondaryLabel}
              </Button>
            )}
          </div>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isCancelDisabled}
              className={align === "between" ? "" : "ml-auto"}
            >
              {cancelLabel}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
