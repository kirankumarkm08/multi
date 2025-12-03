"use client";

import { useState } from "react";
import { Settings, Copy, Trash2, Layout, GripVertical, MoreVertical, Columns, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ColumnArea } from "./column-area";
import { RowOptionsModal } from "./row-options-modal";
import { Row, Column, Module } from "@/types/pagebuilder";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StylingPanel } from "./styling-panel";
import { stylingToCSS } from "@/lib/page-builder/styling-helpers";

interface RowAreaProps {
  sectionId: string;
  row: Row;
  isLast: boolean;
  canDelete: boolean;
  onAddModule: (sectionId: string, rowId: string, columnId: string, module: Module) => void;
  onRemoveModule: (sectionId: string, rowId: string, columnId: string, moduleIndex: number) => void;
  onReorderModules: (sectionId: string, rowId: string, columnId: string, fromIndex: number, toIndex: number) => void;
  onDuplicateRow: (sectionId: string, rowId: string) => void;
  onDeleteRow: (sectionId: string, rowId: string) => void;
  onChangeRowLayout: (sectionId: string, rowId: string, newLayout: number[]) => void;
  onUpdateRowSettings: (sectionId: string, rowId: string, settings: any) => void;
  onUpdateRowStyle: (sectionId: string, rowId: string, style: any) => void;
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

const columnLayouts = [
  { name: "1 Column", columns: [100] },
  { name: "2 Columns", columns: [50, 50] },
  { name: "3 Columns", columns: [33.33, 33.33, 33.33] },
  { name: "4 Columns", columns: [25, 25, 25, 25] },
  { name: "2/3 + 1/3", columns: [66.67, 33.33] },
  { name: "1/3 + 2/3", columns: [33.33, 66.67] },
  { name: "1/4 + 3/4", columns: [25, 75] },
  { name: "3/4 + 1/4", columns: [75, 25] },
];

export function RowArea({
  sectionId,
  row,
  isLast,
  canDelete,
  onAddModule,
  onRemoveModule,
  onReorderModules,
  onDuplicateRow,
  onDeleteRow,
  onChangeRowLayout,
  onUpdateRowSettings,
  onUpdateRowStyle,
  onOpenModuleLibrary,
  onOpenBlocksPopup,
}: RowAreaProps) {
  const [showRowOptions, setShowRowOptions] = useState(false);
  const [showStylingDialog, setShowStylingDialog] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [layoutDropdownOpen, setLayoutDropdownOpen] = useState(false);
  const [actionsDropdownOpen, setActionsDropdownOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: row.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const changeColumnLayout = (layout: number[]) => {
    onChangeRowLayout(sectionId, row.id, layout);
  };

  const getCurrentLayoutName = () => {
    const currentWidths = row.columns.map((col) => Math.round(col.width));
    const layout = columnLayouts.find(
      (layout) =>
        layout.columns.length === currentWidths.length &&
        layout.columns.every(
          (width, index) =>
            Math.abs(Math.round(width) - currentWidths[index]) <= 1
        )
    );
    return layout?.name || "Custom";
  };

  const handleStyleChange = (newStyle: any) => {
    onUpdateRowStyle(sectionId, row.id, newStyle);
  };

  const rowCSS = stylingToCSS(row.styling);

  return (
    <>
      <div
        ref={setNodeRef}
        style={{ ...style, ...rowCSS }}
        className={cn(
          "group relative border border-dashed border-muted-foreground/20 rounded-md p-3 transition-all bg-white dark:bg-gray-900",
          isHovered && "border-primary/50 bg-primary/5",
          isDragging && "opacity-50 scale-95"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={(e) => e.stopPropagation()}
      >
				{/* Row Header */}
        <div className="flex items-center justify-between mb-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 flex-1">
            <div
              className="flex items-center gap-2 cursor-move rounded p-1 -m-1 hover:bg-accent/10"
              {...attributes}
              {...listeners}
            >
              <GripVertical className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                Row • {row.columns.length} column{row.columns.length !== 1 ? "s" : ""} • {getCurrentLayoutName()}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1">
             <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowStylingDialog(true);
              }}
              title="Edit styling"
            >
              <Palette className="h-3 w-3" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setLayoutDropdownOpen(!layoutDropdownOpen);
                }}
              >
                <Columns className="h-3 w-3" />
              </Button>

              {layoutDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
                  onMouseLeave={() => setLayoutDropdownOpen(false)}
                >
                  <div className="px-2 py-1 text-xs font-medium text-muted-foreground border-b border-gray-200 dark:border-gray-700">
                    Column Layouts
                  </div>
                  <div className="py-1">
                    {columnLayouts.map((layout) => {
                      const isCurrent = getCurrentLayoutName() === layout.name;
                      return (
                        <button
                          key={layout.name}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between",
                            isCurrent && "bg-gray-100 dark:bg-gray-700"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            changeColumnLayout(layout.columns);
                            setLayoutDropdownOpen(false);
                          }}
                        >
                          <span>{layout.name}</span>
                          {isCurrent && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              ✓
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setShowRowOptions(true);
              }}
            >
              <Settings className="h-3 w-3" />
            </Button>

            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  setActionsDropdownOpen(!actionsDropdownOpen);
                }}
              >
                <MoreVertical className="h-3 w-3" />
              </Button>

              {actionsDropdownOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50"
                  onMouseLeave={() => setActionsDropdownOpen(false)}
                >
                  <div className="py-1">
                    <button
                      className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDuplicateRow(sectionId, row.id);
                        setActionsDropdownOpen(false);
                      }}
                    >
                      <Copy className="h-3 w-3 mr-2" />
                      Duplicate Row
                    </button>
                    {canDelete && (
                      <button
                        className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center text-red-600 dark:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteRow(sectionId, row.id);
                          setActionsDropdownOpen(false);
                        }}
                      >
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete Row
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Row Options Modal (Old) */}
        <RowOptionsModal
          open={showRowOptions}
          onOpenChange={setShowRowOptions}
          rowId={row.id}
          sectionId={sectionId}
          currentSettings={row.style}
          onSave={handleStyleChange}
          onDelete={() => onDeleteRow(sectionId, row.id)}
          onDuplicate={() => onDuplicateRow(sectionId, row.id)}
        />

        {/* New Styling Dialog */}
        <Dialog open={showStylingDialog} onOpenChange={setShowStylingDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Row Styling</DialogTitle>
            </DialogHeader>
            <StylingPanel
              styling={row.styling}
              onChange={(styling) => handleStyleChange(styling)}
              type="row"
              onClose={() => setShowStylingDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Columns */}
        <div
          className="grid gap-3"
          style={{
            gridTemplateColumns: row.columns
              .map((col) => `minmax(0, ${col.width}fr)`)
              .join(" "),
            gap: row.styling?.gap || row.style?.gap
          }}
        >
          {row.columns.map((column, index) => (
            <ColumnArea
              key={column.id}
              column={column}
              rowId={row.id}
              sectionId={sectionId}
              onAddModule={onAddModule}
              onRemoveModule={onRemoveModule}
              onReorderModules={onReorderModules}
              onStyleChange={(newStyle) => {
                 onUpdateRowSettings(sectionId, row.id, {
                   ...row.settings, 
                   columns: row.columns.map(c => c.id === column.id ? { ...c, styling: newStyle } : c)
                 });
              }}
              onOpenModuleLibrary={onOpenModuleLibrary}
              onOpenBlocksPopup={onOpenBlocksPopup}
            />
          ))}
        </div>
      </div>
    </>
  );
}
