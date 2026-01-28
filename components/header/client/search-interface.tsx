"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Search, FileText, Link2, Star, X } from "lucide-react";
import Link from "next/link";
import { Route } from "next";
import { useRouter } from "next/navigation";
import type {
  SidebarConfig,
  NavigationItem,
} from "@/components/composables/client/sidebar";

// Define interface for search result items
interface SearchResultItem {
  label: string;
  href: string;
  description?: string;
  parentLabel?: string;
  sectionTitle?: string;
  isChild?: boolean;
}

// Define interface for recent search items (stored in cookies)
interface RecentSearchItem extends SearchResultItem {
  isFavorite: boolean;
  timestamp: number;
}

// Define props interface
interface SearchInterfaceProps {
  docsItems?: SidebarConfig;
}

// Cookie helpers
const COOKIE_NAME = "doc_search_recent";
const MAX_ITEMS = 7;

function setCookie(name: string, value: string, days: number = 365) {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
}

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const ca = document.cookie.split(";");
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i] ?? "";
    while (c.charAt(0) === " ") c = c.substring(1, c.length);
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
  }
  return null;
}

function getRecentSearches(): RecentSearchItem[] {
  if (typeof document === "undefined") return [];
  const cookie = getCookie(COOKIE_NAME);
  if (!cookie) return [];
  try {
    return JSON.parse(decodeURIComponent(cookie));
  } catch {
    return [];
  }
}

function saveRecentSearches(items: RecentSearchItem[]) {
  setCookie(COOKIE_NAME, encodeURIComponent(JSON.stringify(items)));
}

// Helper function to check if an item is a parent item
function isParentItem(item: NavigationItem): boolean {
  return (
    "children" in item &&
    Array.isArray(item.children) &&
    item.children.length > 0
  );
}

// Function to extract all routable items from sidebar config with section info
function extractRoutableItems(config: SidebarConfig): SearchResultItem[] {
  const items: SearchResultItem[] = [];

  config.sections.forEach((section) => {
    const sectionTitle = section.title;

    section.items.forEach((item) => {
      if (isParentItem(item)) {
        // If parent has its own href, add it
        if (item.href) {
          items.push({
            label: item.label || "",
            href: item.href,
            description: item.label,
            sectionTitle,
          });
        }

        // Add all children that have hrefs
        item.children?.forEach((child) => {
          if (child.href) {
            items.push({
              label: child.label,
              href: child.href,
              description: child.description,
              parentLabel: item.label,
              sectionTitle,
              isChild: true,
            });
          }
        });
      } else {
        // Regular link item
        if (item.href) {
          items.push({
            label: item.label,
            href: item.href,
            description: item.description,
            sectionTitle,
          });
        }
      }
    });
  });

  return items;
}

// Get grouped suggestions from sidebar config
function getGroupedSuggestions(
  config: SidebarConfig,
): { title: string; items: SearchResultItem[] }[] {
  const groups: { title: string; items: SearchResultItem[] }[] = [];

  config.sections.forEach((section) => {
    const sectionItems: SearchResultItem[] = [];

    section.items.forEach((item) => {
      if (isParentItem(item)) {
        item.children?.forEach((child) => {
          if (child.href) {
            sectionItems.push({
              label: child.label,
              href: child.href,
              description: child.description,
              parentLabel: item.label,
              sectionTitle: section.title,
              isChild: true,
            });
          }
        });
      } else {
        if (item.href) {
          sectionItems.push({
            label: item.label,
            href: item.href,
            description: item.description,
            sectionTitle: section.title,
          });
        }
      }
    });

    if (sectionItems.length > 0 && section.title) {
      groups.push({
        title: section.title,
        items: sectionItems.slice(0, 3),
      });
    }
  });

  return groups;
}

// Group search results by section
function groupSearchResults(
  items: SearchResultItem[],
): { sectionTitle: string; items: SearchResultItem[] }[] {
  const grouped = new Map<string, SearchResultItem[]>();

  items.forEach((item) => {
    const section = item.sectionTitle || "Other";
    if (!grouped.has(section)) {
      grouped.set(section, []);
    }
    grouped.get(section)!.push(item);
  });

  return Array.from(grouped.entries()).map(([sectionTitle, items]) => ({
    sectionTitle,
    items,
  }));
}

