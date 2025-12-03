/**
 * Page Builder Constants
 * Extracted from custom page builder and landing page builder components
 */

/**
 * Page status options for dropdown
 */
export const PAGE_STATUS_OPTIONS = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "archived", label: "Archived" },
] as const;

/**
 * Navigation visibility options
 */
export const NAVIGATION_OPTIONS = [
  { value: "0", label: "No" },
  { value: "1", label: "Yes" },
] as const;

/**
 * Header style options
 */
export const HEADER_STYLE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "minimal", label: "Minimal" },
  { value: "classic", label: "Classic" },
] as const;

/**
 * Footer style options
 */
export const FOOTER_STYLE_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "minimal", label: "Minimal" },
  { value: "classic", label: "Classic" },
] as const;

/**
 * Default page settings
 */
export const DEFAULT_PAGE_SETTINGS = {
  headerStyle: "default",
  footerStyle: "default",
  backgroundColor: "#ffffff",
  textColor: "#1f2937",
} as const;

/**
 * Default custom page data for new pages
 */
export const DEFAULT_CUSTOM_PAGE_DATA = {
  id: "",
  name: "New Custom Page",
  slug: "custom-page",
  title: "Custom Page",
  description: "A custom page built with drag and drop",
  status: "draft" as const,
  show_in_nav: 0,
  metaKeyword: "",
  metaDescription: "",
  settings: DEFAULT_PAGE_SETTINGS,
} as const;

/**
 * Default landing page data for new pages
 */
export const DEFAULT_LANDING_PAGE_DATA = {
  id: "",
  name: "New Landing Page",
  slug: "landing-page",
  title: "Landing Page",
  description: "A landing page built with drag and drop",
  status: "draft" as const,
  show_in_nav: 0,
  metaKeyword: "",
  metaDescription: "",
  settings: DEFAULT_PAGE_SETTINGS,
} as const;

/**
 * Error messages
 */
export const PAGE_BUILDER_ERRORS = {
  PAGE_NOT_FOUND: "Page not found",
  FAILED_TO_LOAD: "Failed to load page",
  FAILED_TO_DELETE: "Failed to delete page",
  FAILED_TO_SAVE: "Failed to save page",
  INVALID_PAGE_ID: "Invalid page ID",
  CONFIRM_DELETE: "Are you sure you want to delete this page?",
} as const;

/**
 * Success messages
 */
export const PAGE_BUILDER_SUCCESS = {
  PAGE_DELETED: "Page deleted successfully",
  PAGE_SAVED: "Page saved successfully",
  SETTINGS_UPDATED: "Settings updated successfully",
} as const;

/**
 * Status badge styling
 */
export const STATUS_BADGE_STYLES = {
  draft: { icon: "⚠️", color: "text-amber-600 dark:text-amber-400" },
  published: { icon: "✅", color: "text-green-600 dark:text-green-400" },
  archived: { icon: "📦", color: "text-gray-600 dark:text-gray-400" },
} as const;

/**
 * Default layout JSON for new pages
 */
export const DEFAULT_LAYOUT_JSON = {
  sections: [],
  meta: {
    isCustomPage: true,
    version: "1.0",
  },
} as const;

/**
 * Form field validation rules
 */
export const FORM_VALIDATION = {
  MIN_SLUG_LENGTH: 3,
  MAX_SLUG_LENGTH: 100,
  MIN_TITLE_LENGTH: 1,
  MAX_TITLE_LENGTH: 255,
  SLUG_PATTERN: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
} as const;
