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
} from "../_config/navigation.config";

// Helper function to extract all routes from a section's children (recursively)
function extractRoutes(items: NavigationItem[]): string[] {
  const routes: string[] = [];

  for (const item of items) {
    if (item.type === "link" && item.href) {
      routes.push(item.href);
    } else if (item.type === "section" && item.children) {
      routes.push(...extractRoutes(item.children));
    }
  }

  return routes;
}

// Recursive navigation renderer component
function NavigationRenderer({ items }: { items: NavigationItem[] }) {
  return (
    <>
      {items.map((item, index) => {
        if (item.type === "link") {
          return (
            <SidebarNavigationItemLink
              key={`${item.href}-${index}`}
              href={item.href}
            >
              <div className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.label}</span>
              </div>
            </SidebarNavigationItemLink>
          );
        }

        if (item.type === "section") {
          const hasLinks = item.children.some((child) => child.type === "link");
          const hasSections = item.children.some(
            (child) => child.type === "section",
          );

          // Extract all routes from this section's children for auto-expand
          const routes = extractRoutes(item.children);

          return (
            <SidebarNavigationSection
              key={`${item.label}-${index}`}
              collapsible={item.collapsible}
              defaultOpen={item.defaultOpen}
              routes={routes}
            >
              <SidebarNavigationTrigger className="justify-between">
                <div className="flex items-center gap-2">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  <span>{item.label}</span>
                </div>
              </SidebarNavigationTrigger>
              {hasLinks && (
                <SidebarNavigationGroup>
                  {item.children
                    .filter((child) => child.type === "link")
                    .map((child, childIndex) => (
                      <NavigationRenderer key={childIndex} items={[child]} />
                    ))}
                </SidebarNavigationGroup>
              )}
              {hasSections && (
                <SidebarNavigationGroup>
                  <NavigationRenderer
                    items={item.children.filter(
                      (child) => child.type === "section",
                    )}
                  />
                </SidebarNavigationGroup>
              )}
            </SidebarNavigationSection>
          );
        }

        return null;
      })}
    </>
  );
}

export default function DiagramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-3.5rem)]">
      <aside
        className="hidden lg:block flex-shrink-0"
        role="complementary"
        aria-label="Table of contents"
      >
        <Sidebar width={280} className="flex flex-col" sticky topOffset={56}>
          <SidebarContent className="flex flex-col">
            <SidebarNavigation>
              <NavigationRenderer items={navigationConfig} />
            </SidebarNavigation>
          </SidebarContent>
        </Sidebar>
      </aside>
      <main className="flex-1 min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
}
