import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "next-themes";

import {
  Header,
  HeaderBrand,
  HeaderBrandLink,
  HeaderActions,
  HeaderActionButton,
  HeaderNavigation,
  HeaderNavItem,
  HeaderMobileMenu,
  HeaderMobileMenuTrigger,
  HeaderMobileMenuContent,
  HeaderMobileNavLink,
  HeaderMobileDivider,
} from "@/components/header/client/header";
import { DesktopViewThemeToggle, MobileViewThemeToggle } from "@/components/header/client/theme-toggle";
import SearchInterface from "@/components/header/client/search-interface";
import { Github, Network } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarNavigation,
  SidebarNavigationSection,
  SidebarNavigationTrigger,
  SidebarNavigationGroup,
  SidebarNavigationItemLink,
  type SidebarConfig,
  type NavigationItem as SidebarNavigationItem,
} from "@/components/composables/client/sidebar";

import {
  navigationConfig,
  type NavigationItem,
} from "./_config/navigation.config";

// Transform navigationConfig to SidebarConfig format for SearchInterface
function transformToSidebarConfig(navItems: NavigationItem[]): SidebarConfig {
  // Recursively convert NavigationItem to SidebarNavigationItem
  const convertItem = (item: NavigationItem): SidebarNavigationItem => {
    if (item.type === "link") {
      return {
        label: item.label,
        href: item.href,
      };
    } else {
      // type === "section"
      return {
        label: item.label,
        collapsible: item.collapsible,
        defaultOpen: item.defaultOpen,
        children: item.children?.map(convertItem),
      };
    }
  };

  const sections = navItems
    .filter(
      (item): item is NavigationItem & { type: "section" } =>
        item.type === "section",
    )
    .map((section) => ({
      title: section.label,
      collapsible: section.collapsible ?? false,
      defaultOpen: section.defaultOpen ?? false,
      items: section.children?.map(convertItem) ?? [],
    }));

  return { sections };
}

// Create the sidebar config for the search interface
const searchConfig = transformToSidebarConfig(navigationConfig);

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const jetBrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Architecture Graph",
  description: "Interactive architecture diagrams and visualizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetBrains.variable}`}
    >
      <body className="min-h-screen bg-background overflow-x-hidden font-sans antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <HeaderMobileMenu>
              <Header
                sticky
                topOffset={0}
                className="flex-shrink-0 bg-white flex justify-between items-center h-14 px-4 md:px-10 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
              >
                {/* Brand */}
                <HeaderBrand>
                  <HeaderBrandLink href="/" className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-900 dark:bg-white text-white dark:text-zinc-900">
                      <Network className="h-5 w-5" />
                    </div>
                    <span className="text-[clamp(.7rem,3.1vw,1.125rem)] font-semibold text-zinc-900 whitespace-nowrap dark:text-white">
                      Architecture Graph
                    </span>
                  </HeaderBrandLink>
                </HeaderBrand>

                {/* Desktop Navigation */}
                <div className="hidden md:flex gap-x-2">
                  <HeaderNavigation>
                    <HeaderNavItem href="/diagram">Diagrams</HeaderNavItem>
                  </HeaderNavigation>

                  <HeaderActions className="gap-2">
                    <SearchInterface docsItems={searchConfig} />
                    <HeaderActionButton className="px-3" asChild>
                      <a
                        href="https://github.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                      >
                        <Github className="h-5 w-5" />
                      </a>
                    </HeaderActionButton>
                    <DesktopViewThemeToggle />
                  </HeaderActions>
                </div>

                {/* Mobile Actions */}
                <div className="flex md:hidden items-center gap-2">
                  <SearchInterface docsItems={searchConfig} />
                  <HeaderMobileMenuTrigger />
                </div>
              </Header>

              {/* Mobile Menu Content - Full Screen */}
              <HeaderMobileMenuContent className="fixed inset-x-0 top-14 bottom-0 mt-0 rounded-none border-0 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-0 shadow-none z-50 overflow-y-auto">
                <nav className="flex flex-col px-6 py-4">
                  <HeaderMobileNavLink href="/diagram">
                    Diagrams
                  </HeaderMobileNavLink>
                  <HeaderMobileNavLink href="/diagram/git/architecture/local">
                    Git
                  </HeaderMobileNavLink>
                  <HeaderMobileNavLink href="/diagram/docker/core-concepts/architecture">
                    Docker
                  </HeaderMobileNavLink>
                  <HeaderMobileNavLink href="/diagram/linux/filesystem">
                    Linux
                  </HeaderMobileNavLink>
                  <HeaderMobileDivider className="mt-2 mb-2" />
                  <HeaderMobileNavLink
                    href="https://github.com"
                    external
                    className="flex items-center gap-2"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                  </HeaderMobileNavLink>
                  <HeaderMobileDivider className="mt-2 mb-4" />
                  <MobileViewThemeToggle />
                </nav>
              </HeaderMobileMenuContent>

              {children}
          </HeaderMobileMenu>
        </ThemeProvider>
      </body>
    </html>
  );
}
