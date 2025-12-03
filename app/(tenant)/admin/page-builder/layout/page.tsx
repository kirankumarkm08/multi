"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { BuilderCanvas } from "@/components/page-builder/builder-canvas";
import { pagesService } from "@/services/pages.service";
import { toast } from "sonner";
import { PageSettingsSidebar, PAGE_SETTINGS_PRESETS } from "@/components/page-builder/components/page-settings-sidebar";

type PageStatus = "draft" | "published" | "archived";

interface PageSettings {
  title: string;
  slug: string;
  status: PageStatus;
  meta_description: string;
  meta_keywords: string;
}

interface PageData {
  id?: number;
  title: string;
  slug?: string;
  status: PageStatus;
  meta_description?: string;
  meta_keywords?: string | string[];
  page_layout?: {
    layout_json: string;
  };
  page_type?: string;
  [key: string]: any;
}

const DEFAULT_PAGE_SETTINGS: PageSettings = {
  title: "Landing Page",
  slug: "landing",
  status: "draft",
  meta_description: "Main landing page for your website",
  meta_keywords: "",
};

function parseLayoutJSON(
  layoutJson: string | undefined
): Record<string, any> | null {
  if (!layoutJson) return null;
  try {
    let layout = JSON.parse(layoutJson);
    if (typeof layout === "string") {
      layout = JSON.parse(layout);
    }
    return layout;
  } catch (err) {
    console.warn("Error parsing layout JSON:", err);
    return null;
  }
}

export default function LandingPageBuilderPage() {
  const [pageId, setPageId] = useState<number | null>(null);
  const [pageSettings, setPageSettings] = useState<PageSettings>(
    DEFAULT_PAGE_SETTINGS
  );
  const [isLoading, setIsLoading] = useState(true);
  const [initialPageData, setInitialPageData] = useState<
    (PageData & { parsedLayout: Record<string, any> | null }) | null
  >(null);

  useEffect(() => {
    loadLandingPage();
  }, []);

  const loadLandingPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const latestPageResponse = await pagesService.getLatestLandingPageId();

      if (latestPageResponse.success && latestPageResponse.data) {
        await loadPageData(latestPageResponse.data);
      } else {
        toast.info("No landing page exists. Create one to get started.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error loading landing page:", error);
      toast.error("Failed to load landing page");
      setIsLoading(false);
    }
  }, []);

  const loadPageData = useCallback(async (id: number) => {
    try {
      const response = await pagesService.getPage(id);

      if (response.success && response.data) {
        const pageData: PageData = response.data.data || response.data;
        setPageId(id);

        // Parse meta keywords
        const metaKeywords = Array.isArray(pageData.meta_keywords)
          ? pageData.meta_keywords.join(", ")
          : pageData.meta_keywords || "";

        // Parse and handle layout JSON
        const layout = parseLayoutJSON(pageData.page_layout?.layout_json);

        setPageSettings({
          title: pageData.title || "Landing Page",
          slug: pageData.slug || "landing",
          status: pageData.status || "draft",
          meta_description: pageData.meta_description || "",
          meta_keywords: metaKeywords,
        });

        setInitialPageData({
          ...pageData,
          parsedLayout: layout,
        });
      } else {
        throw new Error(response.error || "Failed to load page data");
      }
    } catch (error: any) {
      console.error("Error loading page data:", error);
      toast.error(error.message || "Failed to load page data");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSettingsChange = useCallback((updates: Partial<PageSettings>) => {
    setPageSettings((prev) => ({ ...prev, ...updates }));
  }, []);

  const statusBadgeVariant = useMemo(() => {
    switch (pageSettings.status) {
      case "published":
        return "default";
      case "archived":
        return "destructive";
      default:
        return "outline";
    }
  }, [pageSettings.status]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading landing page...</p>
        </div>
      </div>
    );
  }

  // Show create landing page option if none exists

  return (
    <div className="min-h-screen">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Landing Page Builder</h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary">Drag & Drop Builder</Badge>
                <Badge
                  variant={
                    pageSettings.status === "published"
                      ? "default"
                      : pageSettings.status === "archived"
                      ? "destructive"
                      : "outline"
                  }
                >
                  {pageSettings.status.charAt(0).toUpperCase() +
                    pageSettings.status.slice(1)}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="flex gap-6">
          {/* Sidebar Settings */}
          <PageSettingsSidebar
            config={PAGE_SETTINGS_PRESETS.landingPage}
            values={pageSettings}
            onChange={handleSettingsChange}
          />

          {/* Builder Canvas */}
          <div className="flex-1">
            {initialPageData ? (
              <BuilderCanvas
                pageId={pageId || undefined}
                pageType="landing"
                initialPageData={initialPageData as any}
                externalPageSettings={pageSettings}
                onPageSettingsChange={handleSettingsChange}
              />
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-muted-foreground text-center">
                    No landing page data available
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
