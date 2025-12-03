/**
 * Main hook for managing page builder state and operations
 * Consolidates all page builder logic into a single, reusable hook
 */

import { useState, useCallback, useEffect } from "react";
import {
  PageData,
  Section,
  Module,
  TargetColumn,
  DEFAULT_SECTIONS,
} from "@/types";
import {
  extractLayoutFromPageData,
  parseLayoutJson,
} from "@/lib/page-builder/helpers";
import { pagesService } from "@/services/pages.service";
import { useModuleManagement } from "./use-module-management";
import { useSectionManagement } from "./use-section-management";
import { useIdGenerator } from "./use-id-generator";
import { toast } from "@/hooks/use-toast";

export interface PageBuilderState {
  pageData: PageData;
  sections: Section[];
  selectedSection: string | null;
  isLoading: boolean;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  loadError: string | null;
}

export interface PageBuilderActions {
  loadPageData: () => Promise<void>;
  savePageLayout: () => Promise<void>;
  addSection: () => void;
  deleteSection: (sectionId: string) => void;
  duplicateSection: (sectionId: string) => void;
  selectSection: (sectionId: string | null) => void;
  updatePageData: (data: Partial<PageData>) => void;
  setSections: (sections: Section[]) => void;
}

interface UsePageBuilderOptions {
  pageId?: number;
  pageType?: string;
  initialPageData?: PageData;
  onSaveSuccess?: (payload: any) => void;
  onSaveError?: (error: string) => void;
}

export function usePageBuilder({
  pageId,
  pageType = "custom",
  initialPageData,
  onSaveSuccess,
  onSaveError,
}: UsePageBuilderOptions): [PageBuilderState, PageBuilderActions] {
  // State management
  const [pageData, setPageData] = useState<PageData>(
    initialPageData || {
      title: "New Page",
      slug: "new-page",
      page_type: pageType,
      status: "published",
      metadata: null,
    }
  );

  const [sections, setSections] = useState<Section[]>(DEFAULT_SECTIONS);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Hooks
  const generateId = useIdGenerator();
  const sectionMgmt = useSectionManagement({ setSections, generateId });
  const moduleMgmt = useModuleManagement({ setSections, generateId });

  // Load page data
  const loadPageData = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      if (initialPageData) {
        setPageData(initialPageData);
        const layoutJson = extractLayoutFromPageData(initialPageData);
        if (layoutJson) {
          setSections(parseLayoutJson(layoutJson));
        }
        return;
      }

      if (pageId) {
        const response = await pagesService.getPage(pageId);
        if (response.success && response.data) {
          const loadedPageData = {
            ...response.data.data,
            page_type: response.data.data.page_type || pageType,
          };
          setPageData(loadedPageData);

          if (loadedPageData.page_layout?.layout_json) {
            setSections(
              parseLayoutJson(loadedPageData.page_layout.layout_json)
            );
          }
        } else {
          throw new Error(response.error || "Failed to load page");
        }
        return;
      }

      if (!pageId) {
        setPageData((prev) => ({ ...prev, page_type: pageType }));
      }
    } catch (error: any) {
      console.error("Error loading page data:", error);
      const errorMessage = error.message || "Failed to load page data";
      setLoadError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [pageId, pageType, initialPageData]);

  // Save page layout
  const savePageLayout = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // Import here to avoid circular dependency
      const { createPagePayload } = await import("@/lib/page-builder/helpers");
      const pagePayload = createPagePayload(
        {
          title: pageData.title || "New Page",
          slug: (pageData as any).slug || "new-page",
          status: (pageData as any).status || "published",
          meta_description: (pageData as any).meta_description || "",
          meta_keywords: (pageData as any).meta_keywords || "",
        },
        pageData,
        sections
      );

      let result: any;
      if (pageId) {
        result = await pagesService.updatePage(pageId, pagePayload);
      } else {
        result = await pagesService.createPage(pagePayload);
        if (result.success && result.data?.id) {
          setPageData((prev) => ({ ...prev, id: result.data.id }));
        }
      }

      if (result.success) {
        setSaveSuccess(true);
        setPageData((prev) => ({ ...prev, ...pagePayload }));
        onSaveSuccess?.(pagePayload);

        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        throw new Error(result.error || "Failed to save page");
      }
    } catch (error: any) {
      console.error("Error saving page:", error);

      const errorMessage =
        error.status === 422
          ? `Validation error: ${
              error.data?.message ||
              error.message ||
              "Please check required fields"
            }`
          : error.message || "Failed to save page";

      setSaveError(errorMessage);
      onSaveError?.(errorMessage);

      toast({
        title: "Save Failed",
        description: errorMessage,
        variant: "destructive",
      });

      setTimeout(() => setSaveError(null), 3000);
    } finally {
      setIsSaving(false);
    }
  }, [pageId, pageData, sections, onSaveSuccess, onSaveError]);

  // Update page data
  const updatePageData = useCallback((data: Partial<PageData>) => {
    setPageData((prev) => ({ ...prev, ...data }));
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  const state: PageBuilderState = {
    pageData,
    sections,
    selectedSection,
    isLoading,
    isSaving,
    saveSuccess,
    saveError,
    loadError,
  };

  const actions: PageBuilderActions = {
    loadPageData,
    savePageLayout,
    addSection: sectionMgmt.addSection,
    deleteSection: sectionMgmt.deleteSection,
    duplicateSection: sectionMgmt.duplicateSection,
    selectSection: setSelectedSection,
    updatePageData,
    setSections,
  };

  return [state, actions];
}
