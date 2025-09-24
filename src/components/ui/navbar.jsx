import React from "react";
import { NavLink } from "react-router-dom";
import PropTypes from "prop-types";
import { Button } from "./button";
import { cn } from "../../lib/utils";

const Navbar = ({ children, className, ...props }) => (
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

const NavbarBrand = ({ children, to = "/", className, ...props }) => (
  <NavLink
    to={to}
    className={cn("flex items-center space-x-2", className)}
    {...props}
  >
    {children}
  </NavLink>
);

const NavbarNav = ({ children, className, ...props }) => (
  <div
    className={cn("hidden md:flex items-center space-x-1", className)}
    {...props}
  >
    {children}
  </div>
);

const NavbarLink = ({
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

const NavbarToggle = ({ onClick, className, ...props }) => (
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

// PropTypes definitions
Navbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

NavbarBrand.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  className: PropTypes.string,
};

NavbarNav.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};

NavbarLink.propTypes = {
  children: PropTypes.node,
  to: PropTypes.string,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  testId: PropTypes.string,
};

NavbarToggle.propTypes = {
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export { Navbar, NavbarBrand, NavbarNav, NavbarLink, NavbarToggle };