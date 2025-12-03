/**
 * Centralized Page ID Management Utility
 * Handles page ID extraction, validation, and URL management
 */

export type PageId = string | number | null | undefined;

export interface PageIdContext {
  pageId: PageId;
  pageType: string;
  mode: "create" | "edit" | "view";
  source: "url" | "route" | "props" | "state";
}

export interface PageIdManagerOptions {
  /**
   * Whether to automatically update URL when page ID changes
   */
  updateUrl?: boolean;

  /**
   * Whether to validate page ID format
   */
  validate?: boolean;

  /**
   * Default page type if none provided
   */
  defaultPageType?: string;
}

export class PageIdManager {
  private pageId: PageId = null;
  private pageType: string = "custom";
  private mode: "create" | "edit" | "view" = "create";
  private source: "url" | "route" | "props" | "state" = "props";
  private options: PageIdManagerOptions;

  constructor(options: PageIdManagerOptions = {}) {
    this.options = {
      updateUrl: false,
      validate: true,
      defaultPageType: "custom",
      ...options,
    };
  }

  /**
   * Extract page ID from URL search parameters
   */
  static fromSearchParams(searchParams: URLSearchParams): PageId {
    return searchParams.get("id") || null;
  }

  /**
   * Extract page ID from Next.js route parameters
   */
  static fromRouteParams(params: Record<string, string | string[]>): PageId {
    const id = params.id;
    if (Array.isArray(id)) {
      return id[0] || null;
    }
    return id || null;
  }

  /**
   * Extract page type from URL search parameters
   */
  static getPageTypeFromSearchParams(searchParams: URLSearchParams): string {
    return searchParams.get("type") || "custom";
  }

  /**
   * Validate page ID format
   */
  static validatePageId(pageId: PageId): boolean {
    if (pageId === null || pageId === undefined) return true;

    const idStr = String(pageId);
    return /^\d+$/.test(idStr) || /^[a-zA-Z0-9-_]+$/.test(idStr);
  }

  /**
   * Convert page ID to number if possible
   */
  static toNumber(pageId: PageId): number | null {
    if (pageId === null || pageId === undefined) return null;
    const num = Number(pageId);
    return isNaN(num) ? null : num;
  }

  /**
   * Convert page ID to string
   */
  static toString(pageId: PageId): string | null {
    if (pageId === null || pageId === undefined) return null;
    return String(pageId);
  }

  /**
   * Initialize page ID manager with context
   */
  initialize(context: Partial<PageIdContext>): void {
    if (context.pageId !== undefined) {
      this.pageId = context.pageId;
      this.source = context.source || "props";
    }

    if (context.pageType) {
      this.pageType = context.pageType;
    }

    if (context.mode) {
      this.mode = context.mode;
    }

    // Auto-detect mode based on page ID
    if (this.pageId && this.mode === "create") {
      this.mode = "edit";
    }
  }

  /**
   * Get current page ID
   */
  getPageId(): PageId {
    return this.pageId;
  }

  /**
   * Get current page type
   */
  getPageType(): string {
    return this.pageType;
  }

  /**
   * Get current mode
   */
  getMode(): "create" | "edit" | "view" {
    return this.mode;
  }

  /**
   * Get current source
   */
  getSource(): "url" | "route" | "props" | "state" {
    return this.source;
  }

  /**
   * Set page ID and update mode accordingly
   */
  setPageId(pageId: PageId): void {
    if (this.options.validate && !PageIdManager.validatePageId(pageId)) {
      throw new Error(`Invalid page ID format: ${pageId}`);
    }

    this.pageId = pageId;
    this.source = "state";

    // Update mode based on page ID
    if (pageId) {
      this.mode = "edit";
    } else {
      this.mode = "create";
    }

    // Update URL if enabled
    if (this.options.updateUrl && typeof window !== "undefined") {
      this.updateUrl();
    }
  }

  /**
   * Set page type
   */
  setPageType(pageType: string): void {
    this.pageType = pageType;

    if (this.options.updateUrl && typeof window !== "undefined") {
      this.updateUrl();
    }
  }

  /**
   * Check if page ID exists
   */
  hasPageId(): boolean {
    return this.pageId !== null && this.pageId !== undefined;
  }

  /**
   * Check if in create mode
   */
  isCreateMode(): boolean {
    return this.mode === "create";
  }

