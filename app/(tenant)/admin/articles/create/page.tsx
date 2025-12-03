"use client";

import ArticleForm from "@/components/admin/articles/ArticleForm";
import { articleService } from "@/services/articleService";
import { ArticleCreateData } from "@/services/types/article";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function CreateArticlePage() {
  const { token } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: ArticleCreateData) => {
    try {
      setIsLoading(true);
      await articleService.createArticle(data, token!);
      router.push("/admin/articles");
    } catch (error) {
      console.error("Failed to create article:", error);
      alert("Failed to create article. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href="/admin/articles"
          className="text-gray-500 hover:text-gray-700"
        >
          ← Back to Articles
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Create New Article</h1>
      </div>
      
      <ArticleForm onSubmit={handleSubmit} isLoading={isLoading} />
    </div>
  );
}
