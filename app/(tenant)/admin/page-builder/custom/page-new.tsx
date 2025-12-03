"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { WithBuilderErrorBoundary } from "@/components/page-builder/components/builder-error-boundary";
import {
  PageHeader,
  PageSidebar,
  PageBuilderContent,
  PageLoadingSkeleton,
} from "@/components/page-builder/custom-page";
import { useCustomPageBuilder } from "@/hooks/use-custom-page-builder";

/**
 * Custom Page Builder - Clean Orchestrator Component
 *
 * Composition:
 * - PageHeader: Title and delete button
 * - PageSidebar: Settings panel (uses PageSettingsSidebar)
 * - PageBuilderContent: Main canvas (uses BuilderCanvas)
 * - useCustomPageBuilder: State management hook
 *
 * Separated concerns:
 * - State logic → useCustomPageBuilder hook
 * - UI components → individual component files
 * - Helpers → lib/page-builder/custom-page-helpers.ts
 * - Types → types/custom-page.ts
 * - Constants → constants/page-builder.ts
 */
export default function CustomPageBuilder() {
  const { token } = useAuth();
  const {
    page,
    pageId,
    initialPageData,
    isLoading,
    isDeleting,
    handleSettingsChange,
    deletePage,
    loadPageFromUrl,
  } = useCustomPageBuilder();

  // Load page on mount
  useEffect(() => {
    loadPageFromUrl(token || "");
  }, [token, loadPageFromUrl]);

  if (isLoading) {
    return <PageLoadingSkeleton />;
  }

  return (
    <WithBuilderErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <PageHeader page={page} isDeleting={isDeleting} onDelete={deletePage} />

        <div className="container mx-auto p-6 flex gap-6 flex-1">
          <PageSidebar page={page} onSettingsChange={handleSettingsChange} />
          <PageBuilderContent
            pageId={pageId}
            initialPageData={initialPageData}
            page={page}
            onPageSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </WithBuilderErrorBoundary>
  );
}
