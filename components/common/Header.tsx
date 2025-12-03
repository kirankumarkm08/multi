import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

interface CustomPage {
  id: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  status: "draft" | "published" | "archived";
  show_in_nav: number;
//   modules: PageModule[];
//   settings: PageSettings;
}

export function Header({
  page,
  isDeleting,
  onDelete,
}: {
  page: CustomPage;
  isDeleting: boolean;
  onDelete: () => void;
}) {
  function getStatusVariant(status: any) {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="border-b">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Custom Page Builder</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Drag & Drop Builder</Badge>
              {/* <Badge variant={getStatusVariant(page.status)}>
                {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
              </Badge> */}
            </div>
          </div>
          {page.id && (
            <Button
              onClick={onDelete}
              size="sm"
              variant="destructive"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
