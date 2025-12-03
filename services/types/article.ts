export interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  gallery_images?: string[];
  author: string;
  published_at?: string;
  status: "draft" | "published" | "archived";
  visibility: "public" | "private" | "password_protected";
  password?: string | null;
  category_ids?: number[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ArticleCreateData {
  title: string;
  slug?: string;
  excerpt?: string;
  content: string;
  featured_image?: string;
  gallery_images?: string[];
  author: string;
  published_at?: string;
  status?: "draft" | "published" | "archived";
  visibility?: "public" | "private" | "password_protected";
  password?: string | null;
  category_ids?: number[];
  tags?: string[];
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
}

export interface ArticleUpdateData extends Partial<ArticleCreateData> {}
