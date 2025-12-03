/**
 * Custom Page Builder Types
 * Extracted from app/(tenant)/admin/page-builder/custom/page.tsx
 */

import { PageData } from "./pagebuilder";

/**
 * Custom page data structure matching API response and component state
 */
export interface CustomPageData {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  metaKeyword?: string;
  metaDescription?: string;
  status: "draft" | "published" | "archived";
  show_in_nav: number;
  settings?: CustomPageSettings;
}

/**
 * Custom page visual/style settings
 */
export interface CustomPageSettings {
  headerStyle?: string;
  footerStyle?: string;
  backgroundColor?: string;
  textColor?: string;
}

/**
 * Props for the custom page builder component
 */
export interface CustomPageBuilderProps {
  pageId?: number;
  token: string;
}

/**
 * Settings change handler callback
 */
export type CustomPageSettingsChange = (
  updates: Partial<CustomPageData>
) => void;

/**
 * Page layout and metadata combined
 */
export interface CustomPageLayout {
  id: string;
  page_id: string;
  page_slug: string;
  layout_json: string;
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

/**
 * API response shape for loading a page
 */
export interface CustomPageApiResponse {
  id: number;
  tenant_id: string;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  show_in_nav: number;
  show_in_footer?: number;
  meta_keywords?: string;
  meta_description?: string;
  settings?: string; // JSON string
  metadata?: string; // JSON string
  page_layout?: CustomPageLayout;
  layout_json?: string;
  page_type?: string;
  created_at: string;
  updated_at: string;
  created_by_id?: number;
  created_by_type?: string;
  updated_by_id?: number;
  updated_by_type?: string;
}

/**
 * Sidebar component props
 */
export interface CustomPageSidebarProps {
  page: CustomPageData;
  onSettingsChange: CustomPageSettingsChange;
}

/**
 * Builder component props
 */
export interface CustomPageBuilderComponentProps {
  pageId?: number;
  initialPageData: PageData | null;
  page: CustomPageData;
  onPageSettingsChange: CustomPageSettingsChange;
}
