"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
// Updated TicketCreateData interface to include all new fields
import {
  ticketService,
  TicketCreateData,
  EventEdition,
} from "@/services/ticket.service";
// Assuming you have a toast system. Replace useToast with a simple console.log or alert if not.
// import { useToast } from "@/components/ui/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  Save,
  Calendar,
  DollarSign,
  Hash,
  Clock,
  Users,
  Tag,
  Settings,
  Info,
  ImageIcon,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// --- Date Helper Function (Reused) ---
const toISOStringUTC = (localDatetimeString: string): string => {
  if (!localDatetimeString) return "";
  const date = new Date(localDatetimeString);
  // Using toISOString for full datetime fields (assuming your API expects this for sale dates)
  // If your API strictly expects YYYY-MM-DD for date-only fields, you'd use a different helper.
  return date.toISOString();
};

export default function CreateTicketPage() {
  const { token } = useAuth();
  const router = useRouter();
  // const { toast } = useToast(); // Placeholder
  const [loading, setLoading] = useState(false);
  const [eventEditions, setEventEditions] = useState<EventEdition[]>([]);
  const [selectedEvents, setSelectedEvents] = useState<number[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [notification, setNotification] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const [formData, setFormData] = useState<TicketCreateData>({
    name: "",
    description: "",
    price: 0,
    quantity: 0,
    ticket_start_date: "",
    ticket_end_date: "",
    status: "active",
    ticket_logo: null, // File object for upload
    sort_order: 0,
    is_nft_enabled: false,
    nft_contract_address: "",
    nft_metadata: "",
    event_edition_ids: [],
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/admin-login");
      return;
    }

    const fetchEventEditions = async () => {
      try {
        const events = await ticketService.getEventEditions();
        setEventEditions(events);
      } catch (error) {
        console.error("Failed to fetch event editions:", error);
        setNotification({
          message: "Failed to load event list.",
          type: "error",
        });
      }
    };

    fetchEventEditions();
  }, [token]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    // Convert to number for numeric fields, otherwise keep as string
    const newValue = type === "number" ? parseFloat(value) || 0 : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simple file validation (e.g., size and type)
    if (file.size > 5 * 1024 * 1024) {
      // 5MB limit
      setFileError("File size must not exceed 5MB.");
      setFormData((prev) => ({
        ...prev,
        ticket_logo: null,
      }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setFileError("Only image files are allowed.");
      setFormData((prev) => ({
        ...prev,
        ticket_logo: null,
      }));
      return;
    }
    setFileError(null);

    setFormData((prev) => ({
      ...prev,
      ticket_logo: file, // Store file object for FormData upload
    }));
  };

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      is_nft_enabled: checked,
      // Clear NFT fields if disabled
      nft_contract_address: checked ? prev.nft_contract_address : "",
      nft_metadata: checked ? prev.nft_metadata : "",
    }));
  };

  const handleEventToggle = (eventId: number) => {
    console.log("eventid", eventId);
    setSelectedEvents((prev) => {
      if (prev.includes(eventId)) {
        return prev.filter((id) => id !== eventId);
      }
      return [...prev, eventId];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    // 1. Basic Validation
    if (formData.price < 0 || formData.quantity <= 0) {
      setNotification({
        message:
          "Price must be non-negative and Quantity must be greater than 0.",
        type: "error",
      });
      setLoading(false);
      return;
    }

    // 2. Conditional NFT Validation
    if (formData.is_nft_enabled) {
      if (!formData.nft_contract_address) {
        setNotification({
          message: "NFT Contract Address is required when NFT is enabled.",
          type: "error",
        });
        setLoading(false);
        return;
      }
      if (!formData.nft_metadata) {
        setNotification({
          message: "NFT Metadata is required when NFT is enabled.",
          type: "error",
        });
        setLoading(false);
        return;
      }
      // Validate NFT metadata as JSON
      try {
        JSON.parse(formData.nft_metadata);
      } catch (error) {
        setNotification({
          message: "NFT Metadata must be a valid JSON string.",
          type: "error",
        });
        setLoading(false);
        return;
      }
    }

    // 3. Prepare Data for API using FormData
    const formDataToSubmit = new FormData();

    formDataToSubmit.append("name", formData.name);
    formDataToSubmit.append("description", formData.description);
    formDataToSubmit.append("price", formData.price.toString());
    formDataToSubmit.append("quantity", formData.quantity.toString());
    formDataToSubmit.append("status", formData.status || "active");
    formDataToSubmit.append(
      "sort_order",
      formData.sort_order?.toString() || "0"
    );

    // Convert dates to ISO strings if present
    if (formData.ticket_start_date) {
      formDataToSubmit.append(
        "ticket_start_date",
        toISOStringUTC(formData.ticket_start_date)
      );
    }
    if (formData.ticket_end_date) {
      formDataToSubmit.append(
        "ticket_end_date",
        toISOStringUTC(formData.ticket_end_date)
      );
    }

    // Add event edition IDs
    selectedEvents.forEach((id) => {
      formDataToSubmit.append("event_edition_ids[]", id.toString());
    });

    // Add NFT fields if enabled
    if (formData.is_nft_enabled) {
      formDataToSubmit.append("is_nft_enabled", "true");
      if (formData.nft_contract_address) {
        formDataToSubmit.append(
          "nft_contract_address",
          formData.nft_contract_address
        );
      }
      if (formData.nft_metadata) {
        formDataToSubmit.append("nft_metadata", formData.nft_metadata);
      }
    }

    // Add ticket logo file if selected
    if (formData.ticket_logo) {
      formDataToSubmit.append("ticket_logo", formData.ticket_logo);
    }

    // 4. API Call
    try {
      console.log("Submitting ticket data with FormData");
      await ticketService.createTicket(formDataToSubmit);
      setNotification({
        message: "Ticket created successfully!",
        type: "success",
      });

      setTimeout(() => {
        router.push("/admin/tickets");
      }, 500);
    } catch (error: any) {
      console.error("Ticket Creation Error:", error);
      console.error("Error details:", error?.data);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "An unexpected error occurred. Failed to create ticket.";
      setNotification({ message: errorMessage, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!token) return null; // Wait for redirect

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <div className="border-b bg-white dark:bg-gray-800">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/admin/tickets">
              <Button
                variant="ghost"
                size="sm"
                className="dark:text-white dark:hover:bg-gray-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Ticket
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Design and configure a new ticket type
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="max-w-5xl mx-auto space-y-8">
          {/* Notification Area */}
          {notification && (
            <div
              className={`p-4 rounded-lg flex items-center gap-3 ${
                notification.type === "success"
                  ? "bg-green-100 border border-green-300 text-green-800 dark:bg-green-900/30 dark:border-green-800 dark:text-green-300"
                  : "bg-red-100 border border-red-300 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300"
              }`}
            >
              <Info className="h-5 w-5 flex-shrink-0" />
              <p className="font-medium">{notification.message}</p>
            </div>
          )}

          {/* Main Form Card */}
          <Card className="border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-gray-700">
              <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                Ticket Details & Pricing
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-10">
                {/* Core Information Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Basic Information
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ticket Name */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Ticket Name *
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        placeholder="e.g., VIP Pass, General Admission"
                        className="h-11"
                      />
                    </div>

                    {/* Status */}
                    {/* Status */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="status"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Status *
                      </Label>
                      <Select
                        value={formData.status}
                        onValueChange={(
                          value: "active" | "inactive" | "sold_out" | "expired"
                        ) =>
                          setFormData((prev) => ({ ...prev, status: value }))
                        }
                      >
                        <SelectTrigger className="h-11" id="status">
                          <SelectValue placeholder="Select ticket status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                          <SelectItem value="sold_out">Sold Out</SelectItem>
                          <SelectItem value="expired">Expired</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Price */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="price"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Price (USD) *
                      </Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={handleInputChange}
                          required
                          min="0"
                          placeholder="0.00"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="quantity"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300"
                      >
                        Available Quantity *
                      </Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="quantity"
                          name="quantity"
                          type="number"
                          value={formData.quantity}
                          onChange={handleInputChange}
                          required
                          min="1"
                          placeholder="100"
                          className="pl-10 h-11"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-2 pt-4">
                    <Label
                      htmlFor="description"
                      className="text-sm font-medium text-gray-700 dark:text-gray-300"
                    >
                      Ticket Description
                    </Label>
                    <Textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Describe what's included with this ticket..."
                      className="resize-none"
                    />
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Media and Ordering Section */}
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                    Media & Ordering
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Ticket Logo */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="ticket_logo"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Ticket Logo / Image
                      </Label>
                      <Input
                        id="ticket_logo"
                        name="ticket_logo"
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="h-11 p-2"
                      />
                      {fileError && (
                        <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                          {fileError}
                        </p>
                      )}
                      {formData.ticket_logo && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                          File selected: {formData.ticket_logo.name}
                        </p>
                      )}
                    </div>

                    {/* Display Order */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="sort_order"
                        className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2"
                      >
                        <Hash className="h-4 w-4" />
                        Display Order
                      </Label>
                      <Input
                        id="sort_order"
                        name="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={handleInputChange}
                        min="0"
                        placeholder="0"
                        className="h-11"
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Lower numbers appear first.
                      </p>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                {/* Sale Period Section (Updated for date-only fields) */}

                <Separator className="my-8" />

                {/* NFT Settings Section */}
                {/* <div className="space-y-4"> */}
                {/* <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">NFT Configuration</h3>
                  </div> */}

                {/* <div className="space-y-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700"> */}
                {/* Toggle */}
                {/* <div className="flex items-center space-x-3">
                      <Checkbox
                        id="is_nft_enabled"
                        checked={formData.is_nft_enabled}
                        onCheckedChange={handleCheckboxChange}
                        className="border-gray-300 dark:border-gray-600 data-[state=checked]:bg-purple-600"
                      />
                      <Label htmlFor="is_nft_enabled" className="cursor-pointer font-medium text-gray-900 dark:text-white">
                        Enable NFT Ticket Generation
                      </Label>
                    </div> */}
                {/* <p className="text-sm text-gray-500 dark:text-gray-400 ml-7">Automatically mint an NFT upon purchase of this ticket type.</p> */}

                {/* Conditional NFT Fields */}
                {/* {formData.is_nft_enabled && (
                      <div className="grid grid-cols-1 gap-6 pt-4 border-t border-dashed border-gray-200 dark:border-gray-700 mt-4">
                        
                        {/* NFT Contract Address */}
                {/* <div className="space-y-2">
                          <Label htmlFor="nft_contract_address" className="text-sm font-medium text-gray-700 dark:text-gray-300">NFT Contract Address *</Label>
                          <Input
                            id="nft_contract_address"
                            name="nft_contract_address"
                            value={formData.nft_contract_address}
                            onChange={handleInputChange}
                            required={formData.is_nft_enabled}
                            placeholder="0x..."
                            className="h-11"
                          />
                        </div> */}

                {/* NFT Metadata (JSON) */}
                {/* <div className="space-y-2">
                          <Label htmlFor="nft_metadata" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            NFT Metadata (JSON) *
                          </Label>
                          <Textarea
                            id="nft_metadata"
                            name="nft_metadata"
                            value={formData.nft_metadata}
                            onChange={handleInputChange}
                            required={formData.is_nft_enabled}
                            rows={5}
                            placeholder='{"name": "Event VIP Ticket", "description": "Access all areas"}'
                            className="font-mono text-xs resize-none"
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-400">Must be a **valid JSON string** for the NFT token URI.</p>
                        </div> */}
                {/* </div> */}
                {/* )} */}
                {/* </div> */}
                {/* </div> */}

                <Separator className="my-8" />

                {/* Event Assignment Section */}
                {isClient && eventEditions.length > 0 && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                          <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                          Event Assignment
                        </h3>
                      </div>

                      <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Select Events *
                          </Label>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Current selection: **{selectedEvents.length}**
                            event(s)
                          </p>
                        </div>
                        <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                          {eventEditions.map((event) => (
                            <div
                              key={event.id}
                              className={`flex items-start space-x-3 p-3 rounded-md transition-colors ${
                                selectedEvents.includes(event.id)
                                  ? "bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"
                                  : "hover:bg-white dark:hover:bg-gray-700/50"
                              }`}
                            >
                              <Checkbox
                                id={`event-${event.id}`}
                                checked={selectedEvents.includes(event.id)}
                                onCheckedChange={() =>
                                  handleEventToggle(event.id)
                                }
                                className="mt-0.5 border-gray-300 dark:border-gray-600 data-[state=checked]:bg-blue-600"
                              />
                              <div className="flex-1 min-w-0">
                                <Label
                                  htmlFor={`event-${event.id}`}
                                  className="cursor-pointer font-medium text-gray-900 dark:text-white block"
                                >
                                  {event.event_name}
                                </Label>
                                <div className="text-xs text-gray-500 dark:text-gray-400 space-x-3 mt-1">
                                  <span>
                                    {event.venue_city}, {event.venue_state}
                                  </span>
                                  <span>•</span>
                                  <span className="font-mono">
                                    {event.event_start_date
                                      ? new Date(
                                          event.event_start_date
                                        ).toLocaleDateString()
                                      : "N/A"}
                                  </span>
                                  <span>•</span>
                                  <Badge
                                    variant="outline"
                                    className="text-xs py-0 px-1 font-medium"
                                  >
                                    {event.status}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <Separator className="my-8" />

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6">
                  <Link href="/admin/tickets" className="sm:order-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full sm:w-auto h-11"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    type="submit"
                    disabled={
                      loading || selectedEvents.length === 0 || !!fileError
                    }
                    className="w-full sm:w-auto h-11 bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700 sm:order-2"
                  >
                    {loading ? (
                      <>
                        <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating Ticket...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
