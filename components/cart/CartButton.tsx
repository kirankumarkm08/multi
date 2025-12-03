// src/components/navigation/CartButton.tsx
"use client";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CartSheet } from "../cart/cart-sheet"; // Assumed path
import { useCart } from "@/hooks/useCart"; // Assumed hook

export function CartButton() {
  const { cart } = useCart();

  // Calculate cart item count
  const cartItemCount =
    cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  return (
    <CartSheet>
      <Button
        variant="default"
        size="sm"
        aria-label="Open cart"
        className="relative"
      >
        <ShoppingCart className="h-4 w-4" />
        {cartItemCount > 0 && (
          <span
            aria-live="polite"
            className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white font-semibold"
          >
            {cartItemCount > 99 ? "99+" : cartItemCount}
          </span>
        )}
      </Button>
    </CartSheet>
  );
}
