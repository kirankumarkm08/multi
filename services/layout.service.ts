import { tenantApi, customerApi } from '@/lib/api';

export interface PageLayoutData {
  id: string;
  name: string;
  description: string;
  isHomeLayout: boolean;
  sections: Array<{
    id: string;
    name: string;
    type: "header" | "content" | "footer" | "custom";
    rows: Array<{
      id: string;
      columns: Array<{
        id: string;
        width: number;
        modules: Array<{
          id: string;
          name: string;
          description: string;
          icon: string;
          category: string;
          tags: string[];
          isPremium?: boolean;
          preview?: string;
          defaultProps?: Record<string, any>;
          blockId?: string | number;
        }>;
      }>;
    }>;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface LayoutServiceResult {
  success: boolean;
  data?: PageLayoutData;
  error?: any;
}

class LayoutService {

  /**
   * Validate and clean page data before sending to API
   */
  private validatePageData(pageData: any): any {
    // Ensure all required fields are present (slug is optional for updates)
    const requiredFields = ['title', 'page_type', 'status'];
    const missingFields = requiredFields.filter(field => !pageData[field]);

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Validate layout_json is a valid JSON string
    if (pageData.layout_json) {
      try {
        JSON.parse(pageData.layout_json);
      } catch (e) {
        throw new Error('Invalid layout_json format');
      }
    }

    // Ensure numeric fields are properly typed
    const cleanedData = {
      ...pageData,
      show_in_nav: Number(pageData.show_in_nav) || 0,
      show_in_footer: Number(pageData.show_in_footer) || 0,
      position: Number(pageData.position) || 1,
      parent_id: pageData.parent_id || null,
    };

    return cleanedData;
  }

  /**
   * Save landing page layout using API only
   */
  async saveLandingPageWithFallback(layoutData: PageLayoutData): Promise<LayoutServiceResult> {
    let landingPage: any = null;

    try {
      // Validate and clean the layout data
      const cleanedSections = layoutData.sections.map(section => ({
        ...section,
        rows: section.rows.map(row => ({
          ...row,
          columns: row.columns.map(column => ({
            ...column,
            modules: column.modules.map(module => ({
              ...module,
              blockId: module.blockId ? String(module.blockId) : undefined, // Ensure blockId is string
              defaultProps: module.defaultProps || {},
              isPremium: module.isPremium || false,
              tags: module.tags || [],
            }))
          }))
        }))
      }));

      // Check if landing page already exists first
      try {
        const existingPages = await tenantApi.getPages();

        if (Array.isArray(existingPages)) {
          landingPage = existingPages.find((page: any) =>
            page.page_type === 'landing' || page.slug === 'landing-page'
          );
        } else if (existingPages?.data && Array.isArray(existingPages.data)) {
          landingPage = existingPages.data.find((page: any) =>
            page.page_type === 'landing' || page.slug === 'landing-page'
          );
        }
      } catch (pagesError: any) {
        // Handle "No pages found" - this is normal for new tenants
        if (pagesError?.message?.includes('No pages found')) {
          console.log('No existing pages found - this is a new tenant');
          landingPage = null;
        } else {
          console.warn('Error checking existing pages:', pagesError);
          // Continue with creation attempt
          landingPage = null;
        }
      }

      // Prepare data for API - structure according to the API specification
      const pageData = {
        title: layoutData.name || 'Landing Page',
        page_type: 'landing',
        status: 'published',
        show_in_nav: 0,
        show_in_footer: 0,
        parent_id: null,
        position: 1,
        metadata: {},
        form_config: {},
        layout_json: JSON.stringify({
          sections: cleanedSections,
          meta: {
            isHomeLayout: layoutData.isHomeLayout,
            createdAt: layoutData.createdAt,
            updatedAt: new Date().toISOString(), // Always update the timestamp
          }
        })
      };

      // Only include slug for new pages, not updates to existing landing pages
      if (!landingPage?.id) {
        pageData.slug = layoutData.id || 'landing-page';
      }

      // Validate and clean the page data before sending
      const validatedPageData = this.validatePageData(pageData);

      // console.log('Attempting to save landing page via API:', validatedPageData);

      let response;
      if (landingPage?.id) {
        // Update existing landing page using PATCH
        console.log('Updating existing landing page with ID:', landingPage.id);
        response = await tenantApi.updatePage(landingPage.id, validatedPageData);
        console.log('Update response:', response);
      } else {
        // Create new landing page using POST
        console.log('Creating new landing page for tenant');
        response = await tenantApi.createPage(validatedPageData);
        console.log('Create response:', response);
      }

      return {
        success: true,
        data: {
          ...layoutData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Failed to save layout:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        data: error.data,
        response: error.response?.data,
        responseStatus: error.response?.status
      });

      // Additional logging for server errors
      if (error.status >= 500 || error.response?.status >= 500) {
        const operation = landingPage?.id ? 'update' : 'create';
        const endpoint = landingPage?.id ? `/api/tenant/pages/${landingPage.id}` : '/api/tenant/pages';
        const method = landingPage?.id ? 'PATCH' : 'POST';

        console.error('Server Error details:', {
          operation,
          endpoint,
          method,
          errorData: error.data,
          landingPageId: landingPage?.id
        });
      }

      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Load landing page layout using API only
   */
  async loadLandingPageWithFallback(): Promise<LayoutServiceResult> {
    try {
      console.log('Attempting to load landing page via API');

      // Try tenant API first (for admin/editor access)
      try {
        const pages = await tenantApi.getPages();
        let landingPage;

        if (Array.isArray(pages)) {
          landingPage = pages.find((page: any) =>
            page.page_type === 'landing' || page.slug === 'landing-page'
          );
        } else if (pages?.data && Array.isArray(pages.data)) {
          landingPage = pages.data.find((page: any) =>
            page.page_type === 'landing' || page.slug === 'landing-page'
          );
        }

        if (landingPage && landingPage.layout_json) {
          console.log('Loaded landing page from tenant API:', landingPage);

          const layoutJson = JSON.parse(landingPage.layout_json);

          if (layoutJson.sections && Array.isArray(layoutJson.sections)) {
            const pageLayoutData: PageLayoutData = {
              id: landingPage.slug || 'landing-page',
              name: landingPage.title || 'Landing Page',
              description: 'Landing page layout',
              isHomeLayout: layoutJson.meta?.isHomeLayout || true,
              sections: layoutJson.sections,
              createdAt: layoutJson.meta?.createdAt || landingPage.created_at,
              updatedAt: layoutJson.meta?.updatedAt || landingPage.updated_at,
            };

            return {
              success: true,
              data: pageLayoutData
            };
          }
        }
      } catch (tenantApiError: any) {
        if (tenantApiError?.message?.includes('No pages found')) {
          console.log('No pages found for tenant - this is normal for new installations');
        } else {
          console.warn('Tenant API failed:', tenantApiError);
        }
      }

      // Try customer API as fallback (only if landing page exists and is published)
      try {
        const landingPage = await customerApi.getPageByType('landing');

        if (landingPage && landingPage.layout_json) {
          console.log('Loaded landing page from customer API:', landingPage);

          const layoutJson = JSON.parse(landingPage.layout_json);

          if (layoutJson.sections && Array.isArray(layoutJson.sections)) {
            const pageLayoutData: PageLayoutData = {
              id: landingPage.slug || 'landing-page',
              name: landingPage.title || 'Landing Page',
              description: 'Landing page layout',
              isHomeLayout: layoutJson.meta?.isHomeLayout || true,
              sections: layoutJson.sections,
              createdAt: layoutJson.meta?.createdAt || landingPage.created_at,
              updatedAt: layoutJson.meta?.updatedAt || landingPage.updated_at,
            };

            return {
              success: true,
              data: pageLayoutData
            };
          }
        }
      } catch (apiError) {
        console.warn('Customer API load failed (expected if no landing page exists yet):', apiError);
      }

      // No data found - this is normal for new installations
      console.log('No existing landing page found - ready to create new one');
      return {
        success: true,
        data: undefined
      };

    } catch (error) {
      console.error('Failed to load layout:', error);
      return {
        success: false,
        error: error
      };
    }
  }


  /**
   * Save page layout using the tenant API
   */
  async savePageLayout(layoutData: PageLayoutData): Promise<any> {
    const payload = {
      title: layoutData.name,
      slug: layoutData.id,
      position: 1,
      show_in_nav: 1,
      show_in_footer: 0,
      parent_id: null,
      status: "published",
      metadata: {},
      page_type: "landing",
      form_config: {},
      layout_json: JSON.stringify({
        sections: layoutData.sections,
        meta: {
          isHomeLayout: layoutData.isHomeLayout,
          createdAt: layoutData.createdAt,
          updatedAt: layoutData.updatedAt,
        },
      }),
    };

    const response = await tenantApi.createPage(payload);

    if (!response) {
      throw new Error("Failed to save layout");
    }

    return response;
  }

  /**
   * Save layout for a specific page by ID
   */
  async savePageLayoutById(pageId: number, layoutData: PageLayoutData): Promise<LayoutServiceResult> {
    try {
      // Get the current page data
      const pageData = await tenantApi.getPageById(pageId);

      if (!pageData) {
        throw new Error('Page not found');
      }

      // Update only the layout_json field
      const updateData = {
        ...pageData,
        layout_json: JSON.stringify({
          sections: layoutData.sections,
          meta: {
            isHomeLayout: layoutData.isHomeLayout,
            createdAt: layoutData.createdAt,
            updatedAt: new Date().toISOString(),
          }
        })
      };

      console.log('Saving layout for page ID:', pageId, 'with data:', layoutData);
      const response = await tenantApi.updatePage(pageId, updateData);
      console.log('Layout save response:', response);

      return {
        success: true,
        data: {
          ...layoutData,
          updatedAt: new Date().toISOString()
        }
      };
    } catch (error: any) {
      console.error('Failed to save page layout:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Load layout for a specific page by ID
   */
  async loadPageLayoutById(pageId: number): Promise<LayoutServiceResult> {
    try {
      console.log('Loading layout for page ID:', pageId);
      const pageData = await tenantApi.getPageById(pageId);

      if (!pageData) {
        throw new Error('Page not found');
      }

      if (pageData.layout_json) {
        const layoutJson = JSON.parse(pageData.layout_json);

        if (layoutJson.sections && Array.isArray(layoutJson.sections)) {
          const pageLayoutData: PageLayoutData = {
            id: pageData.slug || `page-${pageId}`,
            name: pageData.title || 'Page',
            description: `Layout for ${pageData.title}`,
            isHomeLayout: layoutJson.meta?.isHomeLayout || false,
            sections: layoutJson.sections,
            createdAt: layoutJson.meta?.createdAt || pageData.created_at,
            updatedAt: layoutJson.meta?.updatedAt || pageData.updated_at,
          };

          return {
            success: true,
            data: pageLayoutData
          };
        }
      }

      // Return empty layout if no layout_json exists
      const emptyLayoutData: PageLayoutData = {
        id: pageData.slug || `page-${pageId}`,
        name: pageData.title || 'Page',
        description: `Layout for ${pageData.title}`,
        isHomeLayout: false,
        sections: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      return {
        success: true,
        data: emptyLayoutData
      };

    } catch (error: any) {
      console.error('Failed to load page layout:', error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Load landing page layout for customer-side (public) usage
   */
  async loadCustomerLandingPage(): Promise<LayoutServiceResult> {
    try {
      console.log('Loading landing page for customer view...');

      const landingPage = await customerApi.getLandingPage();

      if (landingPage && landingPage.layout_json) {
        console.log('Loaded landing page from customer API:', landingPage);

        const layoutJson = JSON.parse(landingPage.layout_json);

        if (layoutJson.sections && Array.isArray(layoutJson.sections)) {
          const pageLayoutData: PageLayoutData = {
            id: landingPage.slug || 'landing-page',
            name: landingPage.title || 'Landing Page',
            description: 'Landing page layout',
            isHomeLayout: layoutJson.meta?.isHomeLayout || true,
            sections: layoutJson.sections,
            createdAt: layoutJson.meta?.createdAt || landingPage.created_at,
            updatedAt: layoutJson.meta?.updatedAt || landingPage.updated_at,
          };

          return {
            success: true,
            data: pageLayoutData
          };
        }
      }

      // No data found
      console.log('No landing page found for customer');
      return {
        success: true,
        data: undefined
      };

    } catch (error: any) {
      console.error('Failed to load customer landing page:', error);

      // Handle 404 as expected for new installations
      if (error.response?.status === 404) {
        return {
          success: true,
          data: undefined
        };
      }

      return {
        success: false,
        error: error
      };
    }
  }
}

export const layoutService = new LayoutService();