  /**
   * Check if in edit mode
   */
  isEditMode(): boolean {
    return this.mode === "edit";
  }

  /**
   * Check if in view mode
   */
  isViewMode(): boolean {
    return this.mode === "view";
  }

  /**
   * Get page ID as number (for API calls)
   */
  getPageIdAsNumber(): number | null {
    return PageIdManager.toNumber(this.pageId);
  }

  /**
   * Get page ID as string (for URL parameters)
   */
  getPageIdAsString(): string | null {
    return PageIdManager.toString(this.pageId);
  }

  /**
   * Generate URL parameters for current state
   */
  getUrlParams(): URLSearchParams {
    const params = new URLSearchParams();

    if (this.pageId) {
      params.set("id", String(this.pageId));
    }

    if (this.pageType && this.pageType !== this.options.defaultPageType) {
      params.set("type", this.pageType);
    }

    return params;
  }

  /**
   * Generate URL string for current state
   */
  getUrl(baseUrl: string = ""): string {
    const params = this.getUrlParams();
    const queryString = params.toString();
    return queryString ? `${baseUrl}?${queryString}` : baseUrl;
  }

  /**
   * Update browser URL with current state
   */
  private updateUrl(): void {
    if (typeof window === "undefined") return;

    const url = this.getUrl(window.location.pathname);
    window.history.replaceState({}, "", url);
  }

  /**
   * Get full context information
   */
  getContext(): PageIdContext {
    return {
      pageId: this.pageId,
      pageType: this.pageType,
      mode: this.mode,
      source: this.source,
    };
  }

  /**
   * Reset to initial state
   */
  reset(): void {
    this.pageId = null;
    this.pageType = this.options.defaultPageType || "custom";
    this.mode = "create";
    this.source = "props";
  }
}

/**
 * React hook for page ID management
 */
export function usePageIdManager(options: PageIdManagerOptions = {}) {
  const manager = new PageIdManager(options);

  return {
    manager,

    // Convenience methods
    initialize: (context: Partial<PageIdContext>) =>
      manager.initialize(context),
    setPageId: (pageId: PageId) => manager.setPageId(pageId),
    setPageType: (pageType: string) => manager.setPageType(pageType),

    // Getters
    pageId: manager.getPageId(),
    pageType: manager.getPageType(),
    mode: manager.getMode(),
    source: manager.getSource(),
    hasPageId: manager.hasPageId(),
    isCreateMode: manager.isCreateMode(),
    isEditMode: manager.isEditMode(),
    isViewMode: manager.isViewMode(),

    // Utilities
    getPageIdAsNumber: () => manager.getPageIdAsNumber(),
    getPageIdAsString: () => manager.getPageIdAsString(),
    getUrl: (baseUrl?: string) => manager.getUrl(baseUrl),
    getContext: () => manager.getContext(),
    reset: () => manager.reset(),
  };
}

/**
 * Utility functions for common page ID operations
 */
export const PageIdUtils = {
  /**
   * Extract page ID from various sources
   */
  extractPageId: (
    source: "searchParams" | "routeParams" | "props",
    data: any
  ): PageId => {
    switch (source) {
      case "searchParams":
        return PageIdManager.fromSearchParams(data);
      case "routeParams":
        return PageIdManager.fromRouteParams(data);
      case "props":
        return data.pageId || null;
      default:
        return null;
    }
  },

  /**
   * Create page builder URL
   */
  createPageBuilderUrl: (
    pageId?: PageId,
    pageType?: string,
    basePath: string = "/admin/page-builder/universal"
  ): string => {
    const params = new URLSearchParams();

    if (pageId) {
      params.set("id", String(pageId));
    }

    if (pageType && pageType !== "custom") {
      params.set("type", pageType);
    }

    const queryString = params.toString();
    return queryString ? `${basePath}?${queryString}` : basePath;
  },

  /**
   * Navigate to page builder
   */
  navigateToPageBuilder: (
    pageId?: PageId,
    pageType?: string,
    basePath?: string
  ): void => {
    if (typeof window === "undefined") return;

    const url = PageIdUtils.createPageBuilderUrl(pageId, pageType, basePath);
    window.location.href = url;
  },

  /**
   * Check if page ID is valid for API calls
   */
  isValidForApi: (pageId: PageId): boolean => {
    return (
      PageIdManager.validatePageId(pageId) &&
      pageId !== null &&
      pageId !== undefined
    );
  },
};
