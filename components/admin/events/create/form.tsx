import { BasicInfoSection } from "./basic-info-section";
import { DateTimeSection } from "./datetime-section";
import { VenueSection } from "./venue-section";
import { ImagesSection } from "./images-section";
import { SettingsSection } from "./settings-section";
import { FormActions } from "./form-actions";
import { ErrorDisplay } from "./error-display";
import { CreateEventHeader } from "./header";
import { ExtendedEventFormData } from "@/types/event";

export interface EventFormProps {
  formData: ExtendedEventFormData;
  error: string | null;
  loading: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSelectChange: (name: string, value: string) => void;
  onCheckboxChange: (name: string, checked: boolean) => void;
  onFileChange: (name: keyof ExtendedEventFormData, file: File | null) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  iconColor: string;
  valueColor: string;
}

/**
 * Main event creation form component
 * Composes all form sections into a single form
 */
export function EventForm({
  formData,
  error,
  loading,
  onInputChange,
  onSelectChange,
  onCheckboxChange,
  onFileChange,
  onSubmit,
  iconColor,
  valueColor,
}: EventFormProps) {
  return (
    <>
      <CreateEventHeader iconColor={iconColor} valueColor={valueColor} />
      <div className="space-y-8">
        <ErrorDisplay error={error} />

        <form onSubmit={onSubmit} className="space-y-8">
          <BasicInfoSection
            formData={formData}
            onChange={onInputChange}
            iconColor={iconColor}
            valueColor={valueColor}
          />

          <DateTimeSection
            formData={formData}
            onChange={onInputChange}
            iconColor={iconColor}
            valueColor={valueColor}
          />

          <VenueSection
            formData={formData}
            onChange={onInputChange}
            iconColor={iconColor}
            valueColor={valueColor}
          />

          <ImagesSection
            formData={formData}
            onFileChange={onFileChange}
            iconColor={iconColor}
            valueColor={valueColor}
          />

          <SettingsSection
            formData={formData}
            onSelectChange={onSelectChange}
            onCheckboxChange={onCheckboxChange}
            onInputChange={onInputChange}
            iconColor={iconColor}
            valueColor={valueColor}
          />

          <FormActions loading={loading} onSubmit={onSubmit} />
        </form>
      </div>
    </>
  );
}
