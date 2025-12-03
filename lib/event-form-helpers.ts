/**
 * Event Form Utilities
 * Helper functions for event form operations: date handling, validation, payload building
 */

import { ExtendedEventFormData } from "@/types/event";
import { PATTERNS, IMAGE_VALIDATION, EVENT_FORM_ERRORS, FORM_CONFIG } from "@/constants/event-form";

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Clean date string to ensure pure YYYY-MM-DD format
 * Handles multiple input formats and ISO datetime strings
 */
export function cleanDate(dateString: string): string {
  if (!dateString) return "";

  // If it's already in pure YYYY-MM-DD format, return as is
  if (PATTERNS.DATE_FORMAT.test(dateString)) {
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
}

/**
 * Validate date format (YYYY-MM-DD)
 */
export function isValidDateFormat(dateString: string): boolean {
  return PATTERNS.DATE_FORMAT.test(dateString);
}

/**
 * Validate date logic (end date not before start date)
 */
export function isValidDateRange(startDate: string, endDate: string): boolean {
  try {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return end >= start;
  } catch {
    return false;
  }
}

// ============================================================================
// SLUG UTILITIES
// ============================================================================

/**
 * Generate slug from event name
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 */
export function generateSlug(eventName: string): string {
  if (!eventName.trim()) return "";

  return eventName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

/**
 * Validate slug format
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return true; // slug is optional
  return PATTERNS.SLUG.test(slug);
}

// ============================================================================
// FILE VALIDATION
// ============================================================================

/**
 * Validate image file type and size
 */
export function validateImageFile(file: File | null): { valid: boolean; error?: string } {
  if (!file) return { valid: true };

  // Validate file type
  if (!IMAGE_VALIDATION.VALID_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `File type "${file.type}" is not supported. ${EVENT_FORM_ERRORS.INVALID_IMAGE_TYPE}`,
    };
  }

  // Validate file size
  if (file.size > IMAGE_VALIDATION.MAX_SIZE) {
    return {
      valid: false,
      error: `File is ${(file.size / (1024 * 1024)).toFixed(2)}MB. ${EVENT_FORM_ERRORS.IMAGE_TOO_LARGE}`,
    };
  }

  return { valid: true };
}

// ============================================================================
// COORDINATE VALIDATION
// ============================================================================

/**
 * Validate latitude and longitude coordinates
 */
export function isValidCoordinate(value: string): boolean {
  if (!value) return true; // coordinates are optional
  const coord = parseFloat(value);
  return !isNaN(coord) && PATTERNS.COORDINATES.test(value);
}

/**
 * Validate latitude (-90 to 90)
 */
export function isValidLatitude(value: string): boolean {
  if (!value) return true;
  const lat = parseFloat(value);
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

/**
 * Validate longitude (-180 to 180)
 */
export function isValidLongitude(value: string): boolean {
  if (!value) return true;
  const lon = parseFloat(value);
  return !isNaN(lon) && lon >= -180 && lon <= 180;
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

/**
 * Validate entire form data
 * Returns { valid: boolean; errors: Record<string, string> }
 */
export function validateEventForm(formData: ExtendedEventFormData): {
  valid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  // Required fields
  if (!formData.event_name.trim()) {
    errors.event_name = EVENT_FORM_ERRORS.EVENT_NAME_REQUIRED;
  }

  if (!formData.description.trim()) {
    errors.description = EVENT_FORM_ERRORS.DESCRIPTION_REQUIRED;
  }

  if (!formData.venue_name.trim()) {
    errors.venue_name = EVENT_FORM_ERRORS.VENUE_NAME_REQUIRED;
  }

  // Dates
  if (!formData.start_date.trim()) {
    errors.start_date = EVENT_FORM_ERRORS.START_DATE_REQUIRED;
  }

  if (!formData.end_date.trim()) {
    errors.end_date = EVENT_FORM_ERRORS.END_DATE_REQUIRED;
  }

  if (formData.start_date && formData.end_date) {
    const cleanedStart = cleanDate(formData.start_date);
    const cleanedEnd = cleanDate(formData.end_date);

    if (!isValidDateFormat(cleanedStart)) {
      errors.start_date = EVENT_FORM_ERRORS.INVALID_DATE_FORMAT;
    }

    if (!isValidDateFormat(cleanedEnd)) {
      errors.end_date = EVENT_FORM_ERRORS.INVALID_DATE_FORMAT;
    }

    if (!isValidDateRange(cleanedStart, cleanedEnd)) {
      errors.end_date = EVENT_FORM_ERRORS.END_DATE_BEFORE_START;
    }
  }

  // Coordinates
  if (formData.venue_latitude && !isValidLatitude(formData.venue_latitude)) {
    errors.venue_latitude = "Latitude must be between -90 and 90";
  }

  if (formData.venue_longitude && !isValidLongitude(formData.venue_longitude)) {
    errors.venue_longitude = "Longitude must be between -180 and 180";
  }

  // Slug
  if (formData.slug && !isValidSlug(formData.slug)) {
    errors.slug = "Slug can only contain lowercase letters, numbers, and hyphens";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

// ============================================================================
// PAYLOAD BUILDING
// ============================================================================

interface PayloadOptions {
  includeFiles?: boolean;
}

/**
 * Build form payload (FormData or JSON) for API submission
 * Handles file uploads when present
 */
export function buildEventPayload(
  formData: ExtendedEventFormData,
  options: PayloadOptions = {}
): FormData | Record<string, any> {
  const { includeFiles = true } = options;

  // Clean dates
  const startDate = cleanDate(formData.start_date);
  const endDate = cleanDate(formData.end_date);

  const basePayload = {
    name: formData.event_name,
    event_name: formData.event_name,
    description: formData.description,
    venue_name: formData.venue_name,
    venue_address: formData.venue_address,
    venue_city: formData.venue_city,
    venue_state: formData.venue_state,
    venue_country: formData.venue_country,
    venue_postal_code: formData.venue_postal_code,
    venue_latitude: formData.venue_latitude || FORM_CONFIG.DEFAULT_COORDINATES,
    venue_longitude: formData.venue_longitude || FORM_CONFIG.DEFAULT_COORDINATES,
    status: formData.status,
    start_date: startDate,
    end_date: endDate,
    is_featured: formData.is_featured,
    sort_order: formData.sort_order,
    slug: formData.slug,
    custom_fields: formData.custom_fields || null,
    metadata: formData.metadata || null,
  };

  // Check if files are present
  const hasFiles =
    includeFiles && (formData.event_logo instanceof File || formData.event_banner instanceof File);

  if (!hasFiles) {
    return basePayload;
  }

  // Build FormData with files
  const formDataObj = new FormData();

  // Append all base fields
  Object.entries(basePayload).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      formDataObj.append(key, String(value));
    }
  });

  // Append files
  if (formData.event_logo instanceof File) {
    formDataObj.append("event_logo", formData.event_logo, formData.event_logo.name);
  }

  if (formData.event_banner instanceof File) {
    formDataObj.append("event_banner", formData.event_banner, formData.event_banner.name);
  }

  return formDataObj;
}

/**
 * Check if payload has files
 */
export function payloadHasFiles(formData: ExtendedEventFormData): boolean {
  return formData.event_logo instanceof File || formData.event_banner instanceof File;
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Parse API error response
 */
export function parseEventApiError(err: any): {
  message: string;
  fieldErrors?: Record<string, string>;
} {
  // Handle validation errors from API
  if (err?.data?.errors && typeof err.data.errors === "object") {
    const fieldErrors: Record<string, string> = {};
    Object.entries(err.data.errors).forEach(([field, messages]) => {
      fieldErrors[field] = Array.isArray(messages) ? messages.join(", ") : String(messages);
    });

    return {
      message: EVENT_FORM_ERRORS.VALIDATION_FAILED,
      fieldErrors,
    };
  }

  // Handle other errors
  return {
    message: err?.message || EVENT_FORM_ERRORS.FAILED_TO_CREATE,
  };
}
