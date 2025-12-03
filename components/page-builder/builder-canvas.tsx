"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { SectionArea } from "./section-area";
import { ModuleLibrary } from "./module-library";
import { BlocksPopup } from "./blocks-popup";
import { BuilderHeader } from "./builder-header";
import { StatusMessages } from "./status-messages";

import Loading from "../common/Loading";

import { blocksService } from "@/services/blocks.service";
import { pagesService } from "@/services/pages.service";
import { layoutService, PageLayoutData } from "@/services/layout.service";

import { useIdGenerator } from "@/hooks/use-id-generator";
import { usePageSettings } from "@/hooks/use-page-settings";
import { useModuleManagement } from "@/hooks/use-module-management";
import { useSectionManagement } from "@/hooks/use-section-management";
import { toast } from "@/hooks/use-toast";

import {
  createBlockModule,
  extractLayoutFromPageData,
  parseLayoutJson,
  createPagePayload,
} from "@/lib/page-builder/helpers";
import {
  DRAG_ACTIVATION_DISTANCE,
  SUCCESS_MESSAGE_DURATION,
} from "@/lib/page-builder/constants";

import {
  PageData,
  BuilderCanvasProps,
  Section,
  Module,
  ModuleLibraryState,
  BlocksPopupState,
  TargetColumn,
  DEFAULT_SECTIONS,
} from "@/types";
import { AVAILABLE_MODULES } from "@/constants/Modules";
import { FormBuilderData, formBuilderService } from "@/services";

