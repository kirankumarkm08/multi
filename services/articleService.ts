import { apiFetch } from "@/lib/api-config";
import {
  Article,
  ArticleCreateData,
  ArticleUpdateData,
} from "@/services/types/article";

class ArticleService {
  private baseUrl = "/tenant/articles";

  async getArticles(token?: string): Promise<Article[]> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: "GET",
        token,
      });

      // Handle different response formats
      if (Array.isArray(response)) {
        return response;
      } else if (response?.data) {
        return Array.isArray(response.data) ? response.data : [response.data];
      }
      return [];
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  }

  async getArticle(id: number | string, token?: string): Promise<Article> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: "GET",
        token,
      });
      return response?.data || response;
    } catch (error) {
      console.error(`Error fetching article ${id}:`, error);
      throw error;
    }
  }

  async createArticle(
    articleData: ArticleCreateData,
    token?: string
  ): Promise<Article> {
    try {
      // Validate required fields
      const requiredFields = ["title", "slug", "content", "author"];
      const missingFields = requiredFields.filter(
        (field) => !articleData[field as keyof ArticleCreateData]
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(", ")}`);
      }

      // Generate slug if not provided
      const slug =
        articleData.slug ||
        articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const apiData = {
        title: articleData.title,
        slug: slug,
        excerpt: articleData.excerpt || "",
        content: articleData.content,
        featured_image: articleData.featured_image || "",
        gallery_images: articleData.gallery_images || [],
        author: articleData.author,
        published_at: articleData.published_at || new Date().toISOString(),
        status: articleData.status || "draft",
        visibility: articleData.visibility || "public",
        password: articleData.password || null,
        category_ids: articleData.category_ids || [],
        tags: articleData.tags || [],
        meta_title: articleData.meta_title || articleData.title,
        meta_description:
          articleData.meta_description || articleData.excerpt || "",
        meta_keywords: articleData.meta_keywords || "",
      };

      console.log("Creating article with data:", apiData);

      const response = await apiFetch(this.baseUrl, {
        method: "POST",
        body: JSON.stringify(apiData),
        token,
      });

      return response?.data || response;
    } catch (error: any) {
      console.error("Error creating article:", error);

      // Enhanced error reporting for validation errors
      if (
        error.status === 422 ||
        error.message?.includes("Validation failed")
      ) {
        const validationErrors =
          error.data?.errors ||
          error.data?.message ||
          "Unknown validation error";
        console.error("Validation errors:", validationErrors);

        if (typeof validationErrors === "object") {
          const errorMessages = Object.entries(validationErrors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("\n");
          throw new Error(`Validation failed:\n${errorMessages}`);
        } else {
          throw new Error(`Validation failed: ${validationErrors}`);
        }
      }

      throw error;
    }
  }

  async updateArticle(
    id: number | string,
    articleData: ArticleUpdateData,
    token?: string
  ): Promise<Article> {
    try {
      console.log(`Updating article ${id} with data:`, articleData);

      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: "PATCH",
        body: JSON.stringify(articleData),
        token,
      });

      return response?.data || response;
    } catch (error: any) {
      console.error(`Error updating article ${id}:`, error);

      // Enhanced error reporting for validation errors
      if (
        error.status === 422 ||
        error.message?.includes("Validation failed")
      ) {
        const validationErrors =
          error.data?.errors ||
          error.data?.message ||
          "Unknown validation error";
        console.error("Validation errors:", validationErrors);

        if (typeof validationErrors === "object") {
          const errorMessages = Object.entries(validationErrors)
            .map(
              ([field, messages]) =>
                `${field}: ${
                  Array.isArray(messages) ? messages.join(", ") : messages
                }`
            )
            .join("\n");
          throw new Error(`Validation failed:\n${errorMessages}`);
        } else {
          throw new Error(`Validation failed: ${validationErrors}`);
        }
      }

      throw error;
    }
  }

  async publishArticle(id: number | string, token?: string): Promise<Article> {
    try {
      console.log(`Publishing article ${id}`);

      const response = await apiFetch(`${this.baseUrl}/${id}/publish`, {
        method: "POST",
        token,
      });

      return response?.data || response;
    } catch (error) {
      console.error(`Error publishing article ${id}:`, error);
      throw error;
    }
  }

  async unpublishArticle(
    id: number | string,
    token?: string
  ): Promise<Article> {
    try {
      console.log(`Unpublishing article ${id}`);

      const response = await apiFetch(`${this.baseUrl}/${id}/unpublish`, {
        method: "POST",
        token,
      });

      return response?.data || response;
    } catch (error) {
      console.error(`Error unpublishing article ${id}:`, error);
      throw error;
    }
  }

  async deleteArticle(id: number | string, token?: string): Promise<void> {
    try {
      console.log(`Deleting article ${id}`);

      await apiFetch(`${this.baseUrl}/${id}`, {
        method: "DELETE",
        token,
      });
    } catch (error) {
      console.error(`Error deleting article ${id}:`, error);
      throw error;
    }
  }
}

export const articleService = new ArticleService();
