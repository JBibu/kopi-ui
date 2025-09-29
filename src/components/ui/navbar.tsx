import { NavLink } from "react-router-dom";
import { Button } from "./button";
import { cn } from "@/lib/utils";

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

function Navbar({ children, className, ...props }: NavbarProps) {
  return (
    <nav
      className={cn("flex items-center justify-between px-6 py-4 bg-background border-b border-border", className)}
      {...props}
    >
      {children}
    </nav>
  );
}

function NavbarBrand({ children, to = "/", className, ...props }: NavbarBrandProps) {
  return (
    <NavLink to={to} className={cn("flex items-center space-x-2", className)} {...props}>
      {children}
    </NavLink>
  );
}

function NavbarNav({ children, className, ...props }: NavbarNavProps) {
  return (
    <div className={cn("flex items-center space-x-1", className)} {...props}>
      {children}
    </div>
  );
}

function NavbarLink({ children, to, disabled = false, className, testId, ...props }: NavbarLinkProps) {
  return (
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
          className,
        )
      }
      {...props}
    >
      {children}
    </NavLink>
  );
}

function NavbarToggle({ onClick, className, ...props }: NavbarToggleProps) {
  return (
    <Button variant="ghost" size="icon" className={cn("md:hidden", className)} onClick={onClick} {...props}>
      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </Button>
  );
}

export { Navbar, NavbarBrand, NavbarNav, NavbarLink, NavbarToggle };
