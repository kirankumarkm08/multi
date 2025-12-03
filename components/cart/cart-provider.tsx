// src/components/cart-provider.tsx
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { CartData, AddItemPayload } from "@/types/cart";
import { CartService } from "@/services/cart.service";

// --- Initial Setup and Types ---

// Added guestId to defaultCart as it is mandatory in the CartData interface
const defaultCart: CartData = {
  id: "0",
  items: [],
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  currency: "USD",
  guestId: "0",
};

interface CartContextType {
  data: CartData;
  isLoading: boolean;
  error: Error | null;
  addItem: (payload: AddItemPayload) => Promise<void>;
  updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// --- Provider Component ---

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [data, setData] = useState<CartData>(defaultCart);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Memoized function to wrap API actions and update state
  const executeAction = useCallback(
    async (action: () => Promise<CartData>) => {
      // Only set loading if there's no data yet, to avoid constant flashes
      if (data.items.length === 0) {
        setIsLoading(true);
      }
      setError(null);
      try {
        const updatedCart = await action();
        setData(updatedCart);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Cart action failed."));
        // NOTE: We do NOT re-throw the error here if we want to show the current data
        // with an error banner, but the original code did re-throw. Keeping it consistent.
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [data.items.length]
  ); // Added dependency

  // Initial cart loading on mount
  const initializeCart = useCallback(() => {
    executeAction(CartService.fetchCart).catch(() => {
      // Catch the error so it doesn't cause an unhandled promise rejection,
      // but the state update (setting the error) is handled by executeAction.
    });
  }, [executeAction]);

  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Public methods exposed by the hook
  const value: CartContextType = {
    data,
    isLoading,
    error,
    addItem: (payload) => executeAction(() => CartService.addItem(payload)),
    updateItemQuantity: (itemId, quantity) =>
      executeAction(() => CartService.updateItemQuantity(itemId, quantity)),
    removeItem: (itemId) => executeAction(() => CartService.removeItem(itemId)),
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// --- Custom Hook ---

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
