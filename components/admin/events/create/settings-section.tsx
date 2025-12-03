import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { EVENT_STATUS_OPTIONS } from "@/constants/event-form";
import { ExtendedEventFormData } from "@/types/event";

interface SettingsSectionProps {
  formData: ExtendedEventFormData;
  onSelectChange: (name: string, value: string) => void;
  onCheckboxChange: (name: string, checked: boolean) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  iconColor: string;
  valueColor: string;
}

export function SettingsSection({
  formData,
  onSelectChange,
  onCheckboxChange,
  onInputChange,
  iconColor,
  valueColor,
}: SettingsSectionProps) {
  return (
    <section className="space-y-4">
      <h3 className={`text-lg font-semibold ${valueColor}`}>Settings</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <Label htmlFor="status" className={iconColor}>
            Status
          </Label>
          <Select value={formData.status} onValueChange={(value) => onSelectChange("status", value)}>
            <SelectTrigger>
              <SelectValue className={valueColor} />
            </SelectTrigger>
            <SelectContent>
              {EVENT_STATUS_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="sort_order" className={iconColor}>
            Sort Order
          </Label>
          <Input
            id="sort_order"
            name="sort_order"
            type="number"
            value={formData.sort_order}
            onChange={onInputChange}
            className={valueColor}
          />
        </div>

        <div className="">
          <div className="flex items-center space-x-2 pt-6 capitalize">
            <Checkbox
              id="is_featured"
              checked={formData.is_featured}
              onCheckedChange={(checked) =>
                onCheckboxChange("is_featured", checked as boolean)
              }
            />
            <Label
              htmlFor="is_featured"
              className={`cursor-pointer ${iconColor}`}
            >
              mark as Upcoming & Recent Event
            </Label>
          </div>
        </div>
      </div>
    </section>
  );
}
