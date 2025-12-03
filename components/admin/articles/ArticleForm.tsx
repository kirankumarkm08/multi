"use client";

import { useState, useEffect } from "react";
import { Article, ArticleCreateData } from "@/services/types/article";
import RichTextEditor from "@/components/common/RichTextEditor";
import { useRouter } from "next/navigation";
import { ArticleTagsService } from "@/services/article-tags.service";
import { articleCategoryService } from "@/services/articleCategory.service";
import { ArticleTag } from "@/services/types/article-tags";
import { ArticleCategory } from "@/services/articleCategory";
import { useAuth } from "@/context/AuthContext";

interface ArticleFormProps {
  initialData?: Article;
  onSubmit: (data: ArticleCreateData) => Promise<void>;
  isLoading?: boolean;
}

export default function ArticleForm({
  initialData,
  onSubmit,
  isLoading = false,
}: ArticleFormProps) {
  const { token } = useAuth();
  const [formData, setFormData] = useState<ArticleCreateData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    excerpt: initialData?.excerpt || "",
    content: initialData?.content || "",
    author: initialData?.author || "",
    status: initialData?.status || "draft",
    visibility: initialData?.visibility || "public",
    featured_image: initialData?.featured_image || "",
    category_ids: initialData?.category_ids || [],
    tags: initialData?.tags || [],
  });

  const [tags, setTags] = useState<ArticleTag[]>([]);
  const [categories, setCategories] = useState<ArticleCategory[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  useEffect(() => {
    const loadMetaData = async () => {
      if (!token) return;
      try {
        const [fetchedTags, fetchedCategories] = await Promise.all([
          ArticleTagsService.getAllTags(),
          articleCategoryService.getCategories(token),
        ]);
        setTags(fetchedTags);
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("Failed to load tags or categories", error);
      } finally {
        setLoadingMeta(false);
      }
    };
    loadMetaData();
  }, [token]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (content: string) => {
    setFormData((prev) => ({ ...prev, content }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, (option) =>
      Number(option.value)
    );
    setFormData((prev) => ({ ...prev, category_ids: selectedOptions }));
  };

  // Simple tag selection for now (can be improved with a proper multi-select component)
  const handleTagToggle = (tagName: string) => {
    setFormData((prev) => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tagName)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tagName) };
      } else {
        return { ...prev, tags: [...currentTags, tagName] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-6xl mx-auto pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Article Content</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Enter article title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Slug
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-600"
                  placeholder="auto-generated-from-title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Excerpt
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Short summary of the article..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-md overflow-hidden">
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleEditorChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          {/* Publishing Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Publishing</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="password_protected">Password Protected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Author
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : initialData ? "Update Article" : "Create Article"}
              </button>
            </div>
          </div>

          {/* Organization Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Organization</h2>
            
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Categories
                </label>
                {loadingMeta ? (
                  <div className="text-sm text-gray-400">Loading categories...</div>
                ) : (
                  <select
                    multiple
                    value={formData.category_ids?.map(String)}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-32 bg-white"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags
                </label>
                {loadingMeta ? (
                  <div className="text-sm text-gray-400">Loading tags...</div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => handleTagToggle(tag.name)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                          formData.tags?.includes(tag.name)
                            ? "bg-blue-100 text-blue-800 border-blue-200"
                            : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        {tag.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-lg font-semibold mb-4 text-gray-800">Featured Image</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="text"
                name="featured_image"
                value={formData.featured_image}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="https://..."
              />
              {formData.featured_image && (
                <div className="mt-3 relative aspect-video rounded-md overflow-hidden bg-gray-100 border border-gray-200">
                  <img
                    src={formData.featured_image}
                    alt="Preview"
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
