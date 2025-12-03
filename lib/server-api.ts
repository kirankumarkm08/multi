import { headers } from "next/headers";

// Server-side API function with custom headers support
export async function serverApiFetch(
  endpoint: string,
  options: RequestInit & { customHeaders?: Record<string, string> } = {}
) {
  // Use API_BASE_URL for server-side calls
  const API_URL =
    process.env.API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "https://api.testjkl.in/api";

  // Get the proper origin for server-side calls
  const ORIGIN = 
    process.env.APP_ORIGIN || 
    process.env.NEXT_PUBLIC_APP_ORIGIN || 
    "https://testjkl.in";

  const url = endpoint.startsWith("/")
    ? `${API_URL}${endpoint}`
    : `${API_URL}/${endpoint}`;

  // Extract custom headers from options
  const headersList = await headers();
  const domain =
    headersList.get("x-forwarded-host") ||
    headersList.get("host");

  const { customHeaders, ...fetchOptions } = options;

  console.log(`[Server API] Fetching: ${url}`, `Custom Headers:`, customHeaders);

  const response = await fetch(url, {
    ...fetchOptions,
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
      "Origin": domain || "localhost", // Fallback if domain is missing
      
      ...(options.headers || {}), // Allow overriding headers
    },
  });

  if (!response.ok) {
    console.error(`[Server API Error] ${response.status} at ${url}`);
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || response.statusText);
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  const data = await response.json();
  return data;
}