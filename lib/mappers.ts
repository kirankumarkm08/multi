import { NavigationItem } from "@/types/layout-types";

export interface MappedNavItem {
  label: string;
  href: string;
  page_type: string;
}

export function mapNavigationItems(items: NavigationItem[] | undefined): MappedNavItem[] {
  if (!items) return [];
  
  return items.map((item) => ({
    label: item.title,
    href: `/${item.slug}`,
    page_type: item.page_type,
  }));
}
