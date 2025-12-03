import { apiFetch } from "./api-config";

const TENANT_BASE = "/tenant";
const CUSTOMER_BASE = "/guest";

export const tenantApi = {
  login: (data: { email: string; password: string; recaptcha_token?: string }) =>
    apiFetch(`${TENANT_BASE}/login`, {
      method: "POST",
      body: JSON.stringify(data),
    }),

  logout: () =>
    apiFetch(`${TENANT_BASE}/logout`, {
      method: "POST",
    }),

  getPages: (token?: string) => apiFetch(`${TENANT_BASE}/pages`, { token }),
  getPageById: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/${id}`, { token }),
  getPageByType: (formType: string, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/type/${formType}`, { token }),
  getLandingPage: (token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/type/landing`, { token }),

  createPage: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updatePage: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deletePage: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/pages/${id}`, {
      method: "DELETE",
      token,
    }),

  getEvents: (token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition`, { token }),
  getEventsForTickets: (token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition?for_tickets=true`, { token }),
  getEventById: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition/${id}`, { token }),

  createEvent: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition`, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    }),

  updateEvent: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    }),

  deleteEvent: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-edition/${id}`, {
      method: "DELETE",
      token,
    }),

  getLogo: () => apiFetch(`${TENANT_BASE}/common/tenant/branding`),

  getDashboard: (token?: string) =>
    apiFetch(`${TENANT_BASE}/dashboard`, { token }),

  getSubmissions: (token: string, submissionId: number) =>
    apiFetch(`${TENANT_BASE}/forms-builder/${submissionId}/submissions`, {
      token,
    }),

  // Ticket Management
  getTickets: () => apiFetch(`${TENANT_BASE}/ticket`),
  getTicketById: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket/${id}`, { token }),

  createTicket: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket`, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      token,
    }),

  updateTicket: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
      token,
    }),

  deleteTicket: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/ticket/${id}`, {
      method: "DELETE",
      token,
    }),

  // Speakers Management
  getSpeakers: (token?: string) =>
    apiFetch(`${TENANT_BASE}/event-participants`, { token }),
  getSpeakerById: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-participants/${id}`, { token }),

  createSpeaker: (data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-participants`, {
      method: "POST",
      body: data instanceof FormData ? data : JSON.stringify(data),
      token,
    }),

  updateSpeaker: (id: number, data: any, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-participants/${id}`, {
      method: "PUT",
      body: data instanceof FormData ? data : JSON.stringify(data),
      token,
    }),

  deleteSpeaker: (id: number, token?: string) =>
    apiFetch(`${TENANT_BASE}/event-participants/${id}`, {
      method: "DELETE",
      token,
    }),
};

export const customerApi = {
  getPages: (token?: string) => apiFetch(`${CUSTOMER_BASE}/pages`, { token }),
  getPageBySlug: (slug: string, token?: string) =>
    apiFetch(`${CUSTOMER_BASE}/pages/${slug}`, { token }),
  getNavigationPages: (token?: string) =>
    apiFetch(`${CUSTOMER_BASE}/pages/navigation`, { token }),
  getRegisterPage: (token?: string) =>
    apiFetch(`${CUSTOMER_BASE}/pages/type/register`, { token }),
  getContactPage: (token?: string) =>
    apiFetch(`${CUSTOMER_BASE}/pages/contact-us`, { token }),
  getPageByType: (type: string, token?: string) =>
    apiFetch(`${CUSTOMER_BASE}/pages/type/${type}`, { token }),
  getLandingPage: () => apiFetch(`${CUSTOMER_BASE}/pages/type/landing`),
  getEvents: () => apiFetch(`${CUSTOMER_BASE}/events/editions`),
  getFeaturedEvents: () =>
    apiFetch(`${CUSTOMER_BASE}/events/editions?featured=true`),
  getNonFeaturedEvents: () =>
    apiFetch(`${CUSTOMER_BASE}/events/editions?featured=false`),
  getTickets: () => apiFetch(`${CUSTOMER_BASE}/tickets`),
  getEventParticipants: () =>
    apiFetch(`${CUSTOMER_BASE}/events/participants/speaker`),
  getEventParticipantById: (id: number) =>
    apiFetch(`${CUSTOMER_BASE}/event-participants/${id}`),
};