export function BuilderCanvas({
  pageId,
  pageType = "custom",
  initialPageData,
  externalPageSettings,
  onPageSettingsChange,
  onSaveSuccess,
  onSaveError,
}: BuilderCanvasProps) {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isMounted, setIsMounted] = useState(false);
  const [pageData, setPageData] = useState<PageData>(
    () =>
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
  const [activeId, setActiveId] = useState<string | null>(null);
  const [availableBlocks, setAvailableBlocks] = useState<any[]>([]);
  const [avaiavailableForms, setAvailableForms] = useState<any[]>([]);

  const [moduleLibraryState, setModuleLibraryState] =
    useState<ModuleLibraryState>({
      isOpen: false,
      targetColumn: undefined,
    });

  const [blocksPopupState, setBlocksPopupState] = useState<BlocksPopupState>({
    isOpen: false,
    targetColumn: undefined,
  });

  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Custom hooks
  const [pageSettings, setPageSettings] = usePageSettings(
    initialPageData,
    externalPageSettings
  );
  const generateId = useIdGenerator();

  const { addModuleToColumn, removeModuleFromColumn, reorderModulesInColumn } =
    useModuleManagement({ setSections, generateId });

  const {
    addSection,
    duplicateSection,
    deleteSection,
    addRowToSection,
    updateSectionRows,
    duplicateRow,
    deleteRow,
    changeRowLayout,
    updateRowSettings,
    updateRowStyle,
  } = useSectionManagement({ setSections, generateId });

  // ============================================================================
  // DND SENSORS
  // ============================================================================

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: DRAG_ACTIVATION_DISTANCE,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  const loadAvailableBlocks = useCallback(async () => {
    try {
      const blocks = await blocksService.getBlocks();

      if (!Array.isArray(blocks)) {
        setAvailableBlocks([]);
        return;
      }

      const publishedBlocks = blocks
        .filter((block: any) => {
          const blockData = block.data || block;
          return blockData?.status === "published";
        })
        .map((block: any) => {
          const blockData = block.data || block;
          return {
            id: blockData.id,
            name: blockData.name || "Untitled Block",
            content: blockData.content || "",
            content_type: blockData.content_type || "html",
            status: blockData.status,
          };
        })
        .filter(Boolean);

      setAvailableBlocks(publishedBlocks);
    } catch (error) {
      console.error("Error loading blocks:", error);
      const errorMessage = "Failed to load blocks";
      setLoadError((prev) =>
        prev ? `${prev}; ${errorMessage}` : errorMessage
      );
      setAvailableBlocks([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  const loadAvailableForms = useCallback(async () => {
    try {
      const forms = await formBuilderService.getForms();

      if (!Array.isArray(forms)) {
        setAvailableForms([]);
        return;
      }

      const publishedForms = forms
        .filter((form: any) => {
          const formData = form.data || form;
          return formData?.status === "published";
        })
        .map((form: any) => {
          const formData = form.data || form;

          // Parse form_config if it's a string
          let parsedFormConfig = formData.form_config || { fields: [] };
          if (typeof parsedFormConfig === "string") {
            try {
              parsedFormConfig = JSON.parse(parsedFormConfig);
            } catch (e) {
              console.error("Error parsing form_config:", e);
              parsedFormConfig = { fields: [] };
            }
          }

          return {
            id: formData.id,
            name: formData.name || "Untitled Form",
            description: formData.description || "",
            form_type: formData.form_type || "",
            form_config: parsedFormConfig,
            status: formData.status,
          };
        })
        .filter(Boolean);

      setAvailableForms(publishedForms);
    } catch (error) {
      console.error("Error loading forms:", error);
      const errorMessage = "Failed to load forms";
      setLoadError((prev) =>
        prev ? `${prev}; ${errorMessage}` : errorMessage
      );
      setAvailableForms([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, []);

  useEffect(() => {
    loadAvailableForms();
  }, [loadAvailableForms]);

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

  // ============================================================================
  // MODAL MANAGEMENT
  // ============================================================================

  const openModuleLibrary = useCallback((targetColumn?: TargetColumn) => {
    setModuleLibraryState({
      isOpen: true,
      targetColumn,
    });
  }, []);

  const closeModuleLibrary = useCallback(() => {
    setModuleLibraryState({
      isOpen: false,
      targetColumn: undefined,
    });
  }, []);

  const openBlocksPopup = useCallback((targetColumn?: TargetColumn) => {
    setBlocksPopupState({
      isOpen: true,
      targetColumn,
    });
  }, []);

  const closeBlocksPopup = useCallback(() => {
    setBlocksPopupState({
      isOpen: false,
      targetColumn: undefined,
    });
  }, []);

  // ============================================================================
  // MODULE HANDLERS
  // ============================================================================

  const handleModuleSelect = useCallback(
    (module: Module) => {
      if (!module?.id) {
        console.error("Invalid module selected");
        const errorMessage = "Invalid module selected";
        setSaveError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (moduleLibraryState.targetColumn) {
        const { sectionId, rowId, columnId } = moduleLibraryState.targetColumn;
        addModuleToColumn(sectionId, rowId, columnId, module);
      }
      closeModuleLibrary();
    },
    [moduleLibraryState.targetColumn, addModuleToColumn, closeModuleLibrary]
  );

  const handleBlockSelect = useCallback(
    (block: any) => {
      if (!block?.id) {
        console.error("Invalid block selected");
        const errorMessage = "Invalid block selected";
        setSaveError(errorMessage);
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }

      if (blocksPopupState.targetColumn) {
        const blockModule = createBlockModule(block);
        const { sectionId, rowId, columnId } = blocksPopupState.targetColumn;
        addModuleToColumn(sectionId, rowId, columnId, blockModule);
      }
      closeBlocksPopup();
    },
    [blocksPopupState.targetColumn, addModuleToColumn, closeBlocksPopup]
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setActiveId(null);
        return;
      }

      const activeIndex = sections.findIndex((s) => s.id === active.id);
      const overIndex = sections.findIndex((s) => s.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
        setSections((prevSections) =>
          arrayMove(prevSections, activeIndex, overIndex)
        );
      }

      setActiveId(null);
    },
    [sections]
  );

  const savePageLayout = useCallback(async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      const pagePayload = createPagePayload(pageSettings, pageData, sections);
      console.log("Saving page with payload:", pagePayload);

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
        console.log("Page saved successfully:", result.data);

        setTimeout(() => setSaveSuccess(false), SUCCESS_MESSAGE_DURATION);
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

      setTimeout(() => {
        setSaveError(null);
      }, SUCCESS_MESSAGE_DURATION);
    } finally {
      setIsSaving(false);
    }
  }, [pageId, pageSettings, pageData, sections, onSaveSuccess, onSaveError]);

  // ============================================================================
  // EFFECTS
  // ============================================================================

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const loadData = async () => {
      await Promise.all([loadAvailableBlocks(), loadPageData()]);
    };
    loadData();
  }, [loadAvailableBlocks, loadPageData]);

  useEffect(() => {
    setPageData((prev) => ({
      ...prev,
      title: pageSettings.title,
      slug: pageSettings.slug,
      status: pageSettings.status,
    }));
  }, [pageSettings]);

  // useEffect(() => {
  //   if (externalPageSettings) {
  //     setPageSettings({
  //       title: externalPageSettings.title || "New Page",
  //       slug: externalPageSettings.slug || "new-page",
  //       status:
  //         (externalPageSettings.status as "draft" | "published" | "archived") ||
  //         "published",
  //       meta_description: externalPageSettings.meta_description,
  //       meta_keywords: externalPageSettings.meta_keywords,
  //     });
  //     setPageData((prev) => ({
  //       ...prev,
  //       show_in_nav: externalPageSettings.show_in_nav ?? prev.show_in_nav,
  //     }));
  //   }
  // }, [externalPageSettings, setPageSettings]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && moduleLibraryState.isOpen) {
        closeModuleLibrary();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "m") {
        event.preventDefault();
        openModuleLibrary();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [moduleLibraryState.isOpen, closeModuleLibrary, openModuleLibrary]);

  const sectionIds = useMemo(() => sections.map((s) => s.id), [sections]);

  const dragOverlayContent = useMemo(() => {
    if (!activeId) return null;

    const section = sections.find((s) => s.id === activeId);
    if (!section) return null;

    const iconMap: Record<Section["type"], string> = {
      header: "🏠",
      footer: "📄",
      content: "📝",
      custom: "⚡",
    };

    return (
      <div className="opacity-80 rotate-3 shadow-lg">
        <div className="border-2 border-primary rounded-md p-3 min-w-64">
          <div className="flex items-center gap-2">
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg">{iconMap[section.type]}</span>
            <span className="font-medium text-sm">{section.name}</span>
          </div>
        </div>
      </div>
    );
  }, [activeId, sections]);

  if (!isMounted || isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        <BuilderHeader
          pageType={pageData.page_type}
          pageTitle={pageSettings.title}
          onAddSection={addSection}
          isSaving={isSaving}
          saveSuccess={saveSuccess}
          saveError={saveError}
          onSave={savePageLayout}
        />

        <StatusMessages
          saveSuccess={saveSuccess}
          saveError={saveError}
          loadError={loadError}
          usedFallback={false}
          pageType={pageData.page_type}
        />

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {sections.map((section) => (
                <SectionArea
                  key={section.id}
                  section={section}
                  isSelected={selectedSection === section.id}
                  onSelect={() => setSelectedSection(section.id)}
                  onAddRow={() => addRowToSection(section.id)}
                  onDuplicate={() => duplicateSection(section.id)}
                  onDelete={() => deleteSection(section.id)}
                  canDelete={sections.length > 1}
                  onAddModule={addModuleToColumn}
                  onRemoveModule={removeModuleFromColumn}
                  onReorderModules={reorderModulesInColumn}
                  onDuplicateRow={duplicateRow}
                  onDeleteRow={deleteRow}
                  onChangeRowLayout={changeRowLayout}
                  onUpdateRows={updateSectionRows}
                  onUpdateRowSettings={updateRowSettings}
                  onUpdateRowStyle={updateRowStyle}
                  onOpenModuleLibrary={openModuleLibrary}
                  onOpenBlocksPopup={openBlocksPopup}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>{dragOverlayContent}</DragOverlay>
        </DndContext>

        <ModuleLibrary
          isOpen={moduleLibraryState.isOpen}
          onClose={closeModuleLibrary}
          onSelectModule={handleModuleSelect}
          availableModules={AVAILABLE_MODULES}
          availableBlocks={availableBlocks}
          availableForms={avaiavailableForms}
        />

        <BlocksPopup
          isOpen={blocksPopupState.isOpen}
          onClose={closeBlocksPopup}
          onSelectBlock={handleBlockSelect}
        />
      </div>
    </div>
  );
}
