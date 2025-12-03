export interface PageField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
  order: number;
}

export interface FormConfig {
  fields: PageField[];
}

export interface PageMetadata {
  description?: string;
}

export interface PageData {
  id: string;
  title: string;
  status: string;
  page_type: string;
  form_config?: string;
  metadata?: PageMetadata;
  page_layout?: {
    layout_json: string;
  };
  layout_json?: string;
  data?: any;
}

export interface SubmitMessage {
  type: 'success' | 'error';
  text: string;
}