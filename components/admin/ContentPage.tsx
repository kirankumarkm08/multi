import { PageData } from "@/types";
import { Layout, Section } from "@/types/layout";
import { ModuleRenderer } from "@/components/page-renderer/module-renderer";
import { useState, useEffect } from "react";

interface ContentPageProps {
  pageData: PageData;
}

interface PreparedModule {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  defaultProps?: Record<string, any>;
  blockId?: string;
}

// Helper function to ensure module has all required properties
const prepareModuleForRenderer = (module: any): PreparedModule => ({
  id: module.id,
  name: module.name,
  description: module.description || "",
  icon: module.icon || "📄",
  category: module.category || "General",
  tags: module.tags || [],
  defaultProps: module.defaultProps,
  blockId: module.blockId?.toString(),
});

const renderSection = (section: Section, index: number) => (
  <div key={section.id || index} className={`section-${section.type}`}>
    {section.rows?.map((row, rowIndex) => (
      <div key={row.id || rowIndex} className="flex flex-wrap -mx-4">
        {row.columns?.map((column, colIndex) => (
          <div
            key={column.id || colIndex}
            style={{ width: `${column.width}%` }}
            className="px-4"
          >
            {column.modules?.map((module, moduleIndex) => (
              <ModuleRenderer
                key={module.id || moduleIndex}
                module={prepareModuleForRenderer(module)}
              />
            ))}
          </div>
        ))}
      </div>
    ))}
  </div>
);

export function ContentPage({ pageData }: ContentPageProps) {
  const [layout, setLayout] = useState<Layout | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!pageData) return;

    try {
      const layoutJson =
        pageData.page_layout?.layout_json || pageData.layout_json;

      if (!layoutJson) {
        setLayout(null);
        return;
      }

      // Parse the layout JSON if it's a string
      const parsedLayout =
        typeof layoutJson === "string" ? JSON.parse(layoutJson) : layoutJson;

      // Handle both array (old format) and object (new format)
      let sections = [];
      if (Array.isArray(parsedLayout)) {
        sections = parsedLayout;
      } else if (parsedLayout && Array.isArray(parsedLayout.sections)) {
        sections = parsedLayout.sections;
      } else {
        throw new Error("Invalid layout structure: root should be an array or object with sections array");
      }

      setLayout({ sections });
      setError(null);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to parse layout data";
      console.error("Error parsing layout:", err);
      setError(errorMessage);
      setLayout(null);
    }
  }, [pageData]);

  if (error) {
    return (
      <div className="text-red-500 p-4 border border-red-300 rounded">
        Error: {error}
      </div>
    );
  }

  if (!layout?.sections) {
    return (
      <div className="prose dark:prose-invert max-w-none">
        <h1>{pageData.title}</h1>
        {pageData.metadata?.description && (
          <p className="text-lg text-gray-600 dark:text-gray-400">
            {pageData.metadata.description}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-8">
      {layout.sections.map(renderSection)}
    </div>
  );
}
