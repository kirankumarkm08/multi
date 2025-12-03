// src/services/cart.service.ts
 
import { CartData, CartItem, AddItemPayload } from "@/types";
 
// --- Configuration ---
// const BASE_URL = "http://127.0.0.1:8000/api/guest/cart";
// const CART_ITEMS_URL = "http://127.0.0.1:8000/api/guest/cart/items";
 
const BASE_URL = "https://api.testjkl.in/api/guest/cart";
const CART_ITEMS_URL = "https://api.testjkl.in/api/guest/cart/items";
const GUEST_ID_KEY = "guest_id";
 
// --- Local Storage Helpers ---
const getGuestId = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(GUEST_ID_KEY);
};
 
const setGuestId = (id: string) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(GUEST_ID_KEY, id);
  }
};
 
const removeGuestId = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(GUEST_ID_KEY);
  }
};
 
// Generate a temporary frontend guest ID
const generateGuestId = (): string =>
  `guest_${Math.random().toString(36).substring(2, 9)}${Date.now().toString(
    36
  )}`;
 
// --- Helper functions ---
const safeParseFloat = (value: string | number | null | undefined): number =>
  parseFloat(String(value || 0)) || 0;
const safeParseInt = (value: string | number | null | undefined): number =>
  parseInt(String(value || 0), 10) || 0;
 
const createEmptyCart = (guestId: string): CartData => ({
  id: `guest-cart-${guestId}`,
  guestId,
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  currency: "USD",
});
 
// --- API Response Types ---
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T[];
}
 
interface ApiCart {
  cart_id: number;
  guest_id: string;
  customer_id: number | null;
  items: ApiCartItem[];
  summary: ApiSummary;
  coupon: string | null;
  expires_at: string;
}
 
interface ApiCartItem {
  ticket_id: number;
  name: string;
  description: string;
  price: string;
  quantity: string | number;
  total_price: number;
  ticket_logo: string;
  is_nft_enabled: number;
  ticket_start_date: string;
  ticket_end_date: string;
  added_at: string;
}
 
interface ApiSummary {
  subtotal: string;
  discount: number;
  tax_amount: string;
  total_amount: string;
  currency: string;
  item_count: number;
  items_total: number;
}
 
// --- Cart Service ---
export class CartService {
  private static isInitialized = false;
  private static initializationPromise: Promise<string> | null = null;
  private static pendingRequests: (() => void)[] = [];
 
  // --- Initialize service once per session ---
  public static async initialize(): Promise<string> {
    if (this.isInitialized && getGuestId()) return getGuestId()!;
 
    if (!this.initializationPromise) {
      this.initializationPromise = (async () => {
        let guestId = getGuestId();
        if (!guestId) {
          guestId = generateGuestId();
          setGuestId(guestId);
          console.log("🆔 Generated temporary frontend guest ID:", guestId);
 
          // Initialize cart with backend on first load
          try {
            await this.fetchCart();
          } catch (error) {
            console.log("Initial cart fetch completed");
          }
        } else {
          console.log("🆔 Using existing guest ID from localStorage:", guestId);
        }
 
        this.isInitialized = true;
        this.pendingRequests.forEach((cb) => cb());
        this.pendingRequests = [];
        return guestId;
      })();
    }
 
    return this.initializationPromise;
  }
 
