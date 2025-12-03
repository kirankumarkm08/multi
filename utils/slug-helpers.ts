import { apiFetch } from "@/lib/api-config";

export interface SlugInfo {
  slug: string;
  page_type: string;
  title: string;
}

export class SlugService {
  // Get all published pages slugs (for sitemap or static generation)
  static async getAllPublishedSlugs(): Promise<SlugInfo[]> {
    try {
      const response = await apiFetch('/guest/pages/published-slugs', {
        method: 'GET'
      });
      
      return response.data || [];
    } catch (error) {
      console.error('Error fetching slugs:', error);
      return [];
    }
  }

  // Get specific page by slug
  static async getPageBySlug(slug: string) {
    try {
      const response = await apiFetch(`/guest/pages/${slug}`, {
        method: 'GET'
      });
      
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching page ${slug}:`, error);
      return null;
    }
  }

  // Get related page slugs (like login/register pairs)
  static async getRelatedSlugs(pageType: string): Promise<string[]> {
    try {
      const response = await apiFetch(`/guest/pages/related/${pageType}`, {
        method: 'GET'
      });
      
      return response.data || [];
    } catch (error) {
      console.error(`Error fetching related slugs for ${pageType}:`, error);
      return [];
    }
  }
}
