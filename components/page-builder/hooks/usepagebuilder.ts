// hooks/usePageBuilder.ts
import { useState, useCallback, useRef } from 'react';
import { Section, PageData, ModuleConfig } from '@/types';

export const usePageBuilder = (initialPageData?: PageData) => {
  const [sections, setSections] = useState<Section[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const idCounter = useRef(1000);
  
  const generateId = useCallback((prefix: string) => {
    idCounter.current += 1;
    return `${prefix}-${idCounter.current}`;
  }, []);

  const createNewSection = useCallback((type: Section['type'] = 'custom'): Section => {
    const sectionTypes = {
      header: { name: 'Header Section', rows: 1, columns: [100] },
      content: { name: 'Content Section', rows: 1, columns: [100] },
      footer: { name: 'Footer Section', rows: 1, columns: [100] },
      custom: { name: 'New Section', rows: 1, columns: [50, 50] }
    };

    const config = sectionTypes[type];
    
    return {
      id: generateId('section'),
      name: config.name,
      type,
      rows: Array.from({ length: config.rows }, (_, rowIndex) => ({
        id: generateId('row'),
        columns: config.columns.map((width, colIndex) => ({
          id: generateId('col'),
          width,
          modules: []
        }))
      })),
      metadata: {
        isDeletable: type !== 'header',
        isDuplicatable: true,
        maxRows: type === 'header' ? 1 : undefined
      }
    };
  }, [generateId]);

  const addSection = useCallback((type?: Section['type']) => {
    const newSection = createNewSection(type);
    setSections(prev => [...prev, newSection]);
    return newSection;
  }, [createNewSection]);

  const duplicateSection = useCallback((sectionId: string) => {
    setSections(prev => prev.map(section => {
      if (section.id === sectionId) {
        const newSection: Section = {
          ...section,
          id: generateId('section'),
          name: `${section.name} Copy`,
          rows: section.rows.map(row => ({
            ...row,
            id: generateId('row'),
            columns: row.columns.map(col => ({
              ...col,
              id: generateId('col'),
              modules: col.modules.map(module => ({
                ...module,
                id: generateId(module.id.split('-')[0])
              }))
            }))
          }))
        };
        return newSection;
      }
      return section;
    }));
  }, [generateId]);

  return {
    sections,
    setSections,
    isSaving,
    setIsSaving,
    generateId,
    addSection,
    duplicateSection,
    createNewSection
  };
};