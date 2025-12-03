import { Button } from "@/components/ui/button";
import Link from "next/link";

interface FormActionsProps {
  loading: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export function FormActions({ loading, onSubmit }: FormActionsProps) {
  return (
    <div className="flex justify-end space-x-4 pt-6">
      <Link href="/admin/events" passHref>
        <Button type="button" variant="outline">
          Cancel
        </Button>
      </Link>
      <Button type="submit" disabled={loading} onClick={onSubmit}>
        {loading ? "Creating..." : "Create Event"}
      </Button>
    </div>
  );
}