  // --- Ensure initialization before requests ---
  private static async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      return new Promise((resolve) => {
        this.pendingRequests.push(resolve);
        this.initialize();
      });
    }
  }
 
  // --- Centralized API request ---
  private static async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T | null> {
    await this.ensureInitialized();
 
    const guestId = getGuestId();
    if (!guestId) throw new Error("Guest ID not initialized");
 
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Guest-ID": guestId, // Send guest ID in header
    };
 
    // Remove Content-Type for form data
    if (
      options.headers?.["Content-Type"] === "application/x-www-form-urlencoded"
    ) {
      delete defaultHeaders["Content-Type"];
    }
 
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
        // credentials: "include", // Important for cookies/sessions
      });
 
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ message: "API Error: Invalid response" }));
        throw new Error(
          errorData.message ||
            `API request failed with status ${response.status}`
        );
      }
 
      if (response.status === 204) return null;
 
      const apiResponse: ApiResponse<T> = await response.json();
      if (!apiResponse.success)
        throw new Error(apiResponse.message || "API failure");
 
      const apiCart = apiResponse.data?.[0] || null;
 
      // --- Sync frontend guest ID with backend ---
      if (apiCart && (apiCart as any)?.guest_id) {
        const backendGuestId = (apiCart as any).guest_id;
        const frontendGuestId = getGuestId();
        if (frontendGuestId !== backendGuestId) {
          console.warn(
            "⚠️ Syncing frontend guest ID with backend:",
            backendGuestId
          );
          setGuestId(backendGuestId);
        }
      }
 
      return apiCart;
    } catch (error) {
      console.error("❌ Cart API request failed:", endpoint, error);
      throw error;
    }
  }
 
  // --- Map API cart to frontend CartData ---
  private static mapApiToCartData(apiCart: ApiCart): CartData {
    const summary = apiCart.summary || {};
    const items: CartItem[] = (apiCart.items || []).map((item) => ({
      id: String(item.ticket_id),
      productId: String(item.ticket_id),
      name: item.name,
      description: item.description || "",
      price: safeParseFloat(item.price),
      quantity: safeParseInt(item.quantity),
      total: safeParseFloat(item.total_price),
      image: item.ticket_logo || "",
    }));
 
    return {
      id: String(apiCart.cart_id),
      guestId: apiCart.guest_id,
      items,
      subtotal: safeParseFloat(summary.subtotal),
      tax: safeParseFloat(summary.tax_amount),
      shipping: 0,
      total: safeParseFloat(summary.total_amount),
      currency: summary.currency || "USD",
    };
  }
 
  // --- Cart actions ---
  public static async fetchCart(): Promise<CartData> {
    try {
      const apiCart = await this.request<ApiCart>(BASE_URL, { method: "GET" });
      if (!apiCart) return createEmptyCart(getGuestId()!);
      return this.mapApiToCartData(apiCart);
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      return createEmptyCart(getGuestId()!);
    }
  }
 
  public static async addItem(payload: AddItemPayload): Promise<CartData> {
    const formData = new URLSearchParams();
    formData.append("ticket_id", String(payload.productId));
    formData.append("quantity", String(payload.quantity));
 
    const apiCart = await this.request<ApiCart>(CART_ITEMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
 
    if (!apiCart) throw new Error("Failed to add item");
    return this.mapApiToCartData(apiCart);
  }
 
  public static async updateItemQuantity(
    itemId: string,
    quantity: number
  ): Promise<CartData> {
    const body = new URLSearchParams();
    body.append("quantity", String(quantity));
 
    const apiCart = await this.request<ApiCart>(`${CART_ITEMS_URL}/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: body.toString(),
    });
 
    if (!apiCart) throw new Error("Failed to update quantity");
    return this.mapApiToCartData(apiCart);
  }
 
  public static async removeItem(itemId: string): Promise<CartData> {
    const apiCart = await this.request<ApiCart>(`${CART_ITEMS_URL}/${itemId}`, {
      method: "DELETE",
    });
 
    if (!apiCart) return createEmptyCart(getGuestId()!);
    return this.mapApiToCartData(apiCart);
  }
 
  public static async clearCart(): Promise<CartData> {
    const apiCart = await this.request<ApiCart>(`${BASE_URL}/clear`, {
      method: "DELETE",
    });
    if (!apiCart) return createEmptyCart(getGuestId()!);
    return this.mapApiToCartData(apiCart);
  }
 
  // --- Guest ID utilities ---
  public static getCurrentGuestId(): string | null {
    return getGuestId();
  }
 
  public static resetGuestId(): void {
    removeGuestId();
    this.isInitialized = false;
    this.initializationPromise = null;
  }
 
  public static debugGuestId(): void {
    console.log("🔍 Guest ID Debug:", {
      guestId: getGuestId(),
      isInitialized: this.isInitialized,
      pendingRequests: this.pendingRequests.length,
    });
  }
}
 