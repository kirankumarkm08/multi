import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BASIC_INFO_FIELDS } from "@/constants/event-form";
import { ExtendedEventFormData } from "@/types/event";

interface BasicInfoSectionProps {
  formData: ExtendedEventFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  iconColor: string;
  valueColor: string;
}

export function BasicInfoSection({
  formData,
  onChange,
  iconColor,
  valueColor,
}: BasicInfoSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className={`text-lg font-semibold ${valueColor}`}>Basic Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {BASIC_INFO_FIELDS.map((field) => {
          const Component = field.type === "textarea" ? Textarea : Input;
          const rows = field.type === "textarea" ? (field as any).rows : undefined;

          return (
            <div key={field.key} className={field.type === "textarea" ? "md:col-span-2" : ""}>
              <Label htmlFor={field.key} className={iconColor}>
                {field.label}
              </Label>
              <Component
                id={field.key}
                name={field.key}
                value={(formData as any)[field.key]}
                onChange={onChange}
                placeholder={field.placeholder}
                required={field.label.includes("*")}
                rows={rows}
                className={valueColor}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
