import { useState, Dispatch, SetStateAction } from "react";
import { PageData, ExternalPageSettings, PageSettings } from "@/types";

/**
 * Hook to manage page settings state
 */
export function usePageSettings(
  initialPageData?: PageData,
  externalPageSettings?: ExternalPageSettings
): [PageSettings, Dispatch<SetStateAction<PageSettings>>] {
  const [pageSettings, setPageSettings] = useState<PageSettings>(() => {
    if (externalPageSettings) {
      return {
        title: externalPageSettings.title || "New Page",
        slug: externalPageSettings.slug || "new-page",
        status:
          (externalPageSettings.status as PageSettings["status"]) ||
          "published",
      };
    }
    if (initialPageData) {
      return {
        title: initialPageData.title || "New Page",
        slug: initialPageData.slug || "new-page",
        status: initialPageData.status || "published",
      };
    }
    return {
      title: "New Page",
      slug: "new-page",
      status: "published",
    };
  });

  return [pageSettings, setPageSettings];
}
