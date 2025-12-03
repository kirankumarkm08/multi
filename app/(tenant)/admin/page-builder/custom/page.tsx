'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { apiFetch } from '@/lib/api-config';
import { BuilderCanvas } from '@/components/page-builder/builder-canvas-refactored';
import { PageSettingsSidebar, PAGE_SETTINGS_PRESETS } from '@/components/page-builder/components/page-settings-sidebar';
import { WithBuilderErrorBoundary } from '@/components/page-builder/components/builder-error-boundary';
import {
  CustomPageData,
  CustomPageApiResponse,
  CustomPageBuilderComponentProps,
} from '@/types/custom-page';
import {
  PAGE_BUILDER_ERRORS,
  PAGE_BUILDER_SUCCESS,
  DEFAULT_CUSTOM_PAGE_DATA,
} from '@/constants/page-builder';
import {
  convertApiResponseToPageData,
  buildPageData,
  parseJsonField,
} from '@/lib/page-builder/custom-page-helpers';

/**
 * Custom Page Builder - Clean Main Component
 * Uses refactored architecture with hooks and reusable components
 */
export default function CustomPageBuilder() {
  const { token } = useAuth();
  const [page, setPage] = useState<CustomPageData>(
    DEFAULT_CUSTOM_PAGE_DATA as CustomPageData
  );
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pageId, setPageId] = useState<number>();
  const [initialPageData, setInitialPageData] = useState<any>(null);

  // Load page from URL params on mount
  useEffect(() => {
    if (!token) return;

    const urlPageId = new URLSearchParams(window.location.search).get('id');
    if (urlPageId) {
      setPageId(Number(urlPageId));
      loadPage(urlPageId);
    }
  }, [token]);

  /**
   * Load page data from API
   */
  const loadPage = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const res = await apiFetch(`/tenant/pages/${id}`);
      const data: CustomPageApiResponse = res?.data || res;

      if (!data) {
        throw new Error(PAGE_BUILDER_ERRORS.PAGE_NOT_FOUND);
      }

      // Parse JSON fields
      const settings = parseJsonField(data.settings);
      const metadata = parseJsonField(data.metadata);

      // Build complete page data
      const pageData = buildPageData(data, settings, metadata);
      setInitialPageData(pageData);

      // Convert to component state
      const pageState = convertApiResponseToPageData(data);
      setPage(pageState);
    } catch (err: any) {
      console.error(PAGE_BUILDER_ERRORS.FAILED_TO_LOAD, err);
      toast.error(err?.message || PAGE_BUILDER_ERRORS.FAILED_TO_LOAD);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete the current page
   */
  const deletePage = async () => {
    if (
      !page.id ||
      !confirm(PAGE_BUILDER_ERRORS.CONFIRM_DELETE)
    )
      return;

    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, { method: 'DELETE' });
      toast.success(PAGE_BUILDER_SUCCESS.PAGE_DELETED);
      setPage({ ...DEFAULT_CUSTOM_PAGE_DATA } as CustomPageData);
      window.history.pushState({}, '', '?');
    } catch (err: any) {
      console.error(PAGE_BUILDER_ERRORS.FAILED_TO_DELETE, err);
      toast.error(err?.message || PAGE_BUILDER_ERRORS.FAILED_TO_DELETE);
    } finally {
      setIsDeleting(false);
    }

  };

  /**
   * Handle page settings change
   */
  const handleSettingsChange = (updates: Partial<CustomPageData>) => {
    setPage((prev) => ({ ...prev, ...updates }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  return (
    <WithBuilderErrorBoundary>
      <div className="min-h-screen">
        <PageBuilderHeader
          page={page}
          isDeleting={isDeleting}
          onDelete={deletePage}
        />

        <div className="container mx-auto p-6">
          <div className="flex gap-6">
            <PageBuilderSidebar
              page={page}
              onSettingsChange={handleSettingsChange}
            />
            <PageBuilderContent
              pageId={pageId}
              initialPageData={initialPageData}
              page={page}
              onPageSettingsChange={handleSettingsChange}
            />
          </div>
        </div>
      </div>
    </WithBuilderErrorBoundary>
  );
}

/**
 * Header Component with title and delete button
 */
function PageBuilderHeader({
  page,
  isDeleting,
  onDelete,
}: {
  page: CustomPageData;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {page.name || 'Custom Page Builder'}
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {page.slug && `URL: /${page.slug}`}
          </p>
        </div>
        {page.id && (
          <button
            onClick={onDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
          >
            {isDeleting ? 'Deleting...' : 'Delete Page'}
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Sidebar with page settings - uses reusable PageSettingsSidebar component
 */
function PageBuilderSidebar({
  page,
  onSettingsChange,
}: {
  page: CustomPageData;
  onSettingsChange: (updates: Partial<CustomPageData>) => void;
}) {
  return (
    <PageSettingsSidebar
      config={PAGE_SETTINGS_PRESETS.customPage}
      values={{
        title: page.title,
        slug: page.slug,
        status: page.status,
        show_in_nav: page.show_in_nav,
        metaKeyword: page.metaKeyword,
        metaDescription: page.metaDescription,
      }}
      onChange={onSettingsChange}
    />
  );
}

/**
 * Main builder content area - uses refactored BuilderCanvas
 */
function PageBuilderContent({
  pageId,
  initialPageData,
  page,
  onPageSettingsChange,
}: CustomPageBuilderComponentProps) {
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
          metaKeyword: page.metaKeyword,
          metaDescription: page.metaDescription,
        }}
        onPageSettingsChange={(settings) => {
          onPageSettingsChange({
            title: settings.title,
            slug: settings.slug,
            status: settings.status,
          });
        }}
      />
    </div>
  );
}
