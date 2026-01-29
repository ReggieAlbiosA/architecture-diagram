"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route } from "next";
import { cn } from "@/lib/utils";
import { Slot } from "@radix-ui/react-slot";
import { Menu, X, ChevronRight } from "lucide-react";

// ============================================================================
// Types
// ============================================================================

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
  description?: string;
};

// ============================================================================
// Context (Core of mobile menu system)
// ============================================================================

interface HeaderMobileMenuContextProps {
  isOpen: boolean;
  toggle: () => void;
}

const HeaderMobileMenuContext =
  React.createContext<HeaderMobileMenuContextProps | null>(null);

function useHeaderMobileMenu() {
  const context = React.useContext(HeaderMobileMenuContext);
  if (!context) {
    throw new Error(
      "HeaderMobileMenuTrigger and HeaderMobileMenuContent must be used within HeaderMobileMenu.",
    );
  }
  return context;
}

// ============================================================================
// Header (Base container)
// ============================================================================

interface HeaderProps extends React.HTMLAttributes<HTMLElement> {
  sticky?: boolean;
  topOffset?: number;
}

export function Header({
  sticky = true,
  topOffset = 0,
  ...props
}: HeaderProps) {
  return (
    <header
      {...props}
      style={{ top: `${topOffset}px` }}
      className={cn(
        "w-full border-b border-zinc-200 dark:border-zinc-800",
        "bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md",
        sticky && "sticky z-50",
        props.className,
      )}
      role="banner"
    >
      {props.children}
    </header>
  );
}

// ============================================================================
// Header Subcomponents
// ============================================================================

export function HeaderBrand(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex items-center gap-2", props.className)}>
      {props.children}
    </div>
  );
}

export function HeaderBrandLink({
  href,
  children,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement> & { href: string | Route }) {
  return (
    <Link
      href={href as Route}
      className={cn(
        "flex items-center gap-2 group transition-colors",
        "text-zinc-900 dark:text-zinc-100",
        "hover:text-zinc-700 dark:hover:text-zinc-300",
        props.className,
      )}
      aria-label="Home"
      {...props}
    >
      {children}
    </Link>
  );
}

export function HeaderNavigation(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      {...props}
      className={cn("flex items-center gap-1", props.className)}
      role="navigation"
      aria-label="Main navigation"
    >
      {props.children}
    </nav>
  );
}

export function HeaderActions(props: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn("flex items-center gap-2", props.className)}>
      {props.children}
    </div>
  );
}

// ============================================================================
// Header Navigation Item Link
// ============================================================================

interface HeaderNavItemProps extends Omit<
  React.HTMLAttributes<HTMLLIElement>,
  "children"
> {
  href: string | Route;
  external?: boolean;
  children: React.ReactNode;
}

export function HeaderNavItem({
  href,
  external,
  children,
  ...props
}: HeaderNavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <li
      {...props}
      className={cn(
        "list-none",
        "transition-all duration-150 ease-in-out",
        props.className,
      )}
      role="listitem"
    >
      <Link
        href={href as Route}
        {...linkProps}
        className={cn(
          "block px-3 py-2 text-sm",
          "transition-all duration-150 ease-in-out",
          // Active state
          isActive
            ? ["text-zinc-900", "font-semibold", "dark:text-white"]
            : [
                "text-zinc-700 dark:text-zinc-300",
                "hover:text-zinc-900 dark:hover:text-zinc-100",
              ],
        )}
      >
        {children}
      </Link>
    </li>
  );
}

// ============================================================================
// Header Action Button
// ============================================================================

interface HeaderActionButtonProps extends React.HTMLAttributes<
  HTMLButtonElement | HTMLAnchorElement
> {
  href?: string | Route;
  variant?: "primary" | "secondary" | "ghost" | "outline";
  asChild?: boolean;
  children: React.ReactNode;
}

