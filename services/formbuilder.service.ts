import { apiFetch } from '@/lib/api-config';

export interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  order: number;
  options?: string[];
}

export interface FormConfig {
  fields: FormField[];
}

export interface FormBuilderData {
  name: string;
  form_type: string;
  form_config: FormConfig;
  status: 'published' | 'draft';
}

export interface FormBuilderResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    form_type: string;
    form_config: FormConfig;
    status: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
  };
}

class FormBuilderService {
  private baseUrl = '/tenant/forms-builder';

  async createForm(formData: FormBuilderData, token?: string): Promise<FormBuilderResponse> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(formData),
        token: token,
      });
      return response;
    } catch (error: any) {
      console.error('Error creating form:', error);
      throw error;
    }
  }

  async getForm(id: number, token?: string): Promise<FormBuilderResponse> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        token: token,
      });
      return response;
    } catch (error: any) {
      console.error('Error fetching form:', error);
      throw error;
    }
  }

  async getForms(token?: string): Promise<FormBuilderResponse[]> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'GET',
        token: token,
      });
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Error fetching forms:', error);
      return [];
    }
  }

  async updateForm(id: string, formData: Partial<FormBuilderData>, token?: string): Promise<FormBuilderResponse> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(formData),
        token: token,
       
      });
      return response;
    } catch (error: any) {
      console.error('Error updating form:', error);
      throw error;
    }
  }

  async deleteForm(id: number, token?: string): Promise<void> {
    try {
      await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        token: token,
      });
    } catch (error) {
      console.error('Error deleting form:', error);
      throw error;
    }
  }
}

export const formBuilderService = new FormBuilderService();
