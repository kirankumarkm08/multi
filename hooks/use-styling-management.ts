import { RowStyling, ColumnStyling, Section } from '@/types/pagebuilder';

export function useStylingManagement(setSections: React.Dispatch<React.SetStateAction<Section[]>>) {
  
  const updateRowStyling = (sectionId: string, rowId: string, styling: RowStyling) => {
    setSections((prevSections) => 
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id !== rowId) return row;
            return {
              ...row,
              styling: styling
            };
          })
        };
      })
    );
  };

  const updateColumnStyling = (sectionId: string, rowId: string, columnId: string, styling: ColumnStyling) => {
    setSections((prevSections) => 
      prevSections.map((section) => {
        if (section.id !== sectionId) return section;
        
        return {
          ...section,
          rows: section.rows.map((row) => {
            if (row.id !== rowId) return row;
            
            return {
              ...row,
              columns: row.columns.map((col) => {
                if (col.id !== columnId) return col;
                return {
                  ...col,
                  styling: styling
                };
              })
            };
          })
        };
      })
    );
  };

  return {
    updateRowStyling,
    updateColumnStyling
  };
}
