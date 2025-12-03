/**
 * Event Form Constants
 * Centralized configuration for event creation and editing forms
 */

// ============================================================================
// STATUS AND FEATURE OPTIONS
// ============================================================================

export const EVENT_STATUS_OPTIONS = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "cancelled", label: "Cancelled" },
] as const;

export const DEFAULT_STATUS = "published";

// ============================================================================
// IMAGE VALIDATION
// ============================================================================

export const IMAGE_VALIDATION = {
  VALID_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  MAX_SIZE: 5 * 1024 * 1024, // 5MB
  ACCEPT_STRING: "image/jpeg,image/jpg,image/png,image/gif,image/webp",
} as const;

// ============================================================================
// FORM FIELDS CONFIGURATION
// ============================================================================

export const BASIC_INFO_FIELDS = [
  {
    key: "event_name" as const,
    label: "Event Name *",
    placeholder: "Enter event name",
    type: "text" as const,
    required: true,
  },
  {
    key: "slug" as const,
    label: "Slug (Auto-generated)",
    placeholder: "event-slug",
    type: "text" as const,
    required: false,
  },
  {
    key: "description" as const,
    label: "Description *",
    placeholder: "Enter event description",
    type: "textarea" as const,
    required: true,
    rows: 4,
  },
] as const;

export const DATE_FIELDS = [
  {
    key: "start_date" as const,
    label: "Start Date *",
    type: "date" as const,
    required: true,
  },
  {
    key: "end_date" as const,
    label: "End Date *",
    type: "date" as const,
    required: true,
  },
] as const;

export const VENUE_FIELDS = [
  {
    key: "venue_name" as const,
    label: "Venue Name *",
    placeholder: "Enter venue name",
    type: "text" as const,
    required: true,
  },
  {
    key: "venue_address" as const,
    label: "Venue Address",
    placeholder: "Enter venue address",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_city" as const,
    label: "City",
    placeholder: "Enter city",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_state" as const,
    label: "State",
    placeholder: "Enter state",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_country" as const,
    label: "Country",
    placeholder: "Enter country",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_postal_code" as const,
    label: "Postal Code",
    placeholder: "Enter postal code",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_latitude" as const,
    label: "Latitude",
    placeholder: "12.0000",
    type: "text" as const,
    required: false,
  },
  {
    key: "venue_longitude" as const,
    label: "Longitude",
    placeholder: "77.0000",
    type: "text" as const,
    required: false,
  },
] as const;

export const IMAGE_FIELDS = [
  {
    key: "event_logo" as const,
    label: "Event Logo",
    type: "file" as const,
  },
  {
    key: "event_banner" as const,
    label: "Event Banner",
    type: "file" as const,
  },
] as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const EVENT_FORM_ERRORS = {
  REQUIRED_FIELDS: "Please fill in all required fields",
  EVENT_NAME_REQUIRED: "Event name is required",
  DESCRIPTION_REQUIRED: "Description is required",
  START_DATE_REQUIRED: "Start date is required",
  END_DATE_REQUIRED: "End date is required",
  VENUE_NAME_REQUIRED: "Venue name is required",
  INVALID_IMAGE_TYPE: "must be a valid image file (JPEG, PNG, GIF, or WebP)",
  IMAGE_TOO_LARGE: "must be less than 5MB",
  INVALID_DATE_FORMAT: "must be in the format YYYY-MM-DD",
  END_DATE_BEFORE_START: "End date cannot be before start date",
  INVALID_COORDINATES: "Latitude and longitude must be valid numbers",
  FAILED_TO_CREATE: "Failed to create event",
  VALIDATION_FAILED: "Validation failed",
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const EVENT_FORM_SUCCESS = {
  EVENT_CREATED: "Event created successfully",
  EVENT_UPDATED: "Event updated successfully",
  EVENT_DELETED: "Event deleted successfully",
} as const;

// ============================================================================
// DEFAULT FORM STATE
// ============================================================================

export const DEFAULT_EVENT_FORM_STATE = {
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
  status: DEFAULT_STATUS,
  start_date: "",
  end_date: "",
  is_featured: false,
  sort_order: "1",
  custom_fields: "",
  metadata: "",
  slug: "",
} as const;

// ============================================================================
// REGEX PATTERNS
// ============================================================================

export const PATTERNS = {
  DATE_FORMAT: /^\d{4}-\d{2}-\d{2}$/,
  SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  COORDINATES: /^-?\d+(\.\d+)?$/,
} as const;

// ============================================================================
// FORM CONFIGURATION
// ============================================================================

export const FORM_CONFIG = {
  SLUG_GENERATION_DELAY: 500, // milliseconds
  DEFAULT_SORT_ORDER: "1",
  DEFAULT_COORDINATES: "0.0",
} as const;
