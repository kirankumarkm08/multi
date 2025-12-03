// src/types/navigation.ts

export interface NavItem {
  label: string;
  href: string;
  page_type?: string;
}

export interface TenantConfig {
  tenant_name?: string;
  logo_url?: string; // Corrected to logo_url based on usage
  show_wallet: boolean; // Assuming these are tenant-specific flags
  show_add_to_cart: boolean;
}

export interface NavbarProps {
  pages: NavItem[];
  tenantConfig: TenantConfig;
}

// tenant data
export interface TenantData {
  navigation: NavItem[];
  tenant: TenantConfig;
}
