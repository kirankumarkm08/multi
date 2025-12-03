// src/constants/cart.ts

import { CartItem } from "@/types/cart";

/**
 * Calculates the subtotal for a list of cart items.
 * @param items The list of items in the cart.
 */
export const subtotal = (items: CartItem[]): number => {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
};

/**
 * Formats a currency value into a human-readable string.
 */
export const formatCurrency = (amount: number, currency: string = "USD"): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};