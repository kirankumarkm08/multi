/**
 * Hook for managing builder interactions: drag & drop, modals, handlers
 * Keeps interaction logic separate and testable
 */

import { useState, useCallback, useMemo, ReactNode } from "react";
import { DragEndEvent, DragStartEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Section, Module, TargetColumn } from "@/types";
import { createBlockModule } from "@/lib/page-builder/helpers";
import { toast } from "@/hooks/use-toast";

export interface ModuleLibraryState {
  isOpen: boolean;
  targetColumn?: TargetColumn;
}

export interface BlocksPopupState {
  isOpen: boolean;
  targetColumn?: TargetColumn;
}

export interface BuilderInteractionState {
  activeId: string | null;
  moduleLibraryState: ModuleLibraryState;
  blocksPopupState: BlocksPopupState;
}

export interface BuilderInteractionActions {
  // Module Library
  openModuleLibrary: (targetColumn?: TargetColumn) => void;
  closeModuleLibrary: () => void;
  handleModuleSelect: (module: Module, addModuleToColumn: Function) => void;

  // Blocks Popup
  openBlocksPopup: (targetColumn?: TargetColumn) => void;
  closeBlocksPopup: () => void;
  handleBlockSelect: (block: any, addModuleToColumn: Function) => void;

  // Drag & Drop
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent, setSections: Function) => void;
  getActiveSectionForDragOverlay: (sections: Section[]) => Section | null;
}

export function useBuilderInteraction(): [
  BuilderInteractionState,
  BuilderInteractionActions
] {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [moduleLibraryState, setModuleLibraryState] =
    useState<ModuleLibraryState>({
      isOpen: false,
      targetColumn: undefined,
    });
  const [blocksPopupState, setBlocksPopupState] = useState<BlocksPopupState>({
    isOpen: false,
    targetColumn: undefined,
  });

  // Module Library Management
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

  // Blocks Popup Management
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

  // Module Selection
  const handleModuleSelect = useCallback(
    (module: Module, addModuleToColumn: Function) => {
      if (!module?.id) {
        console.error("Invalid module selected");
        toast({
          title: "Error",
          description: "Invalid module selected",
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
    [moduleLibraryState.targetColumn, closeModuleLibrary]
  );

  // Block Selection
  const handleBlockSelect = useCallback(
    (block: any, addModuleToColumn: Function) => {
      if (!block?.id) {
        console.error("Invalid block selected");
        toast({
          title: "Error",
          description: "Invalid block selected",
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
    [blocksPopupState.targetColumn, closeBlocksPopup]
  );

  // Drag & Drop Handlers
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent, setSections: Function) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        setActiveId(null);
        return;
      }

      setSections((prevSections: Section[]) => {
        const activeIndex = prevSections.findIndex((s) => s.id === active.id);
        const overIndex = prevSections.findIndex((s) => s.id === over.id);

        if (
          activeIndex !== -1 &&
          overIndex !== -1 &&
          activeIndex !== overIndex
        ) {
          return arrayMove(prevSections, activeIndex, overIndex);
        }
        return prevSections;
      });

      setActiveId(null);
    },
    []
  );

  // Drag Overlay Content
  const getActiveSectionForDragOverlay = useCallback(
    (sections: Section[]): Section | null => {
      if (!activeId) return null;
      return sections.find((s) => s.id === activeId) || null;
    },
    [activeId]
  );

  const state: BuilderInteractionState = {
    activeId,
    moduleLibraryState,
    blocksPopupState,
  };

  const actions: BuilderInteractionActions = {
    openModuleLibrary,
    closeModuleLibrary,
    handleModuleSelect,
    openBlocksPopup,
    closeBlocksPopup,
    handleBlockSelect,
    handleDragStart,
    handleDragEnd,
    getActiveSectionForDragOverlay,
  };

  return [state, actions];
}
