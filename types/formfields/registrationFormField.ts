interface RegisterFormField {
    id: string;
    name: string;
    label: string;
    type:
      | "text"
      | "email"
      | "tel"
      | "number"
      | "textarea"
      | "select"
      | "checkbox"
      | "radio"
      | "password";
    required: boolean;
    placeholder?: string;
    options?: string[];
    order: number;
  }
  
  interface PageSettings {
    submitButtonText: string;
    successMessage: string;
    redirectUrl?: string;
    show_in_nav: boolean; // Add show_in_nav here at page level
  }
  
  interface RegistrationPage {
    id: string;
    title: string;
    slug: string;
    page_type: string;
    form_config: RegisterFormField[];
    settings: PageSettings;
    status: "draft" | "published" | "archived";
  }

   export type {RegisterFormField,PageSettings,RegistrationPage}