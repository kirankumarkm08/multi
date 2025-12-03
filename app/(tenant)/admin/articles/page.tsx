"use client";

import { useEffect, useState } from "react";
import { articleService } from "@/services/articleService";
import { Article } from "@/services/types/article";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import Loading from "@/components/common/Loading"; // Assuming you have this
import { format } from "date-fns"; // You might need to install date-fns if not present, or use native Date

export default function ArticlesPage() {
  const { token } = useAuth();
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      loadArticles();
    }
  }, [token]);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
      const data = await articleService.getArticles(token!);
      setArticles(data);
    } catch (error) {
      console.error("Failed to load articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    
    try {
      await articleService.deleteArticle(id, token!);
      setArticles(articles.filter((a) => a.id !== id));
    } catch (error) {
      alert("Failed to delete article");
    }
  };

  if (isLoading) return <div className="p-8"><Loading /></div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Articles</h1>
        <Link
          href="/admin/articles/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Create New Article
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {articles.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  No articles found. Create your first one!
                </td>
              </tr>
            ) : (
              articles.map((article) => (
                <tr key={article.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {article.title}
                    </div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">
                      {article.slug}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        article.status === "published"
                          ? "bg-green-100 text-green-800"
                          : article.status === "draft"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {article.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {article.published_at ? new Date(article.published_at).toLocaleDateString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
