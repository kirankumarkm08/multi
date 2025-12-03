/**
 * Hook for loading and managing available blocks and forms
 * Keeps data loading logic separate and reusable
 */

import { useState, useCallback } from "react";
import { blocksService } from "@/services/blocks.service";
import { formBuilderService } from "@/services";
import { toast } from "@/hooks/use-toast";

export interface AvailableBlock {
  id: string | number;
  name: string;
  content: string;
  content_type: string;
  status: string;
}

export interface AvailableForm {
  id: string | number;
  name: string;
  description?: string;
  form_type: string;
  form_config: Record<string, any>;
  status: string;
}

export interface DataLoaderState {
  availableBlocks: AvailableBlock[];
  availableForms: AvailableForm[];
  loadError: string | null;
  isLoadingBlocks: boolean;
  isLoadingForms: boolean;
}

export interface DataLoaderActions {
  loadAvailableBlocks: () => Promise<void>;
  loadAvailableForms: () => Promise<void>;
  clearError: () => void;
}

export function useBuilderDataLoader(): [DataLoaderState, DataLoaderActions] {
  const [availableBlocks, setAvailableBlocks] = useState<AvailableBlock[]>([]);
  const [availableForms, setAvailableForms] = useState<AvailableForm[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoadingBlocks, setIsLoadingBlocks] = useState(false);
  const [isLoadingForms, setIsLoadingForms] = useState(false);

  const loadAvailableBlocks = useCallback(async () => {
    setIsLoadingBlocks(true);
    try {
      const blocks = await blocksService.getBlocks();

      if (!Array.isArray(blocks)) {
        setAvailableBlocks([]);
        return;
      }

      const publishedBlocks = blocks
        .filter((block: any) => {
          const blockData = block.data || block;
          return blockData?.status === "published";
        })
        .map((block: any) => {
          const blockData = block.data || block;
          return {
            id: blockData.id,
            name: blockData.name || "Untitled Block",
            content: blockData.content || "",
            content_type: blockData.content_type || "html",
            status: blockData.status,
          };
        })
        .filter(Boolean);

      setAvailableBlocks(publishedBlocks);
    } catch (error) {
      console.error("Error loading blocks:", error);
      const errorMessage = "Failed to load blocks";
      setLoadError((prev) =>
        prev ? `${prev}; ${errorMessage}` : errorMessage
      );
      setAvailableBlocks([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingBlocks(false);
    }
  }, []);

  const loadAvailableForms = useCallback(async () => {
    setIsLoadingForms(true);
    try {
      const forms = await formBuilderService.getForms();

      if (!Array.isArray(forms)) {
        setAvailableForms([]);
        return;
      }

      const publishedForms = forms
        .filter((form: any) => {
          const formData = form.data || form;
          return formData?.status === "published";
        })
        .map((form: any) => {
          const formData = form.data || form;

          // Parse form_config if it's a string
          let parsedFormConfig = formData.form_config || { fields: [] };
          if (typeof parsedFormConfig === "string") {
            try {
              parsedFormConfig = JSON.parse(parsedFormConfig);
            } catch (e) {
              console.error("Error parsing form_config:", e);
              parsedFormConfig = { fields: [] };
            }
          }

          return {
            id: formData.id,
            name: formData.name || "Untitled Form",
            description: formData.description || "",
            form_type: formData.form_type || "",
            form_config: parsedFormConfig,
            status: formData.status,
          };
        })
        .filter(Boolean);

      setAvailableForms(publishedForms);
    } catch (error) {
      console.error("Error loading forms:", error);
      const errorMessage = "Failed to load forms";
      setLoadError((prev) =>
        prev ? `${prev}; ${errorMessage}` : errorMessage
      );
      setAvailableForms([]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoadingForms(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setLoadError(null);
  }, []);

  const state: DataLoaderState = {
    availableBlocks,
    availableForms,
    loadError,
    isLoadingBlocks,
    isLoadingForms,
  };

  const actions: DataLoaderActions = {
    loadAvailableBlocks,
    loadAvailableForms,
    clearError,
  };

  return [state, actions];
}
