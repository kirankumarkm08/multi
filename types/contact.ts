export interface ContactPageSettings {
    nameLabel: string;
    emailLabel: string;
    messageLabel: string;
    submitButtonText: string;
    recipientEmail: string;
  }
  
  export interface ContactPage {
    id: string;
    name: string;
    slug: string;
    title: string;
    description: string;
    meta_description?: string;
    meta_keywords?: string;
    show_in_nav?: number;
    settings: ContactPageSettings;
  }
  
  export interface ContactPageListItem {
    id: string;
    name: string;
    slug: string;
  }