/**
 * SectionRenderer Component
 * Renders a single section with all its rows and modules
 * Extracted from BuilderCanvas for better testability and reusability
 */

import React from "react";
import { SectionArea } from "../section-area";

export interface SectionRendererProps {
  section: any;
  isSelected: boolean;
  onSelect: () => void;
  onAddRow: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onAddModule: (
    sectionId: string,
    rowId: string,
    columnId: string,
    module: any
  ) => void;
  onRemoveModule: (
    sectionId: string,
    rowId: string,
    columnId: string,
    moduleIndex: number
  ) => void;
  onReorderModules: (
    sectionId: string,
    rowId: string,
    columnId: string,
    fromIndex: number,
    toIndex: number
  ) => void;
  onDuplicateRow: (sectionId: string, rowId: string) => void;
  onDeleteRow: (sectionId: string, rowId: string) => void;
  onChangeRowLayout: (
    sectionId: string,
    rowId: string,
    layout: number[]
  ) => void;
  onUpdateRows: (sectionId: string, rows: any[]) => void;
  onOpenModuleLibrary: (targetColumn: any) => void;
  onOpenBlocksPopup: (targetColumn: any) => void;
}

export function SectionRenderer({
  section,
  isSelected,
  onSelect,
  onAddRow,
  onDuplicate,
  onDelete,
  canDelete,
  onAddModule,
  onRemoveModule,
  onReorderModules,
  onDuplicateRow,
  onDeleteRow,
  onChangeRowLayout,
  onUpdateRows,
  onOpenModuleLibrary,
  onOpenBlocksPopup,
}: SectionRendererProps) {
  return (
    <SectionArea
      section={section}
      isSelected={isSelected}
      onSelect={onSelect}
      onAddRow={onAddRow}
      onDuplicate={onDuplicate}
      onDelete={onDelete}
      canDelete={canDelete}
      onAddModule={onAddModule}
      onRemoveModule={onRemoveModule}
      onReorderModules={onReorderModules}
      onDuplicateRow={onDuplicateRow}
      onDeleteRow={onDeleteRow}
      onChangeRowLayout={onChangeRowLayout}
      onUpdateRows={onUpdateRows}
      onOpenModuleLibrary={onOpenModuleLibrary}
      onOpenBlocksPopup={onOpenBlocksPopup}
    />
  );
}
