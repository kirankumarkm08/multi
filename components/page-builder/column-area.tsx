"use client";

import { useState } from "react";
import { Settings, Plus, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ModuleInstance } from "./module-instance";
import { StyleEditor } from "./style-editor";
import { Column, Module } from "@/types/pagebuilder";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StylingPanel } from "./styling-panel";
import { stylingToCSS } from "@/lib/page-builder/styling-helpers";

interface ColumnAreaProps {
  sectionId: string;
  rowId: string;
  column: Column;
  onAddModule: (sectionId: string, rowId: string, columnId: string, module: Module) => void;
  onRemoveModule: (sectionId: string, rowId: string, columnId: string, moduleIndex: number) => void;
  onReorderModules: (sectionId: string, rowId: string, columnId: string, fromIndex: number, toIndex: number) => void;
  onStyleChange: (style: any) => void;
  onOpenModuleLibrary: (targetColumn?: {
    sectionId: string;
    rowId: string;
    columnId: string;
  }) => void;
  onOpenBlocksPopup?: (targetColumn?: {
    sectionId: string;
    rowId: string;
    columnId: string;
  }) => void;
}

export function ColumnArea({
  sectionId,
  rowId,
  column,
  onAddModule,
  onRemoveModule,
  onReorderModules,
  onStyleChange,
  onOpenModuleLibrary,
  onOpenBlocksPopup,
}: ColumnAreaProps) {
  const [showStyleEditor, setShowStyleEditor] = useState(false);
  const [showStylingDialog, setShowStylingDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const { isOver, setNodeRef } = useDroppable({
    id: `${sectionId}-${rowId}-${column.id}`,
    data: {
      type: "column",
      sectionId,
      rowId,
      columnId: column.id,
    },
  });

  const columnStyle = stylingToCSS(column.styling);

  const handleAddModule = () => {
    onOpenModuleLibrary({
      sectionId,
      rowId,
      columnId: column.id,
    });
  };

  return (
    <div 
      ref={setNodeRef}
      className={cn(
        "group/col relative min-h-[100px] flex flex-col rounded border-2 border-dashed transition-all",
        isOver
          ? "border-primary bg-primary/10 scale-[1.01]"
          : "border-muted-foreground/20 hover:border-primary/50",
        isHovered && "ring-1 ring-primary/20"
      )}
      style={columnStyle}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50 dark:bg-gray-800/50 rounded-t opacity-0 group-hover/col:opacity-100 transition-opacity absolute top-0 left-0 right-0 z-10">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Column ({Math.round(column.width)}%)</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowStylingDialog(true);
            }}
            title="Edit styling"
          >
            <Palette className="h-3 w-3" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              setShowStyleEditor(!showStyleEditor);
            }}
          >
            <Settings className="h-3 w-3" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAddModule();
            }}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Style Editor (Old) */}
      {showStyleEditor && (
        <div className="absolute top-8 right-0 z-50 shadow-xl">
          <StyleEditor
            target="column"
            style={column.style || {}}
            onStyleChange={onStyleChange}
            onClose={() => setShowStyleEditor(false)}
          />
        </div>
      )}

      {/* New Styling Dialog */}
      <Dialog open={showStylingDialog} onOpenChange={setShowStylingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Column Styling</DialogTitle>
          </DialogHeader>
          <StylingPanel
            styling={column.styling}
            onChange={(styling) => onStyleChange(styling)}
            type="column"
            onClose={() => setShowStylingDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modules */}
      <div className="flex-1 p-3 pt-8 space-y-2">
        {column.modules.length === 0 ? (
          <div 
            className="h-full min-h-[80px] flex flex-col items-center justify-center text-center cursor-pointer"
            onClick={handleAddModule}
          >
            <Plus className="h-5 w-5 text-muted-foreground mb-1" />
            <span className="text-xs text-muted-foreground">Add Module</span>
          </div>
        ) : (
          <SortableContext
            items={column.modules.map((m, i) => `${m.id}-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            {column.modules.map((module, index) => (
              <ModuleInstance
                key={`${module.id}-${index}`}
                id={`${module.id}-${index}`}
                module={module}
                index={index}
                onRemove={() => onRemoveModule(sectionId, rowId, column.id, index)}
              />
            ))}
          </SortableContext>
        )}
      </div>
    </div>
  );
}
