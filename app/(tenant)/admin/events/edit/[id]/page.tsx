"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import Link from "next/link";

interface Event {
  id: number;
  event_name: string;
  name?: string;
  description: string;
  venue_name: string;
  venue_address: string;
  venue_city: string;
  venue_state: string;
  venue_country: string;
  venue_zip: string;
  venue_postal_code?: string;
  event_start_date: string;
  start_at?: string;
  event_end_date: string;
  end_at?: string;
  capacity: number;
  status: string;
  is_featured: boolean;
  is_published: boolean;
  is_active?: boolean;
  event_type: string;
  registration_required: boolean;
  registration_deadline: string;
  max_attendees: number;
  current_attendees?: number;
  event_logo?: string;
  event_banner?: string;
  slug?: string;
  sort_order?: number;
}

export default function EditEventPage() {
  const { token, isInitialized } = useAuth();
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const iconColor = "text-gray-600 dark:text-gray-400";
  const valueColor = "text-blue-400 dark:text-blue-300";

  console.log(eventId);

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
    event_start_date: "",
    event_end_date: "",
    status: "draft",
    is_featured: false,
    sort_order: "1",
    slug: "",
    event_logo: null as File | null,
    event_banner: null as File | null,
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) {
      router.push("/admin-login");
      return;
    }
    if (!eventId) {
      alert("No event ID provided");
      router.push("/admin/events");
      return;
    }
    loadEvent(eventId);
  }, [token, isInitialized, eventId]);

  const loadEvent = async (id: string) => {
    try {
      setLoading(true);
      const response = await apiFetch(`/tenant/event-edition/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = response.data ?? response;
      console.log("edit  data", data);

      // Format dates for date input (YYYY-MM-DD)
      const formatDate = (dateString: string) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      setEvent(data);

      console.log("editable data", data);
      setFormData({
        event_name: data.event_name || data.name || "",
        description: data.description || "",
        venue_name: data.venue_name || "",
        venue_address: data.venue_address || "",
        venue_city: data.venue_city || "",
        venue_state: data.venue_state || "",
        venue_country: data.venue_country || "",
        venue_postal_code: data.venue_postal_code || data.venue_zip || "",
        venue_latitude: data.venue_latitude || "",
        venue_longitude: data.venue_longitude || "",
        event_start_date: formatDate(data.start_date),
        event_end_date: formatDate(data.end_date),
        status: data.status || "draft",
        is_featured: data.is_featured || false,
        sort_order: String(data.sort_order || 1),
        slug: data.slug || "",
        event_logo: null,
        event_banner: null,
      });
    } catch (error: any) {
      console.error("Failed to load event:", error);
      setError(`Failed to load event: ${error.message || "Unknown error"}`);
      alert(`Failed to load event: ${error.message || "Unknown error"}`);
      router.push("/admin/events");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => console.log("start_date", formData.event_start_date));
  const handleFileChange = (
    name: "event_logo" | "event_banner",
    file: File | null
  ) => {
    if (file) {
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
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`${name} must be less than 5MB`);
        return;
      }
      setError(null);
    }
    setFormData((prev) => ({ ...prev, [name]: file }));
  };

  const saveEvent = async () => {
    setIsSaving(true);
    setError(null);
    try {
      if (!formData.event_name.trim())
        throw new Error("Event name is required");
      if (!formData.description.trim())
        throw new Error("Description is required");
      if (!formData.event_start_date.trim())
        throw new Error("Start date is required");
      if (!formData.event_end_date.trim())
        throw new Error("End date is required");

      const hasFiles = formData.event_logo || formData.event_banner;
      let payload: FormData | Record<string, any>;

      if (hasFiles) {
        const formDataObj = new FormData();
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
        formDataObj.append("start_date", formData.event_start_date);
        formDataObj.append("end_date", formData.event_end_date);
        formDataObj.append("is_featured", formData.is_featured ? "1" : "0");
        formDataObj.append("sort_order", formData.sort_order);
        if (formData.slug) formDataObj.append("slug", formData.slug);
        if (formData.event_logo instanceof File) {
          formDataObj.append(
            "event_logo",
            formData.event_logo,
            formData.event_logo.name
          );
        }
        if (formData.event_banner instanceof File) {
          formDataObj.append(
            "event_banner",
            formData.event_banner,
            formData.event_banner.name
          );
        }
        payload = formDataObj;

        const response = await apiFetch(`/tenant/event-edition/${eventId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: payload,
        });
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
          start_date: formData.event_start_date,
          end_date: formData.event_end_date,
          is_featured: formData.is_featured,
          sort_order: formData.sort_order,
          slug: formData.slug,
        };

        const response = await apiFetch(`/tenant/event-edition/${eventId}`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });
      }

      alert("Event updated successfully!");
      router.push("/admin/events");
    } catch (error: any) {
      const errorMsg = error?.message || "Failed to save event";
      setError(errorMsg);
      alert(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading event...</span>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-2">Event not found</h2>
          <Link href="/admin/events">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Events
            </Button>
          </Link>
        </div>
      </div>
    );
  }

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
                Edit Event - {event.event_name || event.name}
              </h1>
              <p className={iconColor}>Update the event details</p>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveEvent();
            }}
            className="space-y-8"
          >
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
                    Slug
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
                  <Label htmlFor="event_start_date" className={iconColor}>
                    Start Date *
                  </Label>
                  <Input
                    id="event_start_date"
                    name="event_start_date"
                    type="date"
                    value={formData.event_start_date}
                    onChange={handleInputChange}
                    required
                    className={valueColor}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Format: YYYY-MM-DD
                  </p>
                </div>

                <div>
                  <Label htmlFor="event_end_date" className={iconColor}>
                    End Date *
                  </Label>
                  <Input
                    id="event_end_date"
                    name="event_end_date"
                    type="date"
                    value={formData.event_end_date}
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
                    label: "City ",
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
                      className={label.includes("*") ? " text-red" : valueColor}
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
                  {/* {event.event_logo && !formData.event_logo && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current logo: {event.event_logo}
                    </p>
                  )} */}
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
                  {/* {event.event_banner && !formData.event_banner && (
                    <p className="text-sm text-gray-500 mt-1">
                      Current banner: {event.event_banner}
                    </p>
                  )} */}
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
                    onValueChange={(value) =>
                      handleSelectChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue className={valueColor} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
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
                  <div className="flex items-center space-x-2 pt-6">
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
                      Featured Event
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Event"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
