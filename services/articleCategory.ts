export interface ArticleCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleCategoryCreateData {
  name: string;
  slug?: string;
  description?: string;
  parent_id?: number | null;
}
