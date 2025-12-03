import { useCallback } from "react";
import { Section, Row, Column } from "@/types";

interface UseSectionManagementProps {
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  generateId: (prefix: string) => string;
}

/**
 * Hook to manage section and row operations
 */
export function useSectionManagement({
  setSections,
  generateId,
}: UseSectionManagementProps) {
  const addSection = useCallback(() => {
    const newSection: Section = {
      id: generateId("section"),
      name: "New Section",
      type: "custom",
      style: {
        backgroundColor: "#ffffff",
        backgroundImage: undefined,
        padding: { top: "30px", right: "30px", bottom: "30px", left: "30px" },
        margin: { top: "0px", right: "0px", bottom: "20px", left: "0px" },
      },
      rows: [
        {
          id: generateId("row"),
          style: {
            backgroundColor: "transparent",
            padding: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
            margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
          },
          columns: [{ 
            id: generateId("col"), 
            width: 100, 
            style: {
              backgroundColor: "transparent",
              padding: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
            },
            modules: [] 
          }],
        },
      ],
    };
    setSections((prev) => [...prev, newSection]);
  }, [setSections, generateId]);

  const duplicateSection = useCallback(
    (sectionId: string) => {
      setSections((prevSections) => {
        const section = prevSections.find((s) => s.id === sectionId);
        if (!section) return prevSections;

        const newSection: Section = {
          ...section,
          id: generateId("section"),
          name: `${section.name} Copy`,
          rows: section.rows.map((row) => ({
            ...row,
            id: generateId("row"),
            columns: row.columns.map((col) => ({
              ...col,
              id: generateId("col"),
            })),
          })),
        };

        const index = prevSections.findIndex((s) => s.id === sectionId);
        return [
          ...prevSections.slice(0, index + 1),
          newSection,
          ...prevSections.slice(index + 1),
        ];
      });
    },
    [setSections, generateId]
  );

  const deleteSection = useCallback(
    (sectionId: string) => {
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    },
    [setSections]
  );

  const addRowToSection = useCallback(
    (sectionId: string) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          const newRow: Row = {
            id: generateId("row"),
            style: {
              backgroundColor: "transparent",
              padding: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
              margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
            },
            columns: [{ 
              id: generateId("col"), 
              width: 100, 
              style: {
                backgroundColor: "transparent",
                padding: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
              },
              modules: [] 
            }],
          };

          return { ...section, rows: [...section.rows, newRow] };
        })
      );
    },
    [setSections, generateId]
  );

  const updateSectionRows = useCallback(
    (sectionId: string, newRows: Row[]) => {
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === sectionId ? { ...section, rows: newRows } : section
        )
      );
    },
    [setSections]
  );

  const duplicateRow = useCallback(
    (sectionId: string, rowId: string) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          const rowIndex = section.rows.findIndex((r) => r.id === rowId);
          if (rowIndex === -1) return section;

          const originalRow = section.rows[rowIndex];
          const newRow: Row = {
            id: generateId("row"),
            style: originalRow.style || {
              backgroundColor: "transparent",
              padding: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
              margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
            },
            columns: originalRow.columns.map((col) => ({
              id: generateId("col"),
              width: col.width,
              style: col.style || {
                backgroundColor: "transparent",
                padding: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
              },
              modules: [...col.modules],
            })),
          };

          const newRows = [...section.rows];
          newRows.splice(rowIndex + 1, 0, newRow);

          return { ...section, rows: newRows };
        })
      );
    },
    [setSections, generateId]
  );

  const deleteRow = useCallback(
    (sectionId: string, rowId: string) => {
      setSections((prevSections) =>
        prevSections.map((section) =>
          section.id === sectionId
            ? {
                ...section,
                rows: section.rows.filter((row) => row.id !== rowId),
              }
            : section
        )
      );
    },
    [setSections]
  );

  const changeRowLayout = useCallback(
    (sectionId: string, rowId: string, newLayout: number[]) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;

              const newColumns: Column[] = newLayout.map((width, index) => {
                const existingColumn = row.columns[index];
                return {
                  id: existingColumn?.id || generateId(`col-${index}`),
                  width,
                  style: existingColumn?.style || {
                    backgroundColor: "transparent",
                    padding: { top: "10px", right: "10px", bottom: "10px", left: "10px" },
                  },
                  modules: existingColumn?.modules || [],
                };
              });

              return { ...row, columns: newColumns };
            }),
          };
        })
      );
    },
    [setSections, generateId]
  );

  const updateRowSettings = useCallback(
    (sectionId: string, rowId: string, settings: any) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;
              return { ...row, settings };
            }),
          };
        })
      );
    },
    [setSections]
  );

  const updateRowStyle = useCallback(
    (sectionId: string, rowId: string, style: any) => {
      setSections((prevSections) =>
        prevSections.map((section) => {
          if (section.id !== sectionId) return section;

          return {
            ...section,
            rows: section.rows.map((row) => {
              if (row.id !== rowId) return row;
              return { ...row, style: { ...row.style, ...style } };
            }),
          };
        })
      );
    },
    [setSections]
  );

  return {
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
  };
}
