"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api-config";
import { CustomPageData, CustomPageApiResponse } from "@/types/custom-page";
import {
  convertApiResponseToPageData,
  buildPageData,
  parseJsonField,
} from "@/lib/page-builder/custom-page-helpers";
import {
  PAGE_BUILDER_ERRORS,
  PAGE_BUILDER_SUCCESS,
  DEFAULT_CUSTOM_PAGE_DATA,
} from "@/constants/page-builder";

interface UseCustomPageBuilderReturn {
  page: CustomPageData;
  pageId?: number;
  initialPageData: any;
  isLoading: boolean;
  isDeleting: boolean;
  handleSettingsChange: (updates: Partial<CustomPageData>) => void;
  deletePage: () => Promise<void>;
  loadPageFromUrl: (token: string) => void;
}

/**
 * Hook for managing custom page builder state and operations
 * Handles loading, deletion, and state management
 */
export function useCustomPageBuilder(): UseCustomPageBuilderReturn {
  const [page, setPage] = useState<CustomPageData>(
    DEFAULT_CUSTOM_PAGE_DATA as CustomPageData
  );
  const [pageId, setPageId] = useState<number>();
  const [initialPageData, setInitialPageData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  /**
   * Load page data from API by ID
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
   * Load page from URL parameters
   */
  const loadPageFromUrl = useCallback(
    (token: string) => {
      if (!token) return;

      const urlPageId = new URLSearchParams(window.location.search).get("id");
      if (urlPageId) {
        setPageId(Number(urlPageId));
        loadPage(urlPageId);
      }
    },
    [loadPage]
  );

  /**
   * Delete the current page
   */
  const deletePage = async () => {
    if (!page.id || !confirm(PAGE_BUILDER_ERRORS.CONFIRM_DELETE)) {
      return;
    }

    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${page.id}`, { method: "DELETE" });
      toast.success(PAGE_BUILDER_SUCCESS.PAGE_DELETED);
      setPage({ ...DEFAULT_CUSTOM_PAGE_DATA } as CustomPageData);
      window.history.pushState({}, "", "?");
    } catch (err: any) {
      console.error(PAGE_BUILDER_ERRORS.FAILED_TO_DELETE, err);
      toast.error(err?.message || PAGE_BUILDER_ERRORS.FAILED_TO_DELETE);
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Update page settings
   */
  const handleSettingsChange = useCallback(
    (updates: Partial<CustomPageData>) => {
      setPage((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  return {
    page,
    pageId,
    initialPageData,
    isLoading,
    isDeleting,
    handleSettingsChange,
    deletePage,
    loadPageFromUrl,
  };
}
