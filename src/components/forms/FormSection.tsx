import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  variant?: "card" | "flat" | "separated";
  className?: string;
}

export function FormSection({ title, description, children, variant = "flat", className = "" }: FormSectionProps) {
  if (variant === "card") {
    return (
      <Card className={className}>
        {(title || description) && (
          <CardHeader>
            {title && <CardTitle>{title}</CardTitle>}
            {description && <CardDescription>{description}</CardDescription>}
          </CardHeader>
        )}
        <CardContent>{children}</CardContent>
      </Card>
    );
  }

  if (variant === "separated") {
    return (
      <div className={`space-y-4 ${className}`}>
        {(title || description) && (
          <>
            <div className="space-y-1">
              {title && <h3 className="text-lg font-semibold">{title}</h3>}
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            <Separator />
          </>
        )}
        <div className="space-y-4">{children}</div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {(title || description) && (
        <div className="space-y-1">
          {title && <h3 className="text-base font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </div>
  );
}
