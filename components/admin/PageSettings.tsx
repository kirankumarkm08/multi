import { ContactPage } from "@/types/contact";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/common/Input";
import { Textarea } from "@/components/common/TextArea";

interface PageSettingsProps {
  page: ContactPage;
  onPageChange: (updater: (prev: ContactPage) => ContactPage) => void;
}

export const PageSettings: React.FC<PageSettingsProps> = ({
  page,
  onPageChange,
}) => {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="dark:border-gray-700">
        <CardTitle className="dark:text-white">Page Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          label="Title"
          value={page.title}
          onChange={(e) =>
            onPageChange((p) => ({ ...p, title: e.target.value }))
          }
        />
        <div>
          <label className="text-sm font-medium text-gray-900 dark:text-gray-200 mb-1 block">
            Page Slug
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            /contact-us
          </p>
        </div>
        <Textarea
          label="Description"
          rows={3}
          placeholder="Description"
          value={page.description}
          onChange={(e) =>
            onPageChange((p) => ({ ...p, description: e.target.value }))
          }
        />
      </CardContent>
    </Card>
  );
};
