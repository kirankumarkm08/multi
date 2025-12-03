export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags: string[];
  isPremium?: boolean;
  preview?: string;
  defaultProps?: Record<string, any>;
  blockId?: string;
}

export interface Column {
  id: string;
  width: number;
  modules: Module[];
}

export interface Row {
  id: string;
  columns: Column[];
}

export interface Section {
  id: string;
  name: string;
  type: "header" | "content" | "footer" | "custom";
  rows: Row[];
}

export interface PageLayout {
  id: string;
  name: string;
  description: string;
  isHomeLayout: boolean;
  sections: Section[];
  createdAt: string;
  updatedAt: string;
}

export interface PageRendererProps {
  layoutId?: string;
  className?: string;
  landingPageData?: {
    id: string;
    title: string;
    slug: string;
    layout_json: string;
    status: string;
    created_at: string;
    updated_at: string;
    page_layout?: {
      layout_json: string;
    };
  } | null;
}