export function HeaderActionButton({
  href,
  variant = "ghost",
  asChild = false,
  children,
  ...props
}: HeaderActionButtonProps) {
  const baseStyles =
    "px-4 py-2 text-sm font-medium rounded-md transition-colors transition-all duration-150 ease-in-out";

  const variantStyles = {
    primary:
      "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200",
    secondary:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:bg-zinc-200 dark:hover:bg-zinc-700",
    ghost:
      "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100",
    outline:
      "border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800",
  };

  if (asChild) {
    const Comp = Slot;
    return (
      <Comp
        {...props}
        className={cn(baseStyles, variantStyles[variant], props.className)}
      >
        {children}
      </Comp>
    );
  }

  if (href) {
    return (
      <Link
        href={href as Route}
        className={cn(baseStyles, variantStyles[variant], props.className)}
        {...(props as React.HTMLAttributes<HTMLAnchorElement>)}
      >
        {children}
      </Link>
    );
  }

  return (
    <button
      {...(props as React.HTMLAttributes<HTMLButtonElement>)}
      className={cn(baseStyles, variantStyles[variant], props.className)}
    >
      {children}
    </button>
  );
}

// ============================================================================
// Header Mobile Menu (Provides Context)
// ============================================================================

interface HeaderMobileMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HeaderMobileMenu({
  children,
  ...props
}: HeaderMobileMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const toggle = () => setIsOpen((prev) => !prev);

  // Auto-close when viewport crosses md breakpoint (768px)
  React.useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const handler = (e: MediaQueryListEvent) => {
      if (e.matches) setIsOpen(false);
    };
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  // Lock body scroll when menu is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  return (
    <HeaderMobileMenuContext.Provider value={{ isOpen, toggle }}>
      <div {...props} className={cn(props.className)}>
        {children}
      </div>
    </HeaderMobileMenuContext.Provider>
  );
}

// ============================================================================
// Mobile Menu: Trigger (Consumes Context)
// ============================================================================

interface HeaderMobileMenuTriggerProps extends React.HTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  asChild?: boolean;
}

export function HeaderMobileMenuTrigger({
  children,
  asChild = false,
  ...props
}: HeaderMobileMenuTriggerProps) {
  const Comp = asChild ? Slot : "button";
  const { isOpen, toggle } = useHeaderMobileMenu();

  return (
    <Comp
      {...props}
      onClick={toggle}
      className={cn(
        "p-2 rounded-md transition-colors",
        "text-zinc-700 dark:text-zinc-300",
        "hover:bg-zinc-100 dark:hover:bg-zinc-800",
        "hover:text-zinc-900 dark:hover:text-zinc-100",
        props.className,
      )}
      aria-label={isOpen ? "Close menu" : "Open menu"}
      aria-expanded={isOpen}
    >
      {children ||
        (isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />)}
    </Comp>
  );
}

// ============================================================================
// Mobile Menu: Content (Conditionally visible, consumes context)
// ============================================================================

interface HeaderMobileMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HeaderMobileMenuContent({
  children,
  ...props
}: HeaderMobileMenuContentProps) {
  const { isOpen } = useHeaderMobileMenu();

  if (!isOpen) return null;

  return (
    <div
      {...props}
      className={cn(
        "absolute top-full left-0 right-0 mt-2 p-4 rounded-lg border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900 shadow-lg",
        "flex flex-col gap-2",
        "transition-all duration-200 ease-in-out",
        props.className,
      )}
      role="menu"
    >
      {children}
    </div>
  );
}

// ============================================================================
// Mobile Menu: Nav Link (Closes menu on click, shows active state)
// ============================================================================

interface HeaderMobileNavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string | Route;
  external?: boolean;
  children: React.ReactNode;
}

