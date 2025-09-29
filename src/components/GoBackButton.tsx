import { ChevronLeft } from "lucide-react";
import React from "react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { GoBackButtonProps } from "../types";

export function GoBackButton({ onClick, label = "Return", className }: GoBackButtonProps = {}): React.JSX.Element {
  const navigate = useNavigate();

  const handleClick = (): void => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleClick}
      className={`text-muted-foreground hover:text-foreground ${className || ''}`}
    >
      <ChevronLeft className="h-4 w-4 mr-2" /> {label}
    </Button>
  );
}