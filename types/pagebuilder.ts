// Page Builder Types

export interface Module {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  tags?: string[];
  isPremium?: boolean;
  preview?: string;
  defaultProps?: Record<string, any>;
  blockId?: string | number;
}

export interface LandingPageData {
  data: {
    id: number;
    title: string;
    slug: string;
    status: string;
    created_at: string;
    updated_at: string;
    page_layout: { layout_json: string };
  };
}

export interface RowStyling {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  backgroundRepeat?: 'repeat' | 'repeat-x' | 'repeat-y' | 'no-repeat';
  padding?: string;
  margin?: string;
  minHeight?: string;
  maxHeight?: string;
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: string;
  boxShadow?: string;
  opacity?: number;
}

export interface ColumnStyling {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: 'cover' | 'contain' | 'auto';
  backgroundPosition?: string;
  padding?: string;
  margin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  verticalAlign?: 'top' | 'middle' | 'bottom';
  borderColor?: string;
  borderWidth?: string;
  borderStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  borderRadius?: string;
  boxShadow?: string;
  opacity?: number;
}

export interface ColumnStyle {
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: string;
  padding?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  margin?: {
    top: string;
    right: string;
    bottom: string;
    left: string;
  };
  borderRadius?: string;
  border?: string;
  boxShadow?: string;
  textAlign?: "left" | "center" | "right" | "justify";
  customCSS?: string;
}

export interface RowStyle extends ColumnStyle {
  minHeight?: string;
  verticalAlign?: "top" | "middle" | "bottom";
  gap?: string; // gap between columns
}

export interface Column {
  id: string;
  width: number;
  modules: Module[];
  style?: ColumnStyle;
  styling?: ColumnStyling;
}

export interface Row {
  id: string;
  columns: Column[];
  style?: RowStyle;
  styling?: RowStyling;
  // Keep settings for backward compatibility if needed, or remove if we are fully migrating
  settings?: any; 
}

export interface Section {
  id: string;
  name: string;
  type: "header" | "content" | "footer" | "custom";
  rows: Row[];
  style?: ColumnStyle; // Section-level styling
  styling?: RowStyling;
}

export interface PageData {
  id?: number;
  tenant_id?: string;
  title: string;
  slug: string;
  parent_id?: number | null;
  position?: number;
  show_in_nav?: number;
  show_in_footer?: number;
  status: "draft" | "published" | "archived";
  page_type: string;
  metadata?: any;
  created_by_id?: number;
  created_by_type?: string;
  updated_by_id?: number | null;
  updated_by_type?: string | null;
  created_at?: string;
  updated_at?: string;
  layout_json?: string;
  form_config?: any;
  page_layout?: {
    id: number;
    page_id: string;
    page_slug: string;
    layout_json: string;
    created_at: string;
    updated_at: string;
  };
}

export interface PageSettings {
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  meta_description?: string;
  meta_keywords?: string;
}

export interface TargetColumn {
  sectionId: string;
  rowId: string;
  columnId: string;
}

export interface ModuleLibraryState {
  isOpen: boolean;
  targetColumn?: TargetColumn;
}

export interface BlocksPopupState {
  isOpen: boolean;
  targetColumn?: TargetColumn;
}

export interface ExternalPageSettings {
  title: string;
  slug: string;
  status: string;
  description?: string;
  name?: string;
  show_in_nav?: number;
  settings?: any;
}

export interface BuilderCanvasProps {
  pageId?: number;
  pageType?: string;
  initialPageData?: PageData;
  externalPageSettings?: ExternalPageSettings;
  onPageSettingsChange?: (settings: PageSettings) => void;
  onSaveSuccess?: (pageData: PageData) => void;
  onSaveError?: (error: string) => void;
}

export const DEFAULT_ROW_STYLING: RowStyling = {
  backgroundColor: '#ffffff',
  padding: '0px',
  margin: '0px',
  minHeight: 'auto',
  borderColor: '#e0e0e0',
  borderWidth: '0px',
  borderStyle: 'solid',
  borderRadius: '0px',
  boxShadow: 'none',
  opacity: 1,
};

export const DEFAULT_COLUMN_STYLING: ColumnStyling = {
  backgroundColor: 'transparent',
  padding: '0px',
  margin: '0px',
  textAlign: 'left',
  verticalAlign: 'top',
  borderColor: '#e0e0e0',
  borderWidth: '0px',
  borderStyle: 'solid',
  borderRadius: '0px',
  boxShadow: 'none',
  opacity: 1,
};

// Default sections constant
export const DEFAULT_SECTIONS: Section[] = [
  {
    id: "header-section",
    name: "Header Section",
    type: "header",
    styling: DEFAULT_ROW_STYLING,
    rows: [
      {
        id: "header-row-1",
        styling: DEFAULT_ROW_STYLING,
        columns: [
          {
            id: "header-col-1",
            width: 100,
            styling: DEFAULT_COLUMN_STYLING,
            modules: [],
          },
        ],
      },
    ],
  },
  {
    id: "content-section",
    name: "Content Section",
    type: "content",
    styling: DEFAULT_ROW_STYLING,
    rows: [
      {
        id: "content-row-1",
        styling: DEFAULT_ROW_STYLING,
        columns: [
          {
            id: "content-col-1",
            width: 100,
            styling: DEFAULT_COLUMN_STYLING,
            modules: [],
          },
        ],
      },
    ],
  },
  {
    id: "footer-section",
    name: "Footer Section",
    type: "footer",
    styling: DEFAULT_ROW_STYLING,
    rows: [
      {
        id: "footer-row-1",
        styling: DEFAULT_ROW_STYLING,
        columns: [
          {
            id: "footer-col-1",
            width: 100,
            styling: DEFAULT_COLUMN_STYLING,
            modules: [],
          },
        ],
      },
    ],
  },
];
