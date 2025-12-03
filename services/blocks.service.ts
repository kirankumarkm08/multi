import { apiFetch } from '@/lib/api-config';

export interface BlockData {
  name: string;
  content: string;
  content_type: 'text' | 'html';
  status: 'published' | 'draft';
}

export interface BlockResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    content: string;
    content_type: string;
    status: string;
    tenant_id: string;
    created_at: string;
    updated_at: string;
  };
}

class BlocksService {
  private baseUrl = '/tenant/blocks';

  async createBlock(blockData: BlockData, token?: string): Promise<BlockResponse> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'POST',
        body: JSON.stringify(blockData),
        token: token,
      });
      return response;
    } catch (error: any) {
      console.error('Error creating block:', error);
      throw error;
    }
  }

  async updateBlock(id: number, blockData: Partial<BlockData>, token?: string): Promise<BlockResponse> {
    try {
      const response = await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(blockData),
        token: token,
      });
      return response;
    } catch (error: any) {
      console.error('Error updating block:', error);
      throw error;
    }
  }

  async getBlocks(token?: string): Promise<BlockResponse[]> {
    try {
      const response = await apiFetch(this.baseUrl, {
        method: 'GET',
        token: token,
      });
      return Array.isArray(response) ? response : response.data || [];
    } catch (error) {
      console.error('Error fetching blocks:', error);
      return [];
    }
  }

  async deleteBlock(id: number, token?: string): Promise<void> {
    try {
      await apiFetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        token: token,
      });
    } catch (error) {
      console.error('Error deleting block:', error);
      throw error;
    }
  }
}

export const blocksService = new BlocksService();