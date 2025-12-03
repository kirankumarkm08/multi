import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface BuilderHeaderProps {
  pageType: string;
  pageTitle: string;
  onAddSection: () => void;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  onSave: () => void;
}

export function BuilderHeader({
  pageType,
  pageTitle,
  onAddSection,
  isSaving,
  saveSuccess,
  saveError,
  onSave,
}: BuilderHeaderProps) {
  return (
    <header className="flex items-center justify-between">
      <div>
        <h1 className="text-xl font-semibold">Page Builder - {pageType}</h1>
        <p className="text-sm text-muted-foreground">Building: {pageTitle}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={onAddSection}>
          <Plus className="h-4 w-4 mr-2" />
          Add Section
        </Button>
        <Button
          size="sm"
          onClick={onSave}
          disabled={isSaving}
          className={
            saveSuccess
              ? "bg-green-600 text-white"
              : saveError
              ? "bg-red-600 text-white"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          }
        >
          {isSaving ? "Saving..." : "Save Page"}
        </Button>
      </div>
    </header>
  );
}
