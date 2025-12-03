export async function apiFetch(
  endpoint: string,
  options: RequestInit & { token?: string; origin?: string } = {}
) {
  const API_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.testjkl.in/api";

  // Use direct API URL
  const url = endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;

  // Token priority: explicit token > localStorage token > no token
  const tokenFromStorage =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
  const token = options.token ?? tokenFromStorage;

  // Get origin dynamically from window.location or use provided origin
  const origin =
    options.origin ??
    (typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_SITE_URL || "https://testjkl.in/");

  // Don't set Content-Type for FormData - browser will set it with boundary
  const isFormData = options.body instanceof FormData;

  const defaultHeaders: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    Accept: "application/json",
    Origin: origin,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...(options.headers || {}) },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || response.statusText);
    (error as any).status = response.status;
    (error as any).data = errorData;
    (error as any).url = url;
    (error as any).method = options.method || "GET";

    // Additional logging for server errors
    if (response.status >= 500) {
      console.error(
        `Server Error ${response.status} at ${options.method || "GET"} ${url}:`,
        {
          status: response.status,
          statusText: response.statusText,
          errorData,
          requestHeaders: options.headers,
          requestBody: options.body,
        }
      );
    }

    throw error;
  }

  return response.json();
}
