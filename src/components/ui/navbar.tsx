import React from "react";
import { NavLink } from "react-router-dom";
import { Button } from "./button";
import { cn } from "../../lib/utils";

interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

interface NavbarBrandProps extends React.ComponentProps<typeof NavLink> {
  children?: React.ReactNode;
  to?: string;
  className?: string;
}

interface NavbarNavProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

interface NavbarLinkProps extends React.ComponentProps<typeof NavLink> {
  children?: React.ReactNode;
  to: string;
  disabled?: boolean;
  className?: string;
  testId?: string;
}

interface NavbarToggleProps extends React.ComponentProps<typeof Button> {
  onClick?: () => void;
  className?: string;
}

const Navbar: React.FC<NavbarProps> = ({ children, className, ...props }) => (
  <nav
    className={cn(
      "flex items-center justify-between px-6 py-4 bg-background border-b border-border",
      className
    )}
    {...props}
  >
    {children}
  </nav>
);

const NavbarBrand: React.FC<NavbarBrandProps> = ({ children, to = "/", className, ...props }) => (
  <NavLink
    to={to}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  >
    {children}
  </NavLink>
);

const NavbarNav: React.FC<NavbarNavProps> = ({ children, className, ...props }) => (
  <div
    className={cn("flex items-center space-x-1", className)}
    {...props}
  >
    {children}
  </div>
);

const NavbarLink: React.FC<NavbarLinkProps> = ({
  children,
  to,
  disabled = false,
  className,
  testId,
  ...props
}) => (
  <NavLink
    to={to}
    data-testid={testId}
    className={({ isActive }) =>
      cn(
        "px-3 py-2 rounded-md text-sm font-medium transition-colors",
        disabled
          ? "text-muted-foreground pointer-events-none opacity-50"
          : isActive
          ? "bg-accent text-accent-foreground"
          : "text-foreground hover:bg-accent hover:text-accent-foreground",
        className
      )
    }
    {...props}
  >
    {children}
  </NavLink>
);

const NavbarToggle: React.FC<NavbarToggleProps> = ({ onClick, className, ...props }) => (
  <Button
    variant="ghost"
    size="icon"
    className={cn("md:hidden", className)}
    onClick={onClick}
    {...props}
  >
    <svg
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 6h16M4 12h16M4 18h16"
      />
    </svg>
  </Button>
);

export { Navbar, NavbarBrand, NavbarNav, NavbarLink, NavbarToggle };