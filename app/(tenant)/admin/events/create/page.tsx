"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { eventService } from "@/services/event.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ExtendedEventFormData } from "@/types/event";

export default function CreateEventPage() {
  const router = useRouter();
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const iconColor = "text-gray-600 dark:text-gray-400";
  const valueColor = "text-blue-400 dark:text-blue-300";

  const [formData, setFormData] = useState<ExtendedEventFormData>({
    event_name: "",
    description: "",
    venue_name: "",
    venue_address: "",
    venue_city: "",
    venue_state: "",
    venue_country: "",
    venue_postal_code: "",
    venue_latitude: "",
    venue_longitude: "",
    event_logo: null,
    event_banner: null,
    status: "published",
    start_date: "",
    end_date: "",
    is_featured: false,
    sort_order: "1",
    custom_fields: "",
    metadata: "",
    slug: "",
  });

  // Redirect unauthenticated users
  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
    }
  }, [token, router]);

  // Debug date values
  useEffect(() => {
    console.log("Current form date values:", {
      start_date: formData.start_date,
      end_date: formData.end_date,
      start_date_type: typeof formData.start_date,
      end_date_type: typeof formData.end_date,
    });
  }, [formData.start_date, formData.end_date]);

  // Debounced slug generator for event_name
  useEffect(() => {
    if (!formData.event_name.trim()) {
      setFormData((prev) => ({ ...prev, slug: "" }));
      return;
    }
    const timeoutId = setTimeout(() => {
      const slug = formData.event_name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.event_name]);

  // Generic input/textarea change handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Select change handler
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Checkbox change handler
  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  // File input change handler with validation
  const handleFileChange = (
    name: keyof ExtendedEventFormData,
    file: File | null
  ) => {
    if (file) {
      // Validate file type
      const validImageTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!validImageTypes.includes(file.type)) {
        setError(
          `${name} must be a valid image file (JPEG, PNG, GIF, or WebP)`
        );
        return;
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError(`${name} must be less than 5MB`);
        return;
      }

      // Clear any previous errors
      setError(null);
    }

    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  // Clean date string to ensure pure YYYY-MM-DD format
  const cleanDate = (dateString: string): string => {
    if (!dateString) return "";

    console.log("Cleaning date:", dateString);

    // If it's already in pure YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If it has time portion with T separator (ISO format)
    if (dateString.includes("T")) {
      return dateString.split("T")[0];
    }

    // If it has space separator
    if (dateString.includes(" ")) {
      return dateString.split(" ")[0];
    }

    // If it has any other unexpected format, try to extract YYYY-MM-DD
    const dateMatch = dateString.match(/^(\d{4}-\d{2}-\d{2})/);
    if (dateMatch) {
      return dateMatch[1];
    }

    // If all else fails, try to parse as Date object
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      }
    } catch (error) {
      console.error("Error parsing date:", error);
    }

    return dateString;
  };

  // Validate date format
  const isValidDateFormat = (dateString: string): boolean => {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Basic validation
      if (!formData.event_name.trim())
        throw new Error("Event name is required");
      if (!formData.description.trim())
        throw new Error("Description is required");

      // Date validation
      if (!formData.start_date.trim())
        throw new Error("Start date is required");
      if (!formData.end_date.trim()) throw new Error("End date is required");

      // Clean and validate dates
      const formattedStartDate = cleanDate(formData.start_date);
      const formattedEndDate = cleanDate(formData.end_date);

      console.log("Date transformation:", {
        originalStart: formData.start_date,
        cleanedStart: formattedStartDate,
        originalEnd: formData.end_date,
        cleanedEnd: formattedEndDate,
      });

      // Validate date formats
      if (!isValidDateFormat(formattedStartDate)) {
        throw new Error(
          `Start date must be in the format YYYY-MM-DD. Received: "${formData.start_date}"`
        );
      }
      if (!isValidDateFormat(formattedEndDate)) {
        throw new Error(
          `End date must be in the format YYYY-MM-DD. Received: "${formData.end_date}"`
        );
      }

      // Validate date logic
      const startDate = new Date(formattedStartDate);
      const endDate = new Date(formattedEndDate);

      if (endDate < startDate) {
        throw new Error("End date cannot be before start date");
      }

      // Build FormData if files are present, else plain JSON payload
      const hasFiles = formData.event_logo || formData.event_banner;

      let payload: FormData | Record<string, any>;

      if (hasFiles) {
        const formDataObj = new FormData();

        // Append string and boolean fields
        formDataObj.append("name", formData.event_name);
        formDataObj.append("event_name", formData.event_name);
        formDataObj.append("description", formData.description);
        formDataObj.append("venue_name", formData.venue_name);
        formDataObj.append("venue_address", formData.venue_address);
        formDataObj.append("venue_city", formData.venue_city);
        formDataObj.append("venue_state", formData.venue_state);
        formDataObj.append("venue_country", formData.venue_country);
        formDataObj.append("venue_postal_code", formData.venue_postal_code);
        formDataObj.append("venue_latitude", formData.venue_latitude || "0.0");
        formDataObj.append(
          "venue_longitude",
          formData.venue_longitude || "0.0"
        );
        formDataObj.append("status", formData.status);
        formDataObj.append("start_date", formattedStartDate);
        formDataObj.append("end_date", formattedEndDate);
        formDataObj.append("is_featured", formData.is_featured ? "1" : "0");
        formDataObj.append("sort_order", formData.sort_order);

        console.log("Final FormData dates:", {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          is_featured: formData.is_featured ? "1" : "0",
        });

        if (formData.slug) formDataObj.append("slug", formData.slug);
        if (formData.custom_fields)
          formDataObj.append("custom_fields", formData.custom_fields);
        if (formData.metadata)
          formDataObj.append("metadata", formData.metadata);

        // Append files with the exact field names the API expects
        if (formData.event_logo instanceof File) {
          console.log("Appending logo file:", {
            name: formData.event_logo.name,
            type: formData.event_logo.type,
            size: formData.event_logo.size,
          });
          formDataObj.append(
            "event_logo",
            formData.event_logo,
            formData.event_logo.name
          );
        }
        if (formData.event_banner instanceof File) {
          console.log("Appending banner file:", {
            name: formData.event_banner.name,
            type: formData.event_banner.type,
            size: formData.event_banner.size,
          });
          formDataObj.append(
            "event_banner",
            formData.event_banner,
            formData.event_banner.name
          );
        }

        payload = formDataObj;
      } else {
        payload = {
          name: formData.event_name,
          event_name: formData.event_name,
          description: formData.description,
          venue_name: formData.venue_name,
          venue_address: formData.venue_address,
          venue_city: formData.venue_city,
          venue_state: formData.venue_state,
          venue_country: formData.venue_country,
          venue_postal_code: formData.venue_postal_code,
          venue_latitude: formData.venue_latitude || "0.0",
          venue_longitude: formData.venue_longitude || "0.0",
          status: formData.status,
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
          slug: formData.slug,
          custom_fields: formData.custom_fields || null,
          metadata: formData.metadata || null,
        };

        console.log("JSON payload with cleaned dates:", {
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          is_featured: formData.is_featured,
        });
      }

      // Send request via eventService
      const response = await eventService.createEvent(payload, token);

      console.log("Event created successfully:", response);

      // Show success message
      alert(
        `Event "${
          response.event_name || formData.event_name
        }" created successfully!`
      );

      router.push("/admin/events");
    } catch (err: any) {
      console.error("Event creation error:", err);

      // Handle different types of errors
      if (err?.data?.errors) {
        const errorMessages = Object.entries(err.data.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${
                Array.isArray(messages) ? messages.join(", ") : messages
              }`
          )
          .join("\n");
        setError(`Validation failed:\n${errorMessages}`);
      } else {
        setError(err?.message || "Failed to create event");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <Card className="dark:bg-gray-800 rounded-2xl p-6 border border-gray-800 dark:border-gray-700 hover:border-gray-700 dark:hover:border-gray-600 transition-all duration-200 shadow-lg max-w-6xl mx-auto">
        <CardHeader>
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/admin/events" passHref>
              <Button variant="ghost" size="sm" className={iconColor} as="a">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Events
              </Button>
            </Link>
            <div>
              <h1 className={`text-2xl font-bold ${valueColor}`}>
                Create New Event
              </h1>
              <p className={iconColor}>Fill in all the event details</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded whitespace-pre-wrap">
                {error}
              </div>
            )}

            {/* Basic Information */}
            <section className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>
                Basic Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_name" className={iconColor}>
                    Event Name *
                  </Label>
                  <Input
                    id="event_name"
                    name="event_name"
                    value={formData.event_name}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                    placeholder="Enter event name"
                  />
                </div>

                <div>
                  <Label htmlFor="slug" className={iconColor}>
                    Slug (Auto-generated)
                  </Label>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={valueColor}
                    placeholder="event-slug"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="description" className={iconColor}>
                    Description *
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className={valueColor}
                    placeholder="Enter event description"
                  />
                </div>
              </div>
            </section>

            {/* Date and Time */}
            <section className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>
                Date and Time
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="start_date" className={iconColor}>
                    Start Date *
                  </Label>
                  <Input
                    id="start_date"
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: YYYY-MM-DD
                  </p>
                </div>

                <div>
                  <Label htmlFor="end_date" className={iconColor}>
                    End Date *
                  </Label>
                  <Input
                    id="end_date"
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: YYYY-MM-DD
                  </p>
                </div>
              </div>
            </section>

            {/* Venue Information */}
            <section className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>
                Venue Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    key: "venue_name",
                    label: "Venue Name *",
                    placeholder: "Enter venue name",
                  },
                  {
                    key: "venue_address",
                    label: "Venue Address ",
                    placeholder: "Enter venue address",
                  },
                  {
                    key: "venue_city",
                    label: "City",
                    placeholder: "Enter city",
                  },
                  {
                    key: "venue_state",
                    label: "State ",
                    placeholder: "Enter state",
                  },
                  {
                    key: "venue_country",
                    label: "Country ",
                    placeholder: "Enter country",
                  },
                  {
                    key: "venue_postal_code",
                    label: "Postal Code ",
                    placeholder: "Enter postal code",
                  },
                  {
                    key: "venue_latitude",
                    label: "Latitude",
                    placeholder: "12.0000",
                  },
                  {
                    key: "venue_longitude",
                    label: "Longitude",
                    placeholder: "77.0000",
                  },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <Label htmlFor={key} className={iconColor}>
                      {label}
                    </Label>
                    <Input
                      id={key}
                      name={key}
                      value={(formData as any)[key]}
                      onChange={handleInputChange}
                      placeholder={placeholder}
                      className={valueColor}
                      required={label.includes("*")}
                    />
                  </div>
                ))}
              </div>
            </section>

            {/* Images */}
            <section className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>Images</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="event_logo" className={iconColor}>
                    Event Logo
                  </Label>
                  <Input
                    id="event_logo"
                    name="event_logo"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) =>
                      handleFileChange(
                        "event_logo",
                        e.target.files?.[0] || null
                      )
                    }
                    className={valueColor}
                  />
                  {formData.event_logo instanceof File && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {formData.event_logo.name}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="event_banner" className={iconColor}>
                    Event Banner
                  </Label>
                  <Input
                    id="event_banner"
                    name="event_banner"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={(e) =>
                      handleFileChange(
                        "event_banner",
                        e.target.files?.[0] || null
                      )
                    }
                    className={valueColor}
                  />
                  {formData.event_banner instanceof File && (
                    <p className="text-sm text-gray-500 mt-1">
                      Selected: {formData.event_banner.name}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Settings */}
            <section className="space-y-4">
              <h3 className={`text-lg font-semibold ${valueColor}`}>
                Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <Label htmlFor="status" className={iconColor}>
                    Status
                  </Label>
                  <Select
                    value={formData.status}
                    // onValueChange={(value) =>
                    //   handleSelectChange("status", value="published")
                    // }
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue className={valueColor} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    onChange={handleInputChange}
                    className={valueColor}
                  />
                </div>

                <div className="">
                  <div className="flex items-center space-x-2 pt-6 capitalize">
                    <Checkbox
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) =>
                        handleCheckboxChange("is_featured", checked as boolean)
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

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/admin/events" passHref>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Event"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
