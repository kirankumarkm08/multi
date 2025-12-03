import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GripVertical,
  Settings,
  Trash2,
  Copy,
  MoreVertical,
  Rows,
  Plus,
} from "lucide-react";
import { RowArea } from "./row-area";
import { StyleEditor } from "./style-editor";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
} from "@dnd-kit/core";

import { Section, Row, Module } from "@/types/pagebuilder";

interface SectionAreaProps {
  section: Section;
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
    module: Module
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
  onChangeRowLayout: (sectionId: string, rowId: string, columns: any[]) => void;
  onUpdateRowSettings: (sectionId: string, rowId: string, settings: any) => void;
  onUpdateRowStyle: (sectionId: string, rowId: string, style: any) => void;
  onUpdateSectionStyle: (sectionId: string, style: any) => void;
  onOpenModuleLibrary: (
    sectionId: string,
    rowId: string,
    columnId: string
  ) => void;
  onOpenBlocksPopup: (
    sectionId: string,
    rowId: string,
    columnId: string
  ) => void;
  onReorderRows: (sectionId: string, activeId: string, overId: string) => void;
}

export function SectionArea({
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
  onUpdateRowSettings,
  onUpdateRowStyle,
  onUpdateSectionStyle,
  onOpenModuleLibrary,
  onOpenBlocksPopup,
  onReorderRows,
}: SectionAreaProps) {
  const [showStyleEditor, setShowStyleEditor] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  const rows = section.rows || [];

  const rowSensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  );

  const handleRowDragStart = (event: DragStartEvent) => {
    // Optional: Add logic if needed when drag starts
  };

  const handleRowDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      onReorderRows(section.id, active.id as string, over.id as string);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group transition-all duration-200",
        isSelected ? "ring-2 ring-blue-500 z-10" : "hover:ring-1 hover:ring-blue-300"
      )}
    >
      <Card className="p-4 bg-white border-gray-200 shadow-sm">
        {/* Section Header / Controls */}
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded text-gray-400"
            >
              <GripVertical size={16} />
            </div>
            <span className="text-sm font-medium text-gray-600">
              {section.name || "Section"}
            </span>
            <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 rounded-full">
              {section.type}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowStyleEditor(!showStyleEditor)}
              className={cn(
                "h-8 w-8 p-0",
                showStyleEditor ? "bg-blue-50 text-blue-600" : "text-gray-500"
              )}
            >
              <Settings size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDuplicate}
              className="h-8 w-8 p-0 text-gray-500 hover:text-blue-600"
            >
              <Copy size={14} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onAddRow}
              className="h-8 w-8 p-0 text-gray-500 hover:text-green-600"
            >
              <Plus size={14} />
            </Button>
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
              >
                <Trash2 size={14} />
              </Button>
            )}
          </div>
        </div>

        {/* Section Style Editor */}
        {showStyleEditor && (
          <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <h4 className="text-sm font-medium mb-3">Section Styles</h4>
            <StyleEditor
              target="Section"
              style={section.style || {}}
              onStyleChange={(newStyle) =>
                onUpdateSectionStyle(section.id, newStyle)
              }
              onClose={() => setShowStyleEditor(false)}
            />
          </div>
        )}

        {/* Section Content - Rows */}
        <DndContext
          sensors={rowSensors}
          collisionDetection={closestCenter}
          onDragStart={handleRowDragStart}
          onDragEnd={handleRowDragEnd}
        >
          <SortableContext
            items={rows.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {rows.map((row, index) => (
                <RowArea
                  key={row.id}
                  row={row}
                  sectionId={section.id}
                  isLast={index === rows.length - 1}
                  canDelete={rows.length > 1}
                  onAddModule={onAddModule}
                  onRemoveModule={onRemoveModule}
                  onReorderModules={onReorderModules}
                  onDuplicateRow={onDuplicateRow}
                  onDeleteRow={onDeleteRow}
                  onChangeRowLayout={onChangeRowLayout}
                  onUpdateRowSettings={onUpdateRowSettings}
                  onUpdateRowStyle={onUpdateRowStyle}
                  onOpenModuleLibrary={onOpenModuleLibrary}
                  onOpenBlocksPopup={onOpenBlocksPopup}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      </Card>
    </div>
  );
}
