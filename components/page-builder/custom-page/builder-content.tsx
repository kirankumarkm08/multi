"use client";

import { BuilderCanvas } from "@/components/page-builder/builder-canvas-refactored";
import { CustomPageData } from "@/types/custom-page";

interface PageBuilderContentProps {
  pageId?: number;
  initialPageData: any;
  page: CustomPageData;
  onPageSettingsChange: (updates: Partial<CustomPageData>) => void;
}

/**
 * Page Builder Content Component
 * Main canvas where users build the page
 */
export function PageBuilderContent({
  pageId,
  initialPageData,
  page,
  onPageSettingsChange,
}: PageBuilderContentProps) {
  return (
    <div className="flex-1">
      <BuilderCanvas
        pageId={pageId}
        pageType="custom"
        initialPageData={initialPageData}
        externalPageSettings={{
          title: page.title,
          slug: page.slug,
          status: page.status,
          description: page.description,
          name: page.name,
          show_in_nav: page.show_in_nav,
          settings: page.settings,
        }}
        onPageSettingsChange={(settings) => {
          onPageSettingsChange({
            title: settings.title || page.title,
            slug: settings.slug || page.slug,
            status: (settings.status as any) || page.status,
          });
        }}
      />
    </div>
  );
}
