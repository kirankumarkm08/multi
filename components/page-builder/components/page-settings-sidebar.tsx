/**
 * Reusable Page Settings Sidebar Component
 * Used by both Custom Page Builder and Landing Page Builder
 */

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, SelectField, TextAreaField } from "./form-fields";
import { PAGE_STATUS_OPTIONS, NAVIGATION_OPTIONS } from "@/constants/page-builder";

/**
 * Page settings configuration
 */
export interface PageSettingsConfig {
  // Field visibility
  showTitle?: boolean;
  showSlug?: boolean;
  showNavigation?: boolean;
  showMetaKeywords?: boolean;
  showMetaDescription?: boolean;
  showStatus?: boolean;
  showStatusCard?: boolean;

  // Field customization
  titleLabel?: string;
  titlePlaceholder?: string;
  slugLabel?: string;
  slugPlaceholder?: string;
  metaKeywordsLabel?: string;
  metaKeywordsPlaceholder?: string;
  metaDescriptionLabel?: string;
  metaDescriptionPlaceholder?: string;

  // Field requirements
  titleRequired?: boolean;
  slugRequired?: boolean;

  // Card title
  cardTitle?: string;
}

/**
 * Page settings values
 */
export interface PageSettingsValues {
  title?: string;
  slug?: string;
  status?: "draft" | "published" | "archived";
  show_in_nav?: number;
  metaKeyword?: string;
  metaDescription?: string;
  meta_keywords?: string;
  meta_description?: string;
}

/**
 * Props for PageSettingsSidebar
 */
