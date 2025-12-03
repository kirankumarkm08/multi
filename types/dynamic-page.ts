export interface SubmitMessage {
  type: 'success' | 'error';
  text: string;
}

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  validation?: {
    pattern?: string;
    message?: string;
    minLength?: number;
    maxLength?: number;
  };
}

export interface FormConfig {
  fields: FormField[];
  submitLabel?: string;
  successMessage?: string;
  redirectUrl?: string;
}

// Re-exporting PageData from pagebuilder if it fits, or defining a compatible one here if needed.
// For now, let's define the specific shape expected by the new components to be safe, 
// or we can import PageData from ./pagebuilder and extend it if necessary.
// The user provided a specific PageData interface in the prompt, let's use that one or ensure compatibility.

export interface DynamicPageData {
  id: string | number;
  title: string;
  slug: string;
  meta_description?: string;
  keywords_string?: string;
  logo_url?: string;
  status: string;
  page_type?: string;
  layout_json?: string;
  form_config?: string;
  data?: any;
  [key: string]: any;
}
