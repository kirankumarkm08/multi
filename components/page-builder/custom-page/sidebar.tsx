"use client";

import { CustomPageData } from "@/types/custom-page";
import { PageSettingsSidebar } from "@/components/page-builder/components/page-settings-sidebar";

interface PageSidebarProps {
  page: CustomPageData;
  onSettingsChange: (updates: Partial<CustomPageData>) => void;
}

/**
 * Page Sidebar Component
 * Wrapper around PageSettingsSidebar with custom page specific logic
 */
export function PageSidebar({ page, onSettingsChange }: PageSidebarProps) {
  const handleSettingChange = (key: keyof CustomPageData, value: any) => {
    onSettingsChange({ [key]: value });
  };

  return (
    <PageSettingsSidebar
      title="Page Settings"
      pageData={{
        title: page.title,
        slug: page.slug,
        status: page.status,
        meta_description: page.metaDescription,
        meta_keywords: page.metaKeyword,
      }}
      onSettingsChange={(updates) => {
        const customUpdates: Partial<CustomPageData> = {};

        if (updates.title !== undefined) customUpdates.title = updates.title;
        if (updates.slug !== undefined) customUpdates.slug = updates.slug;
        if (updates.status !== undefined) customUpdates.status = updates.status;
        if (updates.meta_description !== undefined)
          customUpdates.metaDescription = updates.meta_description;
        if (updates.meta_keywords !== undefined)
          customUpdates.metaKeyword = updates.meta_keywords;

        onSettingsChange(customUpdates);
      }}
    />
  );
}
