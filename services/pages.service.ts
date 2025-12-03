// pages.service.ts - Add these methods
import { apiFetch } from "@/lib/api-config";

interface PageService {
  createPage(
    pageData: any
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  updatePage(
    pageId: number,
    pageData: any
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  getPage(
    pageId: number
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  getPagesByType(
    pageType: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  getPageBySlug(
    slug: string
  ): Promise<{ success: boolean; data?: any; error?: string }>;
  getAllPages(): Promise<{ success: boolean; data?: any; error?: string }>;
  getLatestLandingPageId(): Promise<{
    success: boolean;
    data?: number;
    error?: string;
  }>;
  deletePage(
    pageId: number
  ): Promise<{ success: boolean; data?: any; error?: string }>;
}

export const pagesService: PageService = {
  async createPage(pageData) {
    try {
      const data = await apiFetch("/tenant/pages", {
        method: "POST",
        body: JSON.stringify(pageData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updatePage(pageId, pageData) {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        method: "PATCH",
        body: JSON.stringify(pageData),
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPage(pageId) {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPagesByType(pageType) {
    try {
      const data = await apiFetch(`/tenant/pages/type/${pageType}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getPageBySlug(slug) {
    try {
      const data = await apiFetch(`/tenant/pages/${slug}`);
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getAllPages() {
    try {
      const data = await apiFetch("/tenant/pages");
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getLatestLandingPageId() {
    try {
      const pagesResponse = await this.getAllPages();

      if (!pagesResponse.success) {
        throw new Error(pagesResponse.error || "Failed to fetch pages");
      }

      let pages = Array.isArray(pagesResponse.data)
        ? pagesResponse.data
        : pagesResponse.data?.data || [];

      console.log(
        "All pages fetched:",
        pages.map((p) => ({
          id: p.id,
          title: p.title,
          page_type: p.page_type,
          type: p.type,
        }))
      );

      // Filter for landing pages and sort by creation date (newest first)
      const landingPages = pages
        .filter((page: any) => {
          const isLanding =
            page.page_type === "landing" || page.type === "landing";
          console.log(
            `Page ${page.id} (${page.title}): page_type="${page.page_type}", type="${page.type}", isLanding=${isLanding}`
          );
          return isLanding;
        })
        .sort((a: any, b: any) => {
          const aDate = new Date(a.created_at || a.createdAt || 0);
          const bDate = new Date(b.created_at || b.createdAt || 0);
          return bDate.getTime() - aDate.getTime();
        });

      console.log(
        "Filtered landing pages:",
        landingPages.map((p) => ({
          id: p.id,
          title: p.title,
          page_type: p.page_type,
        }))
      );

      if (landingPages.length > 0) {
        return { success: true, data: landingPages[0].id };
      } else {
        return { success: false, error: "No landing pages found" };
      }
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deletePage(pageId) {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        method: "DELETE",
      });
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async parseLayoutJson(layoutJson: string) {
    try {
      return JSON.parse(layoutJson);
    } catch (error) {
      console.error("Error parsing layout JSON:", error);
      return { sections: [] };
    }
  },
};