export function HeaderMobileNavLink({
  href,
  external,
  children,
  ...props
}: HeaderMobileNavLinkProps) {
  const pathname = usePathname();
  const { toggle } = useHeaderMobileMenu();
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  const linkProps = external
    ? { target: "_blank", rel: "noopener noreferrer" }
    : {};

  return (
    <Link
      href={href as Route}
      {...linkProps}
      onClick={() => {
        if (!external) toggle();
      }}
      className={cn(
        "py-3 text-base transition-colors",
        isActive
          ? "text-zinc-900 dark:text-white font-medium"
          : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white",
        props.className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
}

// ============================================================================
// Mobile Menu: Divider
// ============================================================================

export function HeaderMobileDivider(
  props: React.HTMLAttributes<HTMLDivElement>,
) {
  return (
    <div
      {...props}
      className={cn(
        "border-t border-zinc-200 dark:border-zinc-800 my-2",
        props.className,
      )}
    />
  );
}

// ============================================================================
// Mobile Menu: Collapsible Navigation Section (for hierarchical nav)
// ============================================================================

const MobileNavDepthContext = React.createContext<number>(0);

interface MobileNavSectionContextProps {
  isOpen: boolean;
  toggle: () => void;
}

const MobileNavSectionContext =
  React.createContext<MobileNavSectionContextProps | null>(null);

function useMobileNavSection() {
  const context = React.useContext(MobileNavSectionContext);
  if (!context) {
    throw new Error(
      "HeaderMobileNavSectionTrigger and HeaderMobileNavSectionGroup must be used within HeaderMobileNavSection.",
    );
  }
  return context;
}

interface HeaderMobileNavSectionProps
  extends React.HTMLAttributes<HTMLDivElement> {
  routes?: string[];
  defaultOpen?: boolean;
}

export function HeaderMobileNavSection({
  routes = [],
  defaultOpen = false,
  children,
  ...props
}: HeaderMobileNavSectionProps) {
  const pathname = usePathname();
  const depth = React.useContext(MobileNavDepthContext);

  const [isOpen, setIsOpen] = React.useState(() => {
    if (routes.length > 0) {
      return routes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );
    }
    return defaultOpen;
  });

  React.useEffect(() => {
    if (routes.length > 0) {
      const shouldBeOpen = routes.some(
        (route) => pathname === route || pathname.startsWith(route + "/"),
      );
      if (shouldBeOpen) setIsOpen(true);
    }
  }, [pathname, routes]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <MobileNavDepthContext.Provider value={depth + 1}>
      <MobileNavSectionContext.Provider value={{ isOpen, toggle }}>
        <div {...props} className={cn("flex flex-col", props.className)}>
          {children}
        </div>
      </MobileNavSectionContext.Provider>
    </MobileNavDepthContext.Provider>
  );
}

interface HeaderMobileNavSectionTriggerProps
  extends React.HTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export function HeaderMobileNavSectionTrigger({
  children,
  ...props
}: HeaderMobileNavSectionTriggerProps) {
  const { isOpen, toggle } = useMobileNavSection();
  const depth = React.useContext(MobileNavDepthContext);

  return (
    <button
      {...props}
      onClick={(e) => {
        toggle();
        props.onClick?.(e);
      }}
      className={cn(
        "flex items-center justify-between w-full text-left",
        "py-2.5 transition-colors",
        depth <= 1
          ? "text-base font-medium text-zinc-900 dark:text-white"
          : "text-sm text-zinc-700 dark:text-zinc-300",
        "hover:text-zinc-900 dark:hover:text-white",
        props.className,
      )}
    >
      {children}
      <ChevronRight
        className={cn(
          "h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-500 transition-transform duration-200",
          isOpen && "rotate-90",
        )}
      />
    </button>
  );
}

interface HeaderMobileNavSectionGroupProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function HeaderMobileNavSectionGroup({
  children,
  ...props
}: HeaderMobileNavSectionGroupProps) {
  const { isOpen } = useMobileNavSection();

  if (!isOpen) return null;

  return (
    <div
      {...props}
      className={cn("flex flex-col pl-4", props.className)}
    >
      {children}
    </div>
  );
}