export default function SearchInterface({ docsItems }: SearchInterfaceProps) {
  const router = useRouter();
  const [open, setOpen] = useState<boolean>(false);
  const [search, setSearch] = useState<string>("");
  const [selected, setSelected] = useState<number>(0);
  const [recentSearches, setRecentSearches] = useState<RecentSearchItem[]>([]);

  const hideOnMobileStyle = "hidden sm:flex";

  // Extract all routable items from docs
  const allRoutableItems = useMemo(() => {
    if (!docsItems) return [];
    return extractRoutableItems(docsItems);
  }, [docsItems]);

  // Load recent searches from cookies on mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  // Add item to recent searches
  const addToRecent = useCallback((item: SearchResultItem) => {
    const recent = getRecentSearches();

    // Check if item already exists
    const existingIndex = recent.findIndex((r) => r.href === item.href);

    if (existingIndex !== -1) {
      // Move to top and update timestamp, preserve favorite status
      const existing = recent[existingIndex]!;
      recent.splice(existingIndex, 1);
      recent.unshift({
        ...existing,
        isFavorite: existing.isFavorite ?? false,
        timestamp: Date.now(),
      });
    } else {
      // Add new item
      recent.unshift({
        ...item,
        isFavorite: false,
        timestamp: Date.now(),
      });

      // Remove oldest non-favorite items if exceeding limit
      while (recent.length > MAX_ITEMS) {
        // Find last non-favorite (oldest non-favorite)
        let oldestNonFavoriteIndex = -1;
        for (let i = recent.length - 1; i >= 0; i--) {
          if (!recent[i]?.isFavorite) {
            oldestNonFavoriteIndex = i;
            break;
          }
        }
        if (oldestNonFavoriteIndex !== -1) {
          recent.splice(oldestNonFavoriteIndex, 1);
        } else {
          // All are favorites, remove oldest
          recent.pop();
        }
      }
    }

    saveRecentSearches(recent);
    setRecentSearches(recent);
  }, []);

  // Toggle favorite status
  const toggleFavorite = useCallback((href: string) => {
    const recent = getRecentSearches();
    const index = recent.findIndex((r) => r.href === href);

    if (index !== -1 && typeof recent[index]?.isFavorite === "boolean") {
      recent[index] = {
        ...recent[index]!,
        isFavorite: !recent[index]!.isFavorite,
      };
      saveRecentSearches(recent);
      setRecentSearches(recent);
    }
  }, []);

  // Remove item from recent searches
  const removeFromRecent = useCallback((href: string) => {
    const recent = getRecentSearches().filter((r) => r.href !== href);
    saveRecentSearches(recent);
    setRecentSearches(recent);
  }, []);

  // Get non-favorite recent items
  const recentItems = useMemo(() => {
    return recentSearches.filter((item) => !item.isFavorite);
  }, [recentSearches]);

  // Get favorite items
  const favoriteItems = useMemo(() => {
    return recentSearches.filter((item) => item.isFavorite);
  }, [recentSearches]);

  // Memoize filtered items
  const filteredItems = useMemo(() => {
    if (!search.trim()) {
      return [];
    }

    return allRoutableItems.filter(
      (item) =>
        item.label.toLowerCase().includes(search.toLowerCase()) ||
        (item.description &&
          item.description.toLowerCase().includes(search.toLowerCase())),
    );
  }, [search, allRoutableItems]);

  // Group filtered items by section
  const groupedFilteredItems = useMemo(() => {
    return groupSearchResults(filteredItems);
  }, [filteredItems]);

  // Get suggestions when no results
  const suggestions = useMemo(() => {
    if (!docsItems || !search.trim() || filteredItems.length > 0) return [];
    return getGroupedSuggestions(docsItems);
  }, [docsItems, search, filteredItems]);

  // Handle global keydown for opening/closing palette
  const handleGlobalKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      setOpen((prev) => !prev);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }, []);

  // Handle navigation keydown when palette is open
  const handleNavigationKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!open || filteredItems.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelected((s) => (s + 1) % filteredItems.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelected(
            (s) => (s - 1 + filteredItems.length) % filteredItems.length,
          );
          break;
        case "Enter":
          e.preventDefault();
          if (filteredItems[selected]) {
            const selectedItem = filteredItems[selected];
            addToRecent(selectedItem);
            setOpen(false);
            router.push(selectedItem.href as Route);
          }
          break;
      }
    },
    [open, selected, filteredItems, addToRecent, router],
  );

  // Set up global keydown listener
  useEffect(() => {
    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [handleGlobalKeyDown]);

  // Set up navigation keydown listener
  useEffect(() => {
    document.addEventListener("keydown", handleNavigationKeyDown);
    return () =>
      document.removeEventListener("keydown", handleNavigationKeyDown);
  }, [handleNavigationKeyDown]);

  // Reset selected index when search changes
  useEffect(() => {
    setSelected(0);
  }, [search]);

  // Debounced search handler
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(e.target.value);
    },
    [],
  );

  // Handle item click
  const handleItemClick = useCallback(
    (item: SearchResultItem) => {
      addToRecent(item);
      setOpen(false);
    },
    [addToRecent],
  );

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setOpen(true)}
        className="flex lg:w-[230px] md:w-[200] sm:w-[145px] items-center gap-2 px-2.5 h-[35px] bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all focus:outline-none focus:ring-2 focus:ring-zinc-500 dark:focus:ring-zinc-400"
        aria-label="Open command palette"
      >
        <Search className="w-4.5 h-4.5" aria-hidden="true" />
        <span className="hidden sm:inline truncate">Search Diagram</span>
        <kbd
          className={`ml-auto px-1 text-xs bg-zinc-200 dark:bg-zinc-700 dark:text-zinc-300 rounded border border-zinc-300 dark:border-zinc-600 ${hideOnMobileStyle}`}
        >
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      {open && (
        <div
          className="fixed inset-0 last-stack flex items-start justify-center pt-[15vh] px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="command-palette-title"
        >
          {/* Backdrop */}
          <div
            className="absolute h-screen inset-0 bg-black/70"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Dialog */}
          <div className="relative w-full max-w-2xl max-h-[70vh] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col">
            {/* Search Input */}
            <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800">
              <input
                type="text"
                value={search}
                onChange={handleSearchChange}
                placeholder="Search Diagram"
                className="w-full bg-transparent text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 outline-none text-sm"
                autoFocus
                aria-label="Search Diagram"
              />
            </div>

            {/* Results */}
            <div className="py-2 overflow-y-auto flex-1">
              {/* Show recent/favorites when no search query */}
              {!search.trim() && (
                <>
                  {recentSearches.length === 0 ? (
                    <div className="py-12 text-center px-4">
                      <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                        No recent searches yet
                      </p>
                      <p className="text-zinc-400 dark:text-zinc-500 text-xs mt-2">
                        Start typing to search Diagram
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Recent Section - only non-favorites */}
                      {recentItems.length > 0 && (
                        <div className="mb-4">
                          <div className="px-4 py-2">
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Recent
                            </h3>
                          </div>
                          {recentItems.map((item, idx) => (
                            <div
                              key={`recent-${idx}`}
                              className="flex items-center gap-3 px-4 py-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            >
                              <Link
                                href={item.href as Route}
                                onClick={() => {
                                  addToRecent(item);
                                  setOpen(false);
                                }}
                                className="flex-1 flex items-center gap-3 min-w-0"
                              >
                                {item.isChild ? (
                                  <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  {item.isChild && item.parentLabel && (
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                      {item.parentLabel}
                                    </div>
                                  )}
                                  <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                    {item.label}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.href);
                                  }}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                                  aria-label="Add to favorites"
                                >
                                  <Star className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromRecent(item.href);
                                  }}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded transition-colors"
                                  aria-label="Remove from recent"
                                >
                                  <X className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Favorite Section */}
                      {favoriteItems.length > 0 && (
                        <div>
                          <div className="px-4 py-2">
                            <h3 className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
                              Favorite
                            </h3>
                          </div>
                          {favoriteItems.map((item, idx) => (
                            <div
                              key={`fav-${idx}`}
                              className="flex items-center gap-3 px-4 py-2 bg-blue-50 dark:bg-blue-950/20 hover:bg-blue-100 dark:hover:bg-blue-950/30"
                            >
                              <Link
                                href={item.href as Route}
                                onClick={() => {
                                  addToRecent(item);
                                  setOpen(false);
                                }}
                                className="flex-1 flex items-center gap-3 min-w-0"
                              >
                                {item.isChild ? (
                                  <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                                )}
                                <div className="flex-1 min-w-0">
                                  {item.isChild && item.parentLabel && (
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                      {item.parentLabel}
                                    </div>
                                  )}
                                  <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                    {item.label}
                                  </div>
                                  {item.description && (
                                    <div className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                      {item.description}
                                    </div>
                                  )}
                                </div>
                              </Link>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleFavorite(item.href);
                                  }}
                                  className="p-1.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded transition-colors"
                                  aria-label="Remove from favorites"
                                >
                                  <Star className="w-4 h-4 fill-blue-500 text-blue-500" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeFromRecent(item.href);
                                  }}
                                  className="p-1.5 hover:bg-blue-200 dark:hover:bg-blue-900/40 rounded transition-colors"
                                  aria-label="Remove from favorites"
                                >
                                  <X className="w-4 h-4 text-zinc-400 dark:text-zinc-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </>
              )}

              {/* Show search results grouped by section */}
              {search.trim() && filteredItems.length > 0 && (
                <div>
                  {groupedFilteredItems.map((group, groupIdx) => (
                    <div key={groupIdx} className="mb-4">
                      <div className="px-4 py-2">
                        <h3 className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                          {group.sectionTitle}
                        </h3>
                      </div>
                      {group.items.map((item, idx) => {
                        const globalIdx = filteredItems.findIndex(
                          (i) => i.href === item.href,
                        );
                        return (
                          <Link
                            key={idx}
                            href={item.href as Route}
                            onMouseEnter={() => setSelected(globalIdx)}
                            onClick={() => handleItemClick(item)}
                            className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                              selected === globalIdx
                                ? "bg-zinc-100 dark:bg-zinc-800"
                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                            }`}
                            role="option"
                            aria-selected={selected === globalIdx}
                          >
                            {item.isChild ? (
                              <Link2 className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                            ) : (
                              <FileText className="w-4 h-4 text-zinc-400 dark:text-zinc-500 flex-shrink-0" />
                            )}
                            <div className="flex-1 min-w-0">
                              {item.isChild && item.parentLabel && (
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mb-0.5 truncate">
                                  {item.parentLabel}
                                </div>
                              )}
                              <div className="text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                {item.label}
                              </div>
                              {item.description && (
                                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  ))}
                </div>
              )}

              {/* Show no results with suggestions */}
              {search.trim() && filteredItems.length === 0 && (
                <div className="py-4">
                  <div className="text-center py-8 px-4">
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm">
                      No results for{" "}
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        &ldquo;{search}&rdquo;
                      </span>
                    </p>
                  </div>

                  {suggestions.length > 0 && (
                    <div className="px-4">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-3">
                        Try searching for:
                      </p>
                      {suggestions.map((group, groupIdx) => (
                        <div key={groupIdx} className="mb-4">
                          <button
                            className="w-full flex items-center justify-between px-3 py-2 text-left text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                            onClick={() => setSearch("")}
                          >
                            <span>{group.title}</span>
                            <span className="text-zinc-400 dark:text-zinc-500">
                              →
                            </span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footer hint */}
            <div className="px-4 py-2 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50">
              <p className="text-xs text-zinc-500 dark:text-zinc-400 text-center">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-zinc-200 dark:bg-zinc-700 rounded text-xs">
                  ESC
                </kbd>{" "}
                to close
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
