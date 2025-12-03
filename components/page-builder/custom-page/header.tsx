"use client";

import { Loader2 } from "lucide-react";
import { CustomPageData } from "@/types/custom-page";

interface PageHeaderProps {
  page: CustomPageData;
  isDeleting: boolean;
  onDelete: () => void;
}

/**
 * Page Header Component
 * Displays page title, status, and delete button
 */
export function PageHeader({ page, isDeleting, onDelete }: PageHeaderProps) {
  return (
    <div className="border-b bg-white dark:bg-slate-950 sticky top-0 z-40">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{page.name}</h1>
          <p className="text-sm text-muted-foreground">
            Custom page builder •{" "}
            <span className="capitalize">{page.status}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isDeleting && (
            <span className="text-sm text-muted-foreground flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Deleting...
            </span>
          )}
          {page.id && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded transition-colors disabled:opacity-50"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
