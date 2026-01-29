"use client";

import {
  HeaderMobileNavLink,
  HeaderMobileNavSection,
  HeaderMobileNavSectionTrigger,
  HeaderMobileNavSectionGroup,
} from "@/components/header/client/header";
import {
  navigationConfig,
  type NavigationItem,
} from "@/app/_config/navigation.config";

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

function MobileNavItems({ items }: { items: NavigationItem[] }) {
  return (
    <>
      {items.map((item, index) => {
        if (item.type === "link") {
          return (
            <HeaderMobileNavLink key={`${item.href}-${index}`} href={item.href}>
              <span className="flex items-center gap-2">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
            </HeaderMobileNavLink>
          );
        }

        if (item.type === "section") {
          const routes = extractRoutes(item.children);

          return (
            <HeaderMobileNavSection
              key={`${item.label}-${index}`}
              routes={routes}
              defaultOpen={item.defaultOpen}
            >
              <HeaderMobileNavSectionTrigger>
                <span className="flex items-center gap-2">
                  {item.icon && <item.icon className="h-4 w-4" />}
                  {item.label}
                </span>
              </HeaderMobileNavSectionTrigger>
              <HeaderMobileNavSectionGroup>
                <MobileNavItems items={item.children} />
              </HeaderMobileNavSectionGroup>
            </HeaderMobileNavSection>
          );
        }

        return null;
      })}
    </>
  );
}

export default function MobileNavigationRenderer() {
  return <MobileNavItems items={navigationConfig} />;
}
