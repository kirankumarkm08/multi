"use client";

import ArticleForm from "@/components/admin/articles/ArticleForm";
import { articleService } from "@/services/articleService";
import { Article, ArticleCreateData } from "@/services/types/article";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Loading from "@/components/common/Loading";
import { use } from "react";

export default function EditArticlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { token } = useAuth();
  const router = useRouter();
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (token && id) {
      loadArticle();
    }
  }, [token, id]);

  const loadArticle = async () => {
    try {
      setIsLoading(true);
      const data = await articleService.getArticle(id, token!);
      setArticle(data);
    } catch (error) {
      console.error("Failed to load article:", error);
      alert("Failed to load article");
      router.push("/admin/articles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (data: ArticleCreateData) => {
    try {
      setIsSaving(true);
      await articleService.updateArticle(id, data, token!);
      router.push("/admin/articles");
    } catch (error) {
      console.error("Failed to update article:", error);
      alert("Failed to update article");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-8"><Loading /></div>;
  if (!article) return null;

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
      </div>
      
      <ArticleForm 
        initialData={article} 
        onSubmit={handleSubmit} 
        isLoading={isSaving} 
      />
    </div>
  );
}
