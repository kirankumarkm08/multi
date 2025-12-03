export interface Module {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  category?: string;
  tags?: string[];
  defaultProps?: Record<string, any>;
  blockId?: number;
}

export interface Column {
  id: string;
  width: number;
  modules?: Module[];
}

export interface Row {
  id: string;
  columns?: Column[];
}

export interface Section {
  id: string;
  name: string;
  type: "header" | "content" | "footer";
  rows?: Row[];
}

export interface Layout {
  sections: Section[];
}
