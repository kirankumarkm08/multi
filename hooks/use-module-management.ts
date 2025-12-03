import { useCallback } from "react";
import { Section, Module } from "@/types";
import { arrayMove } from "@dnd-kit/sortable";

interface UseModuleManagementProps {
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  generateId: (prefix: string) => string;
}

/**
 * Hook to manage module operations (add, remove, reorder)
 */
export function useModuleManagement({
  setSections,
  generateId,
}: UseModuleManagementProps) {
  const addModuleToColumn = useCallback(
    (sectionId: string, rowId: string, columnId: string, module: Module) => {
      if (!sectionId || !rowId || !columnId || !module) {
        console.error("Invalid parameters for addModuleToColumn");
        return;
      }

      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;

              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id !== columnId) return column;

                  const newModule: Module = {
                    ...module,
                    id: generateId(`${module.id}`),
                  };

                  return {
                    ...column,
                    modules: [...column.modules, newModule],
                  };
                }),
              };
            }),
          };
        })
      );
    },
    [setSections, generateId]
  );

  const removeModuleFromColumn = useCallback(
    (
      sectionId: string,
      rowId: string,
      columnId: string,
      moduleIndex: number
    ) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;

              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id !== columnId) return column;

                  return {
                    ...column,
                    modules: column.modules.filter(
                      (_, index) => index !== moduleIndex
                    ),
                  };
                }),
              };
            }),
          };
        })
      );
    },
    [setSections]
  );

  const reorderModulesInColumn = useCallback(
    (
      sectionId: string,
      rowId: string,
      columnId: string,
      fromIndex: number,
      toIndex: number
    ) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;

              return {
                ...row,
                columns: row.columns.map((column) => {
                  if (column.id !== columnId) return column;

                  const newModules = arrayMove(
                    column.modules,
                    fromIndex,
                    toIndex
                  );
                  return { ...column, modules: newModules };
                }),
              };
            }),
          };
        })
      );
    },
    [setSections]
  );

  return {
    addModuleToColumn,
    removeModuleFromColumn,
    reorderModulesInColumn,
  };
}
