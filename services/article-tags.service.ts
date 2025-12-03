// services/article-tags.service.ts
import { apiClient } from "@/lib/api/client";
import {
  ArticleTag,
  ArticleTagsResponse,
  ArticleTagResponse,
  CreateArticleTagRequest,
  UpdateArticleTagRequest,
} from "./types/article-tags";

export class ArticleTagsService {
  static async getAllTags(): Promise<ArticleTag[]> {
    try {
      const response = await apiClient.get<ArticleTagsResponse>(
        "/tenant/article-tags"
      );
      return response.data.data || [];
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch article tags"
      );
    }
  }

  static async getTagById(id: number): Promise<ArticleTag> {
    try {
      const response = await apiClient.get<ArticleTagResponse>(
        `/tenant/article-tags/${id}`
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to fetch article tag"
      );
    }
  }

  // static async createTag(data: CreateArticleTagRequest): Promise<ArticleTag> {
  //   try {
  //     const response = await apiClient.post<ArticleTagResponse>(
  //       "/tenant/article-tags",
  //       data
  //     );
  //     return response.data.data;
  //   } catch (error: any) {
  //     throw new Error(
  //       error.response?.data?.message || "Failed to create article tag"
  //     );
  //   }
  // }

  static async updateTag(
    id: number,
    data: UpdateArticleTagRequest
  ): Promise<ArticleTag> {
    try {
      const response = await apiClient.put<ArticleTagResponse>(
        `/tenant/article-tags/${id}`,
        data
      );
      return response.data.data;
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to update article tag"
      );
    }
  }

  static async deleteTag(id: number): Promise<void> {
    try {
      await apiClient.delete(`/tenant/article-tags/${id}`);
    } catch (error: any) {
      throw new Error(
        error.response?.data?.message || "Failed to delete article tag"
      );
    }
  }
}
