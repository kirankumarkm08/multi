export interface TenantBranding {
  tenant_name: string;
  logo_url: string;
  favicon_url: string;
  primary_color?: string;
  secondary_color?: string;
}

export interface NavigationItem {
  id: number;
  title: string;
  slug: string;
  page_type: string;
  is_published: boolean;
}

export interface NavigationResponse {
  data: {
    navigation: NavigationItem[];
    tenant: TenantBranding;
  };
}

export interface LandingPageData {
  id: number;
  title: string;
  slug: string;
  meta_description?: string;
  keywords_string?: string;
  page_type: string;
  // Add other fields as needed
}

export interface LandingPageResponse {
  data: LandingPageData;
}
