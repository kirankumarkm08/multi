/**
 * Custom Page Builder Helper Utilities
 * Extracted from app/(tenant)/admin/page-builder/custom/page.tsx
 */

import {
  CustomPageData,
  CustomPageApiResponse,
  CustomPageLayout,
} from "@/types/custom-page";
import { PageData } from "@/types/pagebuilder";
import { DEFAULT_LAYOUT_JSON } from "@/constants/page-builder";

/**
 * Parse JSON string field safely
 * @param field - JSON string or object
 * @returns Parsed object or empty object on error
 */
export function parseJsonField(field: any): Record<string, any> {
  try {
    return typeof field === "string" ? JSON.parse(field) : field || {};
  } catch {
    return {};
  }
}

/**
 * Convert API response to CustomPageData
 * @param data - API response from /tenant/pages/{id}
 * @returns CustomPageData for component state
 */
export function convertApiResponseToPageData(
  data: CustomPageApiResponse
): CustomPageData {
  const settings = parseJsonField(data.settings);
  const metadata = parseJsonField(data.metadata);

  return {
    id: String(data.id),
    name: metadata.name || settings.name || "Custom Page",
    slug: data.slug || "custom-page",
    title: data.title || metadata.name || "Custom Page",
    description:
      metadata.description ||
      settings.description ||
      "A custom page built with drag and drop",
    metaKeyword: data.meta_keywords || "",
    metaDescription: data.meta_description || "",
    status: data.status || "draft",
    show_in_nav: data.show_in_nav || 0,
    settings: {
      headerStyle: settings.headerStyle || "default",
      footerStyle: settings.footerStyle || "default",
      backgroundColor: settings.backgroundColor || "#ffffff",
      textColor: settings.textColor || "#1f2937",
    },
  };
}

/**
 * Build complete page data structure from API response
 * Includes layout and metadata
 * @param data - API response
 * @param settings - Parsed settings object
 * @param metadata - Parsed metadata object
 * @returns Complete PageData structure
 */
export function buildPageData(
  data: CustomPageApiResponse,
  settings: Record<string, any>,
  metadata: Record<string, any>
): PageData {
  return {
    id: data.id,
    tenant_id: data.tenant_id,
    title: data.title || metadata.name || "Custom Page",
    slug: data.slug || "custom-page",
    parent_id: (data as any).parent_id,
    position: (data as any).position || 1,
    show_in_nav: data.show_in_nav || 0,
    show_in_footer: data.show_in_footer || 0,
    status: data.status || "draft",
    page_type: (data as any).page_type || "custom",
    metadata: {
      name: metadata.name || settings.name || "Custom Page",
      description:
        metadata.description ||
        settings.description ||
        "A custom page built with drag and drop",
      settings: {
        headerStyle: settings.headerStyle || "default",
        footerStyle: settings.footerStyle || "default",
        backgroundColor: settings.backgroundColor || "#ffffff",
        textColor: settings.textColor || "#1f2937",
      },
    },
    created_by_id: data.created_by_id,
    created_by_type: data.created_by_type,
    updated_by_id: data.updated_by_id,
    updated_by_type: data.updated_by_type,
    created_at: data.created_at,
    updated_at: data.updated_at,
    page_layout: {
      id: data.page_layout?.id ? Number(data.page_layout.id) : Number(data.id),
      page_id: String(data.id),
      page_slug: data.slug,
      layout_json:
        data.page_layout?.layout_json ||
        data.layout_json ||
        JSON.stringify(DEFAULT_LAYOUT_JSON),
      created_at:
        data.page_layout?.created_at ||
        data.created_at ||
        new Date().toISOString(),
      updated_at:
        data.page_layout?.updated_at ||
        data.updated_at ||
        new Date().toISOString(),
    },
  };
}

/**
 * Check if slug is valid format
 * @param slug - Slug string to validate
 * @returns true if valid
 */
export function isValidSlug(slug: string): boolean {
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slug.length >= 3 && slug.length <= 100 && slugPattern.test(slug);
}

/**
 * Convert page slug to URL path
 * @param slug - Page slug
 * @returns Full path
 */
export function getPagePath(slug: string): string {
  return `/${slug}`;
}

/**
 * Check if page is accessible to users
 * @param status - Page status
 * @returns true if published and accessible
 */
export function isPageAccessible(status: string): boolean {
  return status === "published";
}

/**
 * Get status badge information
 * @param status - Page status
 * @returns Icon and color class
 */
export function getStatusBadgeInfo(status: string): {
  icon: string;
  label: string;
} {
  switch (status) {
    case "published":
      return { icon: "✅", label: "Live and accessible to users" };
    case "archived":
      return { icon: "📦", label: "Archived and not accessible" };
    default:
      return {
        icon: "⚠️",
        label: 'Set status to "Published" to make it accessible',
      };
  }
}
