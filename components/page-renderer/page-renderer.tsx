"use client";

import { useState, useEffect } from "react";
import { ModuleRenderer } from "./module-renderer";
import { PageRendererProps, PageLayout } from "@/types/pagerender";

export function PageRenderer({
  layoutId = "home-layout",
  className = "",
  landingPageData,
}: PageRendererProps) {
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadPageLayout();
  }, [layoutId, landingPageData]);
  
  console.log("page render landingPageData ", landingPageData);
  
  const loadPageLayout = () => {
    try {
      setLoading(true);
      setError(null);
      console.log("PageRenderer: Processing landing page data...");

      if (!landingPageData) {
        setError("No landing page data provided");
        return;
      }

      console.log(
        "PageRenderer: Using provided landing page data:",
        landingPageData
      );

      // Check if we have the expected data structure
      if (landingPageData.page_layout?.layout_json) {
        const layoutJsonString = landingPageData.page_layout.layout_json;
        console.log("Raw layout_json string:", layoutJsonString);

        try {
          const parsedLayout = JSON.parse(layoutJsonString);
          console.log("Parsed layout data:", parsedLayout);

          let sectionsArray;
          
          // Handle both old format (array) and new format (object with sections)
          if (Array.isArray(parsedLayout)) {
            // Old format: direct array of sections
            sectionsArray = parsedLayout;
          } else if (parsedLayout.sections && Array.isArray(parsedLayout.sections)) {
            // New format: object with sections property
            sectionsArray = parsedLayout.sections;
            console.log("Layout version:", parsedLayout.meta?.version);
          } else {
            console.error(
              "Parsed layout is not a valid format:",
              typeof parsedLayout,
              parsedLayout
            );
            throw new Error("Parsed layout_json is not an array of sections");
          }

          const pageLayoutData: PageLayout = {
            id: landingPageData.slug || "landing-page",
            name: landingPageData.title || "Landing Page",
            description: "Landing page layout",
            isHomeLayout: true,
            sections: sectionsArray,
            createdAt: landingPageData.created_at,
            updatedAt: landingPageData.updated_at,
          };

          console.log("Final page layout data:", pageLayoutData);
          setLayout(pageLayoutData);
        } catch (parseError) {
          console.error("Error parsing layout_json:", parseError);
          throw new Error("Invalid JSON in layout_json field");
        }
      } else {
        console.log("No valid landing page data found");
        setError("Missing layout_json in landing page data");
      }
    } catch (err: any) {
      console.error("Error processing page layout:", err);
      setError(`Failed to load page layout: ${err.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to convert style objects to CSS
  const convertStyleToCSS = (style: any): React.CSSProperties => {
    if (!style) return {};
    
    const css: React.CSSProperties = {};
    
    if (style.backgroundColor) css.backgroundColor = style.backgroundColor;
    if (style.backgroundImage) css.backgroundImage = `url(${style.backgroundImage})`;
    if (style.backgroundSize) css.backgroundSize = style.backgroundSize;
    if (style.backgroundPosition) css.backgroundPosition = style.backgroundPosition;
    if (style.border) css.border = style.border;
    if (style.borderRadius) css.borderRadius = style.borderRadius;
    if (style.boxShadow) css.boxShadow = style.boxShadow;
    if (style.minHeight) css.minHeight = style.minHeight;
    if (style.textAlign) css.textAlign = style.textAlign;
    if (style.gap) css.gap = style.gap;
    
    // Handle padding object
    if (style.padding) {
      if (typeof style.padding === 'object') {
        const { top = '0px', right = '0px', bottom = '0px', left = '0px' } = style.padding;
        css.padding = `${top} ${right} ${bottom} ${left}`;
      } else {
        css.padding = style.padding;
      }
    }
    
    // Handle margin object
    if (style.margin) {
      if (typeof style.margin === 'object') {
        const { top = '0px', right = '0px', bottom = '0px', left = '0px' } = style.margin;
        css.margin = `${top} ${right} ${bottom} ${left}`;
      } else {
        css.margin = style.margin;
      }
    }
    
    return css;
  };

  if (!layout || !layout.sections || layout.sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No page content available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${className} mx-auto  `}>
      {/* Render all sections */}
      {layout.sections.map((section, sectionIndex) => (
        <div
          key={section.id || `section-${sectionIndex}`}
          className={`
            ${section.type === "header" ? " " : ""}
            ${section.type === "footer" ? "bg-gray-50 mt-auto" : ""}
            ${sectionIndex > 0 ? "" : ""}
          `}
          id={`section-${section.id || sectionIndex}`}
          data-section-type={section.type}
          style={convertStyleToCSS(section.style)}
        >
          {/* Render all rows in section */}
          {section.rows &&
            section.rows.map((row, rowIndex) => (
              <div 
                key={row.id || `row-${rowIndex}`} 
                className="w-full"
                style={convertStyleToCSS(row.style)}
              >
                {/* Render columns in row */}
                <div className="flex flex-wrap -mx-2">
                  {row.columns &&
                    row.columns.map((column, columnIndex) => (
                      <div
                        key={column.id || `col-${columnIndex}`}
                        className="px-2"
                        style={{
                          ...convertStyleToCSS(column.style),
                          width:
                            row.columns.length > 1
                              ? `${column.width}%`
                              : "100%",
                          minWidth:
                            row.columns.length > 1
                              ? `${column.width}%`
                              : "100%",
                        }}
                      >
                        {/* Render all modules in column */}
                        {column.modules &&
                          column.modules.map((module, moduleIndex) => (
                            <div
                              key={module.id || `module-${moduleIndex}`}
                              className="mb-4 last:mb-0"
                            >
                              <ModuleRenderer module={module} />
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
}
