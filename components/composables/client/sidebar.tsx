"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Route } from "next";
import { Slot } from "@radix-ui/react-slot";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type NavigationItem = {
  label: string;
  href?: string;
  description?: string;
  collapsible?: boolean;
  defaultOpen?: boolean;
  children?: NavigationItem[];
};

export type NavigationSection = {
  title: string;
  collapsible: boolean;
  defaultOpen: boolean;
  items: NavigationItem[];
};

export type SidebarConfig = {
  sections: NavigationSection[];
};

// ============================================================================
// Context (Core of collapsible system)
// ============================================================================

interface SidebarCollapsibleContextProps {
  isOpen: boolean;
  toggle: () => void;
  collapsible: boolean;
  isActive: boolean; // True if this section contains the active route
  depth: number; // Nesting depth (0 = root, 1+ = nested)
}

const SidebarCollapsibleContext =
  React.createContext<SidebarCollapsibleContextProps | null>(null);

// Depth context to track nesting level
const SidebarDepthContext = React.createContext<number>(0);

function useSidebarCollapsible() {
  const context = React.useContext(SidebarCollapsibleContext);
  if (!context) {
    throw new Error(
      "SidebarNavigationTrigger and SidebarNavigationGroup must be used within SidebarNavigationSection."
    );
  }
  return context;
}

function useSidebarDepth() {
  return React.useContext(SidebarDepthContext);
}

// ============================================================================
// Sidebar (Base container)
// ============================================================================

interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  width?: number;
  sticky?: boolean;
  topOffset?: number;
  maxHeight?: string;
}

export function Sidebar({
  width = 300,
  topOffset = 0,
  sticky = true,
  maxHeight = "h-[calc(100vh)]",
  ...props
}: SidebarProps) {
  return (
    <aside
      {...props}
      style={{
        width: `${width}px`,
        top: `${topOffset}px`,
        maxHeight: `calc(100vh - calc(${topOffset}px) - 1px)`,
      }}
      className={cn(
        maxHeight,
        "sticky overflow-y-auto border border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
        "shadow-sm dark:shadow-zinc-900/50",
        sticky,
        props.className
      )}
      role="complementary"
      aria-label="Sidebar navigation"
    >
      {props.children}
    </aside>
  );
}

// ============================================================================
// Sidebar Subcomponents
// ============================================================================

export function SidebarHeader(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <header
      {...props}
      className={cn(
        "px-4 pt-4 pb-2 border-b border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
        props.className
      )}
    >
      {props.children}
    </header>
  );
}

export function SidebarFooter(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <footer
      {...props}
      className={cn(
        "px-4 pt-4 pb-4 mt-auto border-t border-zinc-200 dark:border-zinc-800",
        "bg-white dark:bg-zinc-900",
        props.className
      )}
    >
      {props.children}
    </footer>
  );
}

export function SidebarContent(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <div
      {...props}
      className={cn(
        "flex-1 overflow-y-auto px-4 py-4",
        "space-y-6 flex flex-col",
        props.className
      )}
    >
      {props.children}
    </div>
  );
}

export function SidebarNavigation(props: React.HTMLAttributes<HTMLElement>) {
  return (
    <nav
      {...props}
      className={cn(
        "space-y-2 flex flex-col list-none",
        "w-full",
        props.className
      )}
      role="navigation"
    >
      {props.children}
    </nav>
  );
}

// ============================================================================
// Sidebar Navigation Section (Provides Context)
// ============================================================================

interface SidebarNavigationSectionProps
  extends React.HTMLAttributes<HTMLElement> {
  collapsible?: boolean;
  defaultOpen?: boolean;
  routes?: string[]; // Array of routes in this section to auto-expand based on pathname
}

export function SidebarNavigationSection({
  collapsible = false,
  defaultOpen = false,
  routes = [],
  ...props
}: SidebarNavigationSectionProps) {
  const pathname = usePathname();
  const currentDepth = useSidebarDepth();

  // Check if this section contains the active route
  const isActive = React.useMemo(() => {
    if (routes.length === 0) return false;
    return routes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
  }, [pathname, routes]);

  // Initialize state with smart check: if pathname matches any route, open by default
  const [isOpen, setIsOpen] = React.useState(() => {
    if (routes.length > 0) {
      return routes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );
    }
    return defaultOpen;
  });

  // Update state when pathname changes
  React.useEffect(() => {
    if (routes.length > 0) {
      const shouldBeOpen = routes.some(
        (route) => pathname === route || pathname.startsWith(route + "/")
      );
      setIsOpen(shouldBeOpen);
    }
  }, [pathname, routes]);

  const toggle = () => setIsOpen((prev) => !prev);

  return (
    <SidebarDepthContext.Provider value={currentDepth + 1}>
      <SidebarCollapsibleContext.Provider
        value={{ isOpen, toggle, collapsible, isActive, depth: currentDepth }}
      >
        <section
          {...props}
          className={cn("space-y-1 flex flex-col", "w-full", props.className)}
          role="region"
        >
          {props.children}
        </section>
      </SidebarCollapsibleContext.Provider>
    </SidebarDepthContext.Provider>
  );
}

// ============================================================================
// Collapsible System: Trigger (Consumes Context)
// ============================================================================

interface SidebarNavigationTriggerProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
  asChild?: boolean;
}

export function SidebarNavigationTrigger({
  children,
  asChild = false,
  ...props
}: SidebarNavigationTriggerProps) {
  const Comp = asChild ? Slot : "h3";
  const { isOpen, toggle, collapsible, isActive, depth } =
    useSidebarCollapsible();

  const handleClick = (e: React.MouseEvent<HTMLHeadingElement>) => {
    if (collapsible) toggle();
    props.onClick?.(e);
  };

  // Show left border line for all levels except root (depth 0)
  const showBorderLine = depth > 0;

  return (
    <Comp
      {...props}
      onClick={collapsible ? handleClick : props.onClick}
      className={cn(
        "flex items-center justify-between gap-2",
        showBorderLine ? "px-3 py-1.5" : "px-2 py-2",
        "text-xs font-semibold uppercase tracking-wider",
        "transition-all duration-150 ease-in-out",
        // Left border line for non-root levels (matching link style)
        showBorderLine
          ? [
              "border-l",
              isActive
                ? "border-zinc-900 dark:border-zinc-100"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-500 dark:hover:border-zinc-500",
            ]
          : "rounded-md",
        // Active state - when this section contains the active route
        isActive
          ? "text-zinc-700 dark:text-zinc-200"
          : "text-zinc-500 dark:text-zinc-400",
        props.className,
        collapsible &&
          "cursor-pointer select-none hover:text-zinc-700 dark:hover:text-zinc-300",
        // Only apply hover background for root level (no border line)
        collapsible && !showBorderLine && "hover:bg-zinc-100 dark:hover:bg-zinc-800"
      )}
    >
      {children}
      {collapsible && (
        <ChevronRight
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200 ease-in-out",
            isActive
              ? "text-zinc-500 dark:text-zinc-400"
              : "text-zinc-400 dark:text-zinc-500",
            isOpen && "rotate-90"
          )}
        />
      )}
    </Comp>
  );
}

// ============================================================================
// Sidebar Group (Conditionally visible, consumes context)
// ============================================================================

interface SidebarNavigationGroupProps
  extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

export function SidebarNavigationGroup({
  children,
  ...props
}: SidebarNavigationGroupProps) {
  const { isOpen, collapsible } = useSidebarCollapsible();

  if (collapsible && !isOpen) return null;

  return (
    <ul
      {...props}
      className={cn(
        "list-none pl-2 ml-2",
        "transition-all duration-200 ease-in-out",
        "w-full",
        props.className
      )}
      role="group"
    >
      {children}
    </ul>
  );
}

// ============================================================================
// Sidebar Navigation Item Link
// ============================================================================

interface SidebarNavigationItemLinkProps
  extends Omit<React.HTMLAttributes<HTMLLIElement>, "children"> {
  href: string | Route;
  children: React.ReactNode;
}

export function SidebarNavigationItemLink({
  href,
  children,
  ...props
}: SidebarNavigationItemLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li
      {...props}
      className={cn(
        "list-none w-full",
        "transition-all duration-150 ease-in-out",
        props.className
      )}
      role="listitem"
    >
      <Link
        href={href as Route}
        className={cn(
          "block px-3 py-1 text-sm transition-all duration-150 ease-in-out",
          "border-l border-zinc-200 dark:border-zinc-800",
          // Active state
          isActive
            ? [
                "text-zinc-900 dark:text-zinc-100",
                "font-semibold",
                "border-zinc-900 dark:border-zinc-100",
              ]
            : [
                "text-zinc-700 dark:text-zinc-300",
                "hover:text-zinc-900 dark:hover:text-zinc-100",
                "hover:border-zinc-500 dark:hover:border-zinc-500",
              ]
        )}
      >
        {children}
      </Link>
    </li>
  );
}

// ============================================================================
// Sidebar Navigation Item (for non-link items, backward compatibility)
// ============================================================================

interface SidebarNavigationItemProps
  extends React.HTMLAttributes<HTMLLIElement> {
  children: React.ReactNode;
}

export function SidebarNavigationItem({
  children,
  ...props
}: SidebarNavigationItemProps) {
  return (
    <li
      {...props}
      className={cn(
        "list-none w-full",
        "transition-all duration-150 ease-in-out",
        props.className
      )}
      role="listitem"
    >
      {children}
    </li>
  );
}
