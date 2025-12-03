import { tenantApi } from "@/lib/api";
import {
  ArticleCategory,
  ArticleCategoryCreateData,
} from "@/services/articleCategory";

export const articleCategoryService = {
  async getCategories(token: any): Promise<ArticleCategory[]> {
    try {
      const response = await tenantApi.getCategories(token);

      if (Array.isArray(response)) return response;
      if (Array.isArray(response?.data)) return response.data;
      if (Array.isArray(response?.categories)) return response.categories;

      console.warn("Unexpected categories structure:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      throw error;
    }
  },

  async getCategoryById(id: number, token: any): Promise<ArticleCategory> {
    try {
      const response = await tenantApi.getCategoryById(id, token);
      return response?.data || response;
    } catch (error) {
      console.error(`Failed to fetch category ${id}:`, error);
      throw error;
    }
  },

  async createCategory(
    data: ArticleCategoryCreateData | FormData,
    token: any
  ): Promise<ArticleCategory> {
    try {
      let payload: FormData;

      if (data instanceof FormData) {
        payload = data;
      } else {
        payload = new FormData();
        Object.entries(data).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            payload.append(key, value as any);
          }
        });
      }

      const response = await tenantApi.createCategory(payload, token);
      return response?.data || response;
    } catch (error) {
      console.error("Failed to create category:", error);
      throw error;
    }
  },

  async updateCategory(
    id: number,
    data: Partial<ArticleCategoryCreateData>,
    token: any
  ): Promise<ArticleCategory> {
    try {
      const body = new URLSearchParams();
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          body.append(key, String(value));
        }
      });

      const response = await tenantApi.updateCategory(id, body, token);

      return response?.data || response;
    } catch (error) {
      console.error(`Failed to update category ${id}:`, error);
      throw error;
    }
  },

  async deleteCategory(id: number, token: any): Promise<void> {
    try {
      await tenantApi.deleteCategory(id, token);
    } catch (error) {
      console.error(`Failed to delete category ${id}:`, error);
      throw error;
    }
  },
};
