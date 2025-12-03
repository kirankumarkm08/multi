import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  error,
  required,
  className,
  children,
}) => {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label className="flex items-center gap-1 dark:text-gray-200">
          {label}
          {required && <span className="text-red-500">*</span>}
        </Label>
      )}
      {children}
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};