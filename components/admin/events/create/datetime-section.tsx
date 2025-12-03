import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DATE_FIELDS } from "@/constants/event-form";
import { ExtendedEventFormData } from "@/types/event";

interface DateTimeSectionProps {
  formData: ExtendedEventFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconColor: string;
  valueColor: string;
}

export function DateTimeSection({
  formData,
  onChange,
  iconColor,
  valueColor,
}: DateTimeSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className={`text-lg font-semibold ${valueColor}`}>Date and Time</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {DATE_FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key} className={iconColor}>
              {field.label}
            </Label>
            <Input
              id={field.key}
              name={field.key}
              type="date"
              value={(formData as any)[field.key]}
              onChange={onChange}
              required={field.required}
              className={valueColor}
            />
            <p className="text-xs text-gray-500 mt-1">Format: YYYY-MM-DD</p>
          </div>
        ))}
      </div>
    </section>
  );
}
