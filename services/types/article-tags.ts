export interface ArticleTag {
  id: number;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleTagsResponse {
  data: ArticleTag[];
  message?: string;
}

export interface ArticleTagResponse {
  data: ArticleTag;
  message?: string;
}

export interface CreateArticleTagRequest {
  name: string;
  slug?: string;
}

export interface UpdateArticleTagRequest {
  name?: string;
  slug?: string;
}
