"use client";

import { useState, useCallback } from "react";
import { ExtendedEventFormData } from "@/types/event";
import { DEFAULT_EVENT_FORM_STATE } from "@/constants/event-form";
import {
  cleanDate,
  generateSlug,
  validateImageFile,
  validateEventForm,
  buildEventPayload,
} from "@/lib/event-form-helpers";
import { eventService } from "@/services/event.service";

export interface UseEventFormReturn {
  formData: ExtendedEventFormData;
  error: string | null;
  loading: boolean;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  handleCheckboxChange: (name: string, checked: boolean) => void;
  handleFileChange: (name: keyof ExtendedEventFormData, file: File | null) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  setError: (error: string | null) => void;
  resetForm: () => void;
}

/**
 * Hook for managing event form state and operations
 * Handles form state, validation, file uploads, and API submission
 */
export function useEventForm(
  onSuccess?: (eventName: string) => void
): UseEventFormReturn {
  const [formData, setFormData] = useState<ExtendedEventFormData>(
    DEFAULT_EVENT_FORM_STATE as ExtendedEventFormData
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  /**
   * Handle text input and textarea changes
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;

      setFormData((prev) => {
        const updated = { ...prev, [name]: value };

        // Auto-generate slug when event_name changes
        if (name === "event_name") {
          updated.slug = generateSlug(value);
        }

        return updated;
      });

      // Clear error when user starts typing
      if (error) setError(null);
    },
    [error]
  );

  /**
   * Handle select dropdown changes
   */
  const handleSelectChange = useCallback((name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  }, [error]);

  /**
   * Handle checkbox changes
   */
  const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (error) setError(null);
  }, [error]);

  /**
   * Handle file input changes with validation
   */
  const handleFileChange = useCallback(
    (name: keyof ExtendedEventFormData, file: File | null) => {
      // Validate file if provided
      if (file) {
        const validation = validateImageFile(file);
        if (!validation.valid) {
          setError(validation.error || "Invalid file");
          return;
        }
      }

      setFormData((prev) => ({ ...prev, [name]: file }));
      if (error) setError(null);
    },
    [error]
  );

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validate form
      const validation = validateEventForm(formData);
      if (!validation.valid) {
        const errorMessages = Object.entries(validation.errors)
          .map(([field, msg]) => `${field}: ${msg}`)
          .join("\n");
        setError(errorMessages);
        setLoading(false);
        return;
      }

      // Build payload
      const payload = buildEventPayload(formData);

      // Submit to API
      const response = await eventService.createEvent(payload, "");

      // Call success callback
      if (onSuccess) {
        onSuccess(response.event_name || formData.event_name);
      }
    } catch (err: any) {
      console.error("Event creation error:", err);

      // Parse error message
      if (err?.data?.errors) {
        const errorMessages = Object.entries(err.data.errors)
          .map(
            ([field, messages]) =>
              `${field}: ${Array.isArray(messages) ? messages.join(", ") : messages}`
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

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(DEFAULT_EVENT_FORM_STATE as ExtendedEventFormData);
    setError(null);
  }, []);

  return {
    formData,
    error,
    loading,
    handleInputChange,
    handleSelectChange,
    handleCheckboxChange,
    handleFileChange,
    handleSubmit,
    setError,
    resetForm,
  };
}
