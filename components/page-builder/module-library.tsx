"use client";

import type React from "react";
import { useState } from "react";
import { X, Search, Tag, Star } from "lucide-react";
import { cn } from "@/lib/utils";

import { Module } from "@/types/pagebuilder";

interface ModuleLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: Module) => void;
  availableModules: Module[];
  availableBlocks?: any[];
  availableForms?: any[];
}

const iconMap = {
  "🎤": "🎤",
  "📅": "📅",
  "🎫": "🎫",
  "⭐": "⭐",
  "🏢": "🏢",
  "⏰": "⏰",
  "📝": "📝",
  "📊": "📊",
  "🖼️": "🖼️",
  "🎨": "🎨",
};

export function ModuleLibrary({
  isOpen,
  onClose,
  onSelectModule,
  availableModules,
  availableBlocks = [],
  availableForms=[],
}: ModuleLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  if (!isOpen) return null;

  // Combine regular modules with block modules
  const blockModules: Module[] = availableBlocks.map((block) => ({
    id: `block-${block.id}`,
    name: block.name,
    description: `Custom content block: ${block.content.substring(0, 50)}...`,
    icon: "📄",
    category: "Custom Blocks",
    tags: ["blocks", "content", "custom"],
    defaultProps: {
      content: block.content,
      contentType: block.content_type,
      blockId: block.id,
    },
    blockId: block.id,
  }));

  const formModules: Module[] = availableForms.map((forms:any) => ({
    id: `form-${forms.id}`,
    name: forms.name,
    description: forms.form_type || "Custom form",
    icon: "📝",
    category: "Form Builder",
    tags: ["form", "builder", "custom"],
    defaultProps: {
      formId: forms.id,
      formData: forms,
    },
  }));

  const allModules = [...availableModules, ...blockModules,...formModules];
  const categories = Array.from(
    new Set(allModules.map((module) => module.category))
  );

  const filteredModules = allModules.filter((module) => {
    const matchesSearch =
      module.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      module.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (module.tags && module.tags.some((tag) =>
        tag.toLowerCase().includes(searchTerm.toLowerCase())
      ));

    const matchesCategory =
      !selectedCategory || module.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleModuleClick = (module: Module) => {
    onSelectModule(module);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Module Library
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Choose a module to add to your page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search modules..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                !selectedCategory
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Categories
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                  selectedCategory === category
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Module Grid */}
        <div className="flex-1 overflow-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredModules.map((module) => (
              <div
                key={module.id}
                onClick={() => handleModuleClick(module)}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md cursor-pointer transition-all group bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center text-lg">
                      {iconMap[module.icon as keyof typeof iconMap] ||
                        module.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {module.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {module.category}
                      </p>
                    </div>
                  </div>
                  {/* {module.isPremium && (
                    <div className="flex items-center gap-1 text-yellow-600 dark:text-yellow-400">
                      <Star className="h-3 w-3 fill-current" />
                      <span className="text-xs font-medium">Premium</span>
                    </div>
                  )} */}
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {module.description}
                </p>

                <div className="flex flex-wrap gap-1">
                  {module.tags?.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs text-gray-600 dark:text-gray-300 rounded"
                    >
                      <Tag className="h-2.5 w-2.5" />
                      {tag}
                    </span>
                  ))}
                  {module.tags && module.tags.length > 3 && (
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      +{module.tags.length - 3} more
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredModules.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400 dark:text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No modules found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or selected category
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export { iconMap };
