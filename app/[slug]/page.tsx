import { serverApiFetch } from "@/lib/server-api";
import { DynamicPage } from "@/components/layout/dynamic-page";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import { startCase } from "lodash";
import { cache } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { DynamicPageData } from "@/types";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  if (!pageData) {
    return {
      title: "Page Not Found",
    };
  }

  return {
    title: pageData.title || startCase(slug),
    description: pageData.meta_description || "Default description",
    keywords: pageData.keywords_string || "",
    openGraph: {
      title: pageData.title || startCase(slug),
      description: pageData.meta_description || "Default description",
      type: "website",
    },
    icons: pageData.logo_url
      ? {
          icon: pageData.logo_url,
          shortcut: pageData.logo_url,
          apple: pageData.logo_url,
        }
      : undefined,
  };
}

// Cache the page data fetch
const getPageData = cache(async (slug: string): Promise<DynamicPageData | null> => {
  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const origin = `${protocol}://${host}`;

    // Fetch page by slug from API
    const response = await serverApiFetch(`/guest/pages/${slug}`, {
      headers: {
        Origin: origin,
      },
    });

    return response.data || null;
  } catch (error: any) {
    // If 404, return null (will trigger notFound)
    if (error?.status === 404) {
      console.log(`[Page Fetch] Page ${slug} not found`);
      return null;
    }
    
    console.error(`[Page Fetch] Error fetching page ${slug}:`, error);
    return null;
  }
});

// Generate static params for known page types (optional, for better performance)
export async function generateStaticParams() {
  try {
    // You can pre-fetch common slugs from API if you know them
    // Or return an empty array and rely on dynamic rendering
    return [];
  } catch (error) {
    console.error("[Static Params] Error generating static params:", error);
    return [];
  }
}

export default async function DynamicSlugPage({ params }: Props) {
  const { slug } = await params;
  const pageData = await getPageData(slug);

  // If no page data or page is not published, show 404
  if (!pageData || pageData.status !== "published") {
    return notFound();
  }

  const pageType = pageData.page_type;
  
  // Check if layout is valid
  const hasValidLayout = pageData.layout_json && 
    (() => {
      try {
        const layout = JSON.parse(pageData.layout_json);
        return Array.isArray(layout) || layout.default;
      } catch {
        return false;
      }
    })();

  // Check if form config exists
  const hasFormConfig = pageData.form_config;

  // Determine if we should render DynamicPage
  // Include any page that has either: layout, form config, or is a known page type
  const shouldRenderDynamicPage = 
    hasValidLayout || 
    hasFormConfig || 
    ["register", "login", "contact_us", "custom"].includes(pageType || "");

  if (shouldRenderDynamicPage) {
    return <DynamicPage slug={slug} pageData={pageData} />;
  }

  // Fallback for unsupported page types
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900/50">
      <Card className="max-w-md w-full border-none shadow-lg">
        <CardContent className="flex flex-col items-center text-center p-8">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6">
            <AlertCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-500" />
          </div>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Page Content Unavailable
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This page exists but doesn't have displayable content configured.
            It might be a system page or require backend configuration.
          </p>

          <div className="bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 mb-6 w-full">
            <p className="text-sm font-mono text-gray-500 dark:text-gray-400">
              Page Type: {pageType || "standard"}
            </p>
            <p className="text-sm font-mono text-gray-500 dark:text-gray-400 mt-1">
              Slug: {slug}
            </p>
          </div>

          <div className="flex gap-4 w-full">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/">Home Page</Link>
            </Button>
            {pageType === "login" && (
              <Button asChild className="flex-1">
                <Link href="/login">Go to Login</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
