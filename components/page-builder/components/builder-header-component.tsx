/**
 * BuilderHeader Component
 * Displays header with save button and status badges
 * Extracted from BuilderCanvas for better modularity
 */

import React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface BuilderHeaderProps {
  pageType: string;
  pageTitle: string;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  onSave: () => void;
  onAddSection?: () => void;
}

export function BuilderHeaderComponent({
  pageType,
  pageTitle,
  isSaving,
  saveSuccess,
  saveError,
  onSave,
  onAddSection,
}: BuilderHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-4 p-4 bg-white rounded-lg border">
      <div className="flex-1">
        <h2 className="text-xl font-bold">{pageTitle}</h2>
        <Badge variant="secondary" className="mt-1">
          {pageType}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {saveSuccess && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Saved</span>
          </div>
        )}

        {saveError && (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm truncate">{saveError}</span>
          </div>
        )}

        <Button
          onClick={onSave}
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save"
          )}
        </Button>
      </div>
    </div>
  );
}
