import { Metadata } from "next";
import { startCase } from "lodash";
import { LandingPageData, TenantBranding } from "@/types/layout-types";

export function constructMetadata(
  landingPage: LandingPageData | undefined,
  tenantSettings: TenantBranding | undefined
): Metadata {
  if (!landingPage) {
    return {
      title: tenantSettings?.tenant_name || "Event Platform",
      description: "Welcome to our event platform",
    };
  }

  const title = landingPage.title ? startCase(landingPage.title) : "Event Platform";
  const description = landingPage.meta_description || "Welcome to our event platform";

  const metadata: Metadata = {
    title,
    description,
    keywords: landingPage.keywords_string || "",
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title,
      description,
      type: "website",
      siteName: tenantSettings?.tenant_name || title,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };

  if (tenantSettings?.favicon_url) {
    metadata.icons = {
      icon: tenantSettings.favicon_url,
      shortcut: tenantSettings.favicon_url,
      apple: tenantSettings.favicon_url,
    };
  }

  return metadata;
}
