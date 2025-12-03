import { Module, PageData, PageSettings, Section } from "@/types";

/**
 * Creates a module from a block
 */
export function createBlockModule(block: any): Module {
  return {
    id: `block-${block.id}`,
    name: block.name || "Custom Block",
    description: block.description || "",
    icon: "📦",
    category: "blocks",
    blockId: block.id,
    defaultProps: {
      content: block.content,
      content_type: block.content_type,
    },
  };
}

/**
 * Extracts layout JSON from page data
 */
export function extractLayoutFromPageData(pageData: PageData): string | null {
  if (pageData.page_layout?.layout_json) {
    return pageData.page_layout.layout_json;
  }
  if (pageData.layout_json) {
    return pageData.layout_json;
  }
  return null;
}

/**
 * Parses layout JSON string to sections array
 */
export function parseLayoutJson(layoutJson: string): Section[] {
  try {
    const parsed = typeof layoutJson === 'string' ? JSON.parse(layoutJson) : layoutJson;

    // Handle different JSON structures
    if (Array.isArray(parsed)) {
      return ensureStylesInSections(parsed);
    }

    if (parsed.sections && Array.isArray(parsed.sections)) {
      return ensureStylesInSections(parsed.sections);
    }

    console.warn("Unexpected layout JSON structure:", parsed);
    return [];
  } catch (error) {
    console.error("Error parsing layout JSON:", error);
    return [];
  }
}

/**
 * Ensures all sections, rows, and columns have style objects
 * Also migrates old 'settings' data to 'style' for backward compatibility
 */
function ensureStylesInSections(sections: Section[]): Section[] {
  return sections.map(section => ({
    ...section,
    style: section.style || {},
    rows: section.rows.map(row => {
      // Migrate old settings to style if style is empty
      const rowStyle = row.style && Object.keys(row.style).length > 0 
        ? row.style 
        : (row.settings || {});
      
      return {
        ...row,
        style: rowStyle,
        columns: row.columns.map(column => ({
          ...column,
          style: column.style || {}
        }))
      };
    })
  }));
}

/**
 * Creates page payload for API submission
 */
export function createPagePayload(
  pageSettings: PageSettings,
  pageData: PageData,
  sections: Section[]
): PageData {
  const layoutJson = JSON.stringify({
    sections: sections,
    meta: {
      isCustomPage: true,
      pageType: "custom",
      version: "2.0" // New version with styling support
    }
  });

  return {
    ...pageData,
    title: pageSettings.title,
    slug: pageSettings.slug,
    status: pageSettings.status,
    meta_description: pageSettings.meta_description || '',
    meta_keywords: pageSettings.meta_keywords || '',
    layout_json: layoutJson,
  };
}
