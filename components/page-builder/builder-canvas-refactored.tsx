/**
 * Refactored BuilderCanvas Component
 * Now uses composable hooks for better maintainability and debuggability
 *
 * Structure:
 * - usePageBuilder: Main state and page operations
 * - useBuilderDataLoader: Blocks and forms loading
 * - useBuilderInteraction: Drag & drop and modal management
 * - Components: BuilderHeaderComponent, SectionRenderer, etc.
 */

"use client";

import { useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { GripVertical } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// Hooks
import {
  usePageBuilder,
  PageBuilderState,
  PageBuilderActions,
} from "@/hooks/use-page-builder";
import {
  useBuilderDataLoader,
  DataLoaderState,
  DataLoaderActions,
} from "@/hooks/use-builder-data-loader";
import {
  useBuilderInteraction,
  BuilderInteractionState,
  BuilderInteractionActions,
} from "@/hooks/use-builder-interaction";

// Components
import { BuilderHeaderComponent } from "./components/builder-header-component";
import { SectionRenderer } from "./components/section-renderer";
import { ModuleLibrary } from "./module-library";
import { BlocksPopup } from "./blocks-popup";
import { StatusMessages } from "./status-messages";
import Loading from "../common/Loading";

// Services & Constants
import { AVAILABLE_MODULES } from "@/constants/Modules";
import { DRAG_ACTIVATION_DISTANCE } from "@/lib/page-builder/constants";

// Types
import { BuilderCanvasProps, Section } from "@/types";

/**
 * Main BuilderCanvas Component
 * Orchestrates all builder functionality through composed hooks
 */
export function BuilderCanvas({
  pageId,
  pageType = "custom",
  initialPageData,
  externalPageSettings,
  onPageSettingsChange,
  onSaveSuccess,
  onSaveError,
}: BuilderCanvasProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Hooks
  const [pageBuilderState, pageBuilderActions] = usePageBuilder({
    pageId,
    pageType,
    initialPageData,
    onSaveSuccess,
    onSaveError,
  });

  const [dataLoaderState, dataLoaderActions] = useBuilderDataLoader();
  const [interactionState, interactionActions] = useBuilderInteraction();

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Section Management Hooks
  const sectionIds = useMemo(
    () => pageBuilderState.sections.map((s) => s.id),
    [pageBuilderState.sections]
  );

  // Initialize data on mount
  useEffect(() => {
    setIsMounted(true);
    dataLoaderActions.loadAvailableForms();
  }, [dataLoaderActions]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === "Escape" &&
        interactionState.moduleLibraryState.isOpen
      ) {
        interactionActions.closeModuleLibrary();
      }
      if ((event.ctrlKey || event.metaKey) && event.key === "m") {
        event.preventDefault();
        interactionActions.openModuleLibrary();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [interactionState.moduleLibraryState.isOpen, interactionActions]);

  // Module selection handlers
  const handleModuleSelect = useCallback(
    (module: any) => {
      interactionActions.handleModuleSelect(
        module,
        (sectionId: string, rowId: string, columnId: string, mod: any) => {
          // Module management logic here
          // This will be delegated to useModuleManagement hooks in the future
        }
      );
    },
    [interactionActions]
  );

  const handleBlockSelect = useCallback(
    (block: any) => {
      interactionActions.handleBlockSelect(
        block,
        (sectionId: string, rowId: string, columnId: string, mod: any) => {
          // Block handling logic here
        }
      );
    },
    [interactionActions]
  );

  // Drag overlay content
  const dragOverlayContent = useMemo(() => {
    if (!interactionState.activeId) return null;

    const activeSection = interactionState.moduleLibraryState.targetColumn
      ?.sectionId
      ? pageBuilderState.sections.find(
          (s) =>
            s.id === interactionState.moduleLibraryState.targetColumn?.sectionId
        )
      : null;

    if (!activeSection) return null;

    const iconMap: Record<any, string> = {
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
            <span className="text-lg">
              {iconMap[activeSection.type] || "📦"}
            </span>
            <span className="font-medium text-sm">{activeSection.name}</span>
          </div>
        </div>
      </div>
    );
  }, [
    interactionState.activeId,
    interactionState.moduleLibraryState,
    pageBuilderState.sections,
  ]);

  if (!isMounted || pageBuilderState.isLoading) {
    return <Loading />;
  }

  return (
    <div className="p-6 min-h-full">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <BuilderHeaderComponent
          pageType={pageBuilderState.pageData.page_type || pageType}
          pageTitle={pageBuilderState.pageData.title || "New Page"}
          isSaving={pageBuilderState.isSaving}
          saveSuccess={pageBuilderState.saveSuccess}
          saveError={pageBuilderState.saveError}
          onSave={pageBuilderActions.savePageLayout}
        />

        {/* Status Messages */}
        <StatusMessages
          saveSuccess={pageBuilderState.saveSuccess}
          saveError={pageBuilderState.saveError}
          loadError={pageBuilderState.loadError}
          pageType={pageBuilderState.pageData.page_type || pageType}
          usedFallback={false}
        />

        {/* Drag & Drop Canvas */}
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={interactionActions.handleDragStart}
          onDragEnd={(event) =>
            interactionActions.handleDragEnd(
              event,
              pageBuilderActions.setSections
            )
          }
        >
          <SortableContext
            items={sectionIds}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-4">
              {pageBuilderState.sections.map((section) => (
                <SectionRenderer
                  key={section.id}
                  section={section}
                  isSelected={pageBuilderState.selectedSection === section.id}
                  onSelect={() => pageBuilderActions.selectSection(section.id)}
                  onAddRow={() => {
                    /* TODO: Implement row addition */
                  }}
                  onDuplicate={() =>
                    pageBuilderActions.duplicateSection(section.id)
                  }
                  onDelete={() => pageBuilderActions.deleteSection(section.id)}
                  canDelete={pageBuilderState.sections.length > 1}
                  onAddModule={() => {
                    /* TODO: Implement module addition */
                  }}
                  onRemoveModule={() => {
                    /* TODO: Implement module removal */
                  }}
                  onReorderModules={() => {
                    /* TODO: Implement module reordering */
                  }}
                  onDuplicateRow={() => {
                    /* TODO: Implement row duplication */
                  }}
                  onDeleteRow={() => {
                    /* TODO: Implement row deletion */
                  }}
                  onChangeRowLayout={() => {
                    /* TODO: Implement layout change */
                  }}
                  onUpdateRows={() => {
                    /* TODO: Implement rows update */
                  }}
                  onOpenModuleLibrary={interactionActions.openModuleLibrary}
                  onOpenBlocksPopup={interactionActions.openBlocksPopup}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay>{dragOverlayContent}</DragOverlay>
        </DndContext>

        {/* Modals */}
        <ModuleLibrary
          isOpen={interactionState.moduleLibraryState.isOpen}
          onClose={interactionActions.closeModuleLibrary}
          onSelectModule={handleModuleSelect}
          availableModules={AVAILABLE_MODULES as any}
          availableBlocks={dataLoaderState.availableBlocks}
          availableForms={dataLoaderState.availableForms}
        />

        <BlocksPopup
          isOpen={interactionState.blocksPopupState.isOpen}
          onClose={interactionActions.closeBlocksPopup}
          onSelectBlock={handleBlockSelect}
        />
      </div>
    </div>
  );
}