export interface PageSettingsSidebarProps {
  config?: PageSettingsConfig;
  values: PageSettingsValues;
  onChange: (updates: Partial<PageSettingsValues>) => void;
  className?: string;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: Required<PageSettingsConfig> = {
  showTitle: true,
  showSlug: true,
  showNavigation: true,
  showMetaKeywords: true,
  showMetaDescription: true,
  showStatus: true,
  showStatusCard: true,

  titleLabel: "Page Title",
  titlePlaceholder: "Enter page title",
  slugLabel: "URL Slug",
  slugPlaceholder: "page-url-slug",
  metaKeywordsLabel: "Meta Keywords",
  metaKeywordsPlaceholder: "keyword1, keyword2, keyword3",
  metaDescriptionLabel: "Meta Description",
  metaDescriptionPlaceholder: "Brief description for search engines",

  titleRequired: true,
  slugRequired: true,

  cardTitle: "Page Settings",
};

/**
 * Reusable Page Settings Sidebar
 */
export function PageSettingsSidebar({
  config = {},
  values,
  onChange,
  className = "",
}: PageSettingsSidebarProps) {
  // Merge config with defaults
  const mergedConfig = { ...DEFAULT_CONFIG, ...config };

  // Normalize meta fields (handle both naming conventions)
  const metaKeywords = values.metaKeyword || values.meta_keywords || "";
  const metaDescription = values.metaDescription || values.meta_description || "";

  return (
    <div className={`w-80 flex-shrink-0 ${className}`}>
      <Card className="h-fit sticky top-6">
        <CardHeader>
          <CardTitle>{mergedConfig.cardTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Page Title */}
            {mergedConfig.showTitle && (
              <FormField
                label={mergedConfig.titleLabel}
                id="page-title"
                value={values.title || ""}
                onChange={(value) => onChange({ title: value })}
                placeholder={mergedConfig.titlePlaceholder}
                required={mergedConfig.titleRequired}
              />
            )}

            {/* URL Slug */}
            {mergedConfig.showSlug && (
              <FormField
                label={mergedConfig.slugLabel}
                id="page-slug"
                value={values.slug || ""}
                onChange={(value) => onChange({ slug: value })}
                placeholder={mergedConfig.slugPlaceholder}
                required={mergedConfig.slugRequired}
              />
            )}

            {/* Show in Navigation */}
            {mergedConfig.showNavigation && (
              <SelectField
                label="Show in Navigation"
                value={(values.show_in_nav ?? 0).toString()}
                onValueChange={(value) =>
                  onChange({ show_in_nav: Number(value) })
                }
                options={NAVIGATION_OPTIONS as any}
              />
            )}

            {/* Meta Keywords */}
            {mergedConfig.showMetaKeywords && (
              <FormField
                label={mergedConfig.metaKeywordsLabel}
                id="meta_keywords"
                value={metaKeywords}
                onChange={(value) =>
                  onChange({
                    metaKeyword: value,
                    meta_keywords: value,
                  })
                }
                placeholder={mergedConfig.metaKeywordsPlaceholder}
              />
            )}

            {/* Meta Description */}
            {mergedConfig.showMetaDescription && (
              <TextAreaField
                label={mergedConfig.metaDescriptionLabel}
                id="meta_description"
                value={metaDescription}
                onChange={(value) =>
                  onChange({
                    metaDescription: value,
                    meta_description: value,
                  })
                }
                placeholder={mergedConfig.metaDescriptionPlaceholder}
                rows={3}
              />
            )}

            {/* Status */}
            {mergedConfig.showStatus && (
              <SelectField
                label="Status"
                value={values.status || "draft"}
                onValueChange={(value: "draft" | "published" | "archived") =>
                  onChange({ status: value })
                }
                options={PAGE_STATUS_OPTIONS as any}
              />
            )}
          </div>

          {/* Status Info Card */}
          {mergedConfig.showStatusCard && values.slug && (
            <div className="text-sm text-gray-600 dark:text-gray-300 mt-4 p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/40 transition-all">
              <div className="flex flex-col gap-2">
                <p className="flex flex-wrap items-center">
                  <span className="text-gray-500 dark:text-gray-400 text-xs">
                    Accessible at:
                  </span>
                  <span className="ml-2 font-mono text-[12px] bg-gray-100 dark:bg-gray-700 px-2 py-[2px] rounded border border-gray-200 dark:border-gray-600">
                    /{values.slug}
                  </span>
                </p>

                {values.status === "published" ? (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium text-xs">
                    <span className="text-base"></span>
                    <span>Live and accessible to users</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium text-xs">
                    <span className="text-base"> </span>
                    <span>Set to "Published" to make accessible</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Preset configurations for different page types
 */
export const PAGE_SETTINGS_PRESETS = {
  /**
   * Configuration for custom pages
   */
  customPage: {
    showTitle: true,
    showSlug: true,
    showNavigation: true,
    showMetaKeywords: true,
    showMetaDescription: true,
    showStatus: true,
    showStatusCard: true,
    titleLabel: "Page Title",
    titlePlaceholder: "Enter page title",
    slugLabel: "URL Slug",
    slugPlaceholder: "page-url-slug",
    metaKeywordsLabel: "Meta Keywords",
    metaKeywordsPlaceholder: "keyword1, keyword2, keyword3",
    metaDescriptionLabel: "Meta Description",
    metaDescriptionPlaceholder: "Brief description for search engines",
    titleRequired: true,
    slugRequired: true,
    cardTitle: "Page Settings",
  } as PageSettingsConfig,

  /**
   * Configuration for landing pages
   */
  landingPage: {
    showTitle: true,
    showSlug: false, // Landing page usually has fixed slug
    showNavigation: false, // Landing pages don't show in nav
    showMetaKeywords: true,
    showMetaDescription: true,
    showStatus: true,
    showStatusCard: false, // Landing pages don't need status card
    titleLabel: "Meta Title",
    titlePlaceholder: "Enter landing page title",
    metaKeywordsLabel: "Meta Keywords",
    metaKeywordsPlaceholder: "Enter comma-separated keywords",
    metaDescriptionLabel: "Meta Description",
    metaDescriptionPlaceholder: "Enter meta description for SEO",
    titleRequired: false,
    slugRequired: false,
    cardTitle: "Landing Page Settings",
  } as PageSettingsConfig,
};
