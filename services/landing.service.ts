// services/layout.service.ts
import { PageLayoutData, Section } from '@/types/pagebuilder';

export class LandingService {
  private basePath: string = '/';
  
  constructor(basePath?: string) {
    if (basePath) {
      this.basePath = basePath;
    }
  }

  setBasePath(path: string) {
    this.basePath = path;
  }

  async savePageLayout(pageId: string | number, sections: Section[], pageData: any) {
    const layoutData: PageLayoutData = {
      id: `page-${pageId}`,
      name: pageData.title,
      description: `Layout for ${pageData.title}`,
      isHomeLayout: pageData.page_type === "landing",
      sections,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      path: this.basePath // Include path in layout data
    };

    // Your existing save logic here
    const result = await this.saveToDatabase(layoutData);
    
    if (result.success) {
      // Update URL or navigation state
      this.updatePagePath(pageId, this.basePath);
    }
    
    return result;
  }

  private async saveToDatabase(layoutData: PageLayoutData) {
    // Your existing database save logic
    return { success: true, data: layoutData };
  }

  private updatePagePath(pageId: string | number, path: string) {
    // Update browser URL or application state
    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', path);
    }
  }
}

export const layoutService = new LandingService();