import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { IMAGE_FIELDS, IMAGE_VALIDATION } from "@/constants/event-form";
import { ExtendedEventFormData } from "@/types/event";

interface ImagesSectionProps {
  formData: ExtendedEventFormData;
  onFileChange: (name: keyof ExtendedEventFormData, file: File | null) => void;
  iconColor: string;
  valueColor: string;
}

export function ImagesSection({
  formData,
  onFileChange,
  iconColor,
  valueColor,
}: ImagesSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className={`text-lg font-semibold ${valueColor}`}>Images</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {IMAGE_FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key} className={iconColor}>
              {field.label}
            </Label>
            <Input
              id={field.key}
              name={field.key}
              type="file"
              accept={IMAGE_VALIDATION.ACCEPT_STRING}
              onChange={(e) => onFileChange(field.key, e.target.files?.[0] || null)}
              className={valueColor}
            />
            {(formData as any)[field.key] instanceof File && (
              <p className="text-sm text-gray-500 mt-1">
                Selected: {((formData as any)[field.key] as File).name}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
