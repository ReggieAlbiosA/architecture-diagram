/**
 * Theme Toggle Components
 *
 * Contains both mobile and desktop variants of the theme toggle:
 * - MobileViewThemeToggle: Button group style for mobile
 * - DesktopViewThemeToggle: Dropdown menu style for desktop
 */

"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/shadcn-ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/shadcn-ui/dropdown-menu"

// ==================== Shared Types ====================

interface ThemeToggleProps {
    className?: string
}

// ==================== Desktop View Component ====================

/**
 * Desktop View Theme Toggle
 *
 * A dropdown-based theme toggle for desktop screens.
 * Provides Light, Dark, and System theme options.
 *
 * @example
 * ```tsx
 * <DesktopViewThemeToggle className="hidden lg:flex" />
 * ```
 */
export function DesktopViewThemeToggle({ className }: ThemeToggleProps) {
    const { setTheme } = useTheme()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className={className} size="icon" aria-label="Toggle theme">
                    <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" aria-hidden="true" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" aria-hidden="true" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" role="menu" aria-label="Theme options">
                <DropdownMenuItem onClick={() => setTheme("light")} role="menuitem">
                    Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")} role="menuitem">
                    Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")} role="menuitem">
                    System
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

// ==================== Mobile View Component ====================

/**
 * Mobile View Theme Toggle
 *
 * A button group style theme toggle for mobile screens.
 * Shows icon-based theme options in a horizontal layout.
 *
 * @example
 * ```tsx
 * <MobileViewThemeToggle />
 * ```
 */
export function MobileViewThemeToggle({ className }: ThemeToggleProps) {
    const { setTheme, theme } = useTheme()

    const options = [
        { label: "Light", value: "light", icon: <Sun className="w-5 h-5" /> },
        { label: "Dark", value: "dark", icon: <Moon className="w-5 h-5" /> },
        {
            label: "System", value: "system", icon: (
                // Use a simple computer/monitor icon for system, fallback to Sun+Moon if not available
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <rect x="3" y="5" width="18" height="12" rx="2" />
                    <path d="M8 21h8" />
                </svg>
            )
        },
    ]

    return (
        <div className={className}>
            <div className="flex items-center justify-center gap-1 bg-background rounded-md p-1 border w-full max-w-xs mx-auto" role="group" aria-label="Theme selection">
                {options.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => setTheme(option.value)}
                        className={
                            "flex-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center justify-center " +
                            (theme === option.value
                                ? "bg-accent text-accent-foreground"
                                : "hover:bg-muted text-muted-foreground")
                        }
                        aria-pressed={theme === option.value}
                        title={option.label}
                        aria-label={`Set theme to ${option.label}`}
                    >
                        {option.icon}
                        <span className="sr-only">{option.label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}

// ==================== Legacy Exports (Deprecated) ====================

/**
 * @deprecated Use DesktopViewThemeToggle instead
 * This export is maintained for backwards compatibility only
 */
export const LargeScreenThemeToggle = DesktopViewThemeToggle

/**
 * @deprecated Use MobileViewThemeToggle instead
 * This export is maintained for backwards compatibility only
 */
export const MobileThemeToggle = MobileViewThemeToggle
