import { cache } from "react";
import { headers } from "next/headers";
import { apiFetch } from "./api-config";
import { LandingPageResponse, NavigationResponse, TenantBranding } from "@/types/layout-types";

/**
 * Fetches tenant branding information.
 * Cached for 1 hour to reduce API load.
 */
export const getTenantBranding = cache(async (): Promise<TenantBranding | null> => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.testjkl.in/api";
    const res = await fetch(`${baseUrl}/common/tenant/branding`, {
        next: { revalidate: 3600 } 
    });
    
    if (!res.ok) return null;
    const data = await res.json();
    return data?.data || data; // Handle potential wrapping
  } catch (error) {
    console.error("Failed to fetch tenant branding:", error);
    return null;
  }
});

/**
 * Fetches navigation structure and tenant settings.
 * Uses 'no-store' to ensure fresh navigation data on each request.
 */
export const getNavigationData = cache(async (): Promise<NavigationResponse | null> => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    const res = await fetch(`${baseUrl}/guest/pages/navigation`, {
      headers: { Origin: origin },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch (error) {
    console.error("Failed to fetch navigation data:", error);
    return null;
  }
});

/**
 * Fetches the landing page data for metadata generation.
 */
export const getLandingPageData = cache(async (): Promise<LandingPageResponse | null> => {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const origin = `${protocol}://${host}`;

  try {
     const response = await apiFetch("/guest/pages/type/landing", { origin });
     return response as LandingPageResponse;
  } catch (error) {
    console.error("Failed to fetch landing page data:", error);
    return null;
  }
});
