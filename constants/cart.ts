import { CartItem, CartData } from "@/types/cart";

export type Coupon = {
  code: string;
  type: "percent" | "amount";
  value: number; // percent 0-100 or amount in cents
};

export const formatCurrency = (amount: number, currency: string = "USD") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency }).format(
    amount
  );

export const subtotal = (items: CartItem[]) =>
  items.reduce((sum, it) => sum + it.price * it.quantity, 0);

export const fees = (items: CartItem[]) => {
  // Example: flat 3% service fee
  const s = subtotal(items);
  return Math.round(s * 0.03);
};

export const discountAmount = (data: CartData) => {
  // For now, no coupon support in the main CartData type
  return 0;
};

export const total = (data: CartData) => {
  const s = subtotal(data.items);
  const f = fees(data.items);
  const d = discountAmount(data);
  // Taxes omitted for now, could add based on locale
  return Math.max(0, s + f - d);
};
