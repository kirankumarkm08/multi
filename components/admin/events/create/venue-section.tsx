import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { VENUE_FIELDS } from "@/constants/event-form";
import { ExtendedEventFormData } from "@/types/event";

interface VenueSectionProps {
  formData: ExtendedEventFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconColor: string;
  valueColor: string;
}

export function VenueSection({
  formData,
  onChange,
  iconColor,
  valueColor,
}: VenueSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className={`text-lg font-semibold ${valueColor}`}>Venue Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {VENUE_FIELDS.map((field) => (
          <div key={field.key}>
            <Label htmlFor={field.key} className={iconColor}>
              {field.label}
            </Label>
            <Input
              id={field.key}
              name={field.key}
              value={(formData as any)[field.key]}
              onChange={onChange}
              placeholder={field.placeholder}
              required={field.required}
              className={valueColor}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
