/**
 * Layout Management Service
 * Handles all layout-related operations for the page builder
 * Extracted from builder-canvas for better maintainability
 */

import { Section, Module, Row, Column } from "@/types";

// ============================================================================
// Layout Validation
// ============================================================================

export function isValidLayout(layout: any): boolean {
  return (
    layout &&
    typeof layout === "object" &&
    Array.isArray(layout.sections) &&
    layout.sections.every((section: any) => isValidSection(section))
  );
}

export function isValidSection(section: any): boolean {
  return (
    section &&
    typeof section === "object" &&
    typeof section.id === "string" &&
    typeof section.name === "string" &&
    Array.isArray(section.rows)
  );
}

export function isValidRow(row: any): boolean {
  return (
    row &&
    typeof row === "object" &&
    typeof row.id === "string" &&
    Array.isArray(row.columns)
  );
}

export function isValidColumn(column: any): boolean {
  return (
    column &&
    typeof column === "object" &&
    typeof column.id === "string" &&
    typeof column.width === "number" &&
    Array.isArray(column.modules)
  );
}

// ============================================================================
// Layout Transformations
// ============================================================================

/**
 * Convert layout JSON to sections array
 */
export function layoutJsonToSections(layoutJson: string): Section[] {
  try {
    let parsed = JSON.parse(layoutJson);
    if (typeof parsed === "string") {
      parsed = JSON.parse(parsed);
    }

    if (isValidLayout(parsed)) {
      return parsed.sections;
    }

    console.warn("Invalid layout structure", parsed);
    return [];
  } catch (error) {
    console.error("Error parsing layout JSON:", error);
    return [];
  }
}

/**
 * Convert sections array to layout JSON
 */
export function sectionsToLayoutJson(sections: Section[]): string {
  return JSON.stringify({
    sections,
    meta: {
      version: "1.0",
      updated_at: new Date().toISOString(),
    },
  });
}

/**
 * Deep clone a section to avoid mutations
 */
export function cloneSection(section: Section): Section {
  return JSON.parse(JSON.stringify(section));
}

/**
 * Deep clone a row to avoid mutations
 */
export function cloneRow(row: Row): Row {
  return JSON.parse(JSON.stringify(row));
}

/**
 * Deep clone a column to avoid mutations
 */
export function cloneColumn(column: Column): Column {
  return JSON.parse(JSON.stringify(column));
}

/**
 * Deep clone a module to avoid mutations
 */
export function cloneModule(module: Module): Module {
  return JSON.parse(JSON.stringify(module));
}

// ============================================================================
// Layout Structure Builders
// ============================================================================

/**
 * Create a new empty row with specified column count
 */
export function createRow(
  id: string,
  columnCount: number = 1,
  columnLayout?: number[]
): Row {
  const defaultLayout = Array(columnCount)
    .fill(0)
    .map(() => 100 / columnCount);
  const layout = columnLayout || defaultLayout;

  const columns: Column[] = layout.map((width, index) => ({
    id: `col-${id}-${index}`,
    width,
    modules: [] as Module[],
  }));

  return {
    id,
    columns,
  } as Row;
}

/**
 * Create a new empty column
 */
export function createColumn(width: number = 100): Column {
  return {
    id: `col-${Date.now()}`,
    width,
    modules: [],
  };
}

/**
 * Create a new section with default content
 */
export function createSection(
  name: string,
  type: Section["type"] = "content"
): Section {
  return {
    id: `section-${Date.now()}`,
    name,
    type,
    rows: [createRow(`row-${Date.now()}`)],
  };
}

// ============================================================================
// Layout Queries
// ============================================================================

/**
 * Find a section by ID
 */
export function findSection(
  sections: Section[],
  sectionId: string
): Section | undefined {
  return sections.find((s) => s.id === sectionId);
}

/**
 * Find a row within a section
 */
export function findRow(
  sections: Section[],
  sectionId: string,
  rowId: string
): Row | undefined {
  const section = findSection(sections, sectionId);
  return section?.rows.find((r) => r.id === rowId);
}

/**
 * Find a column within a row
 */
export function findColumn(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string
): Column | undefined {
  const row = findRow(sections, sectionId, rowId);
  return row?.columns.find((c) => c.id === columnId);
}

/**
 * Find a module in a column
 */
export function findModule(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string,
  moduleId: string
): Module | undefined {
  const column = findColumn(sections, sectionId, rowId, columnId);
  return column?.modules.find((m) => m.id === moduleId);
}

/**
 * Get index of a module in a column
 */
export function getModuleIndex(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string,
  moduleId: string
): number {
  const column = findColumn(sections, sectionId, rowId, columnId);
  return column?.modules.findIndex((m) => m.id === moduleId) ?? -1;
}

// ============================================================================
// Layout Calculations
// ============================================================================

/**
 * Calculate total width of columns in a row
 */
