// src/types/cart.ts (MOCK FILE)

export interface CartItem {
 
  productId: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
  tier?: string; // Optional for backward compatibility
  perks?: string[]; // Optional for backward compatibility
}

export interface CartData {
  id: string; // cart_id
  guestId: string;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  currency: string;
}

export interface AddItemPayload {
  productId: string; // ticket_id
  quantity: number;
}