export function calculateRowTotalWidth(row: Row): number {
  return row.columns.reduce((sum, col) => sum + col.width, 0);
}

/**
 * Normalize column widths to sum to 100
 */
export function normalizeColumnWidths(row: Row): Row {
  const total = calculateRowTotalWidth(row);
  if (total === 0) return row;

  const normalized = cloneRow(row);
  normalized.columns = normalized.columns.map((col) => ({
    ...col,
    width: (col.width / total) * 100,
  }));

  return normalized;
}

/**
 * Get count of modules across all columns in a row
 */
export function countModulesInRow(row: Row): number {
  return row.columns.reduce((sum, col) => sum + col.modules.length, 0);
}

/**
 * Get count of modules across all rows in a section
 */
export function countModulesInSection(section: Section): number {
  return section.rows.reduce((sum, row) => sum + countModulesInRow(row), 0);
}

/**
 * Check if a section is empty
 */
export function isSectionEmpty(section: Section): boolean {
  return section.rows.every((row) => countModulesInRow(row) === 0);
}

// ============================================================================
// Layout Mutations (immutable updates)
// ============================================================================

/**
 * Add a module to a column
 */
export function addModuleToColumn(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string,
  module: Module
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;

            return {
              ...col,
              modules: [...col.modules, module],
            };
          }),
        };
      }),
    };
  });
}

/**
 * Remove a module from a column by module ID
 */
export function removeModuleFromColumn(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string,
  moduleId: string
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;

            return {
              ...col,
              modules: col.modules.filter((m) => m.id !== moduleId),
            };
          }),
        };
      }),
    };
  });
}

/**
 * Reorder modules within a column
 */
export function reorderModulesInColumn(
  sections: Section[],
  sectionId: string,
  rowId: string,
  columnId: string,
  fromIndex: number,
  toIndex: number
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== columnId) return col;

            const modules = [...col.modules];
            const [removed] = modules.splice(fromIndex, 1);
            modules.splice(toIndex, 0, removed);

            return {
              ...col,
              modules,
            };
          }),
        };
      }),
    };
  });
}

/**
 * Update column widths in a row
 */
export function updateColumnWidths(
  sections: Section[],
  sectionId: string,
  rowId: string,
  newLayout: number[]
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      rows: section.rows.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          layout: newLayout,
          columns: row.columns.map((col, index) => ({
            ...col,
            width: newLayout[index] || col.width,
          })),
        };
      }),
    };
  });
}

/**
 * Add a row to a section
 */
export function addRowToSection(
  sections: Section[],
  sectionId: string,
  columnCount?: number
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    const newRow = createRow(`row-${Date.now()}`, columnCount);
    return {
      ...section,
      rows: [...section.rows, newRow],
    };
  });
}

/**
 * Delete a row from a section
 */
export function deleteRowFromSection(
  sections: Section[],
  sectionId: string,
  rowId: string
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    return {
      ...section,
      rows: section.rows.filter((r) => r.id !== rowId),
    };
  });
}

/**
 * Duplicate a row in a section
 */
export function duplicateRowInSection(
  sections: Section[],
  sectionId: string,
  rowId: string
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;

    const rowToDuplicate = section.rows.find((r) => r.id === rowId);
    if (!rowToDuplicate) return section;

    const duplicated = cloneRow(rowToDuplicate);
    duplicated.id = `row-${Date.now()}`;
    duplicated.columns = duplicated.columns.map((col) => ({
      ...col,
      id: `col-${Date.now()}-${Math.random()}`,
    }));

    return {
      ...section,
      rows: [...section.rows, duplicated],
    };
  });
}

/**
 * Duplicate a section
 */
export function duplicateSection(
  sections: Section[],
  sectionId: string
): Section[] {
  const sectionToDuplicate = sections.find((s) => s.id === sectionId);
  if (!sectionToDuplicate) return sections;

  const duplicated = cloneSection(sectionToDuplicate);
  duplicated.id = `section-${Date.now()}`;
  duplicated.name = `${duplicated.name} (copy)`;
  duplicated.rows = duplicated.rows.map((row) => ({
    ...row,
    id: `row-${Date.now()}-${Math.random()}`,
    columns: row.columns.map((col) => ({
      ...col,
      id: `col-${Date.now()}-${Math.random()}`,
    })),
  }));

  const sectionIndex = sections.findIndex((s) => s.id === sectionId);
  const newSections = [...sections];
  newSections.splice(sectionIndex + 1, 0, duplicated);

  return newSections;
}

/**
 * Delete a section
 */
export function deleteSection(
  sections: Section[],
  sectionId: string
): Section[] {
  return sections.filter((s) => s.id !== sectionId);
}

/**
 * Update a section
 */
export function updateSection(
  sections: Section[],
  sectionId: string,
  updates: Partial<Section>
): Section[] {
  return sections.map((section) => {
    if (section.id !== sectionId) return section;
    return { ...section, ...updates };
  });
}
