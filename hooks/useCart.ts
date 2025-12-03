// src/hooks/useCart.ts (FIXED VERSION - Shared State)

"use client";

import { useState, useEffect, useRef } from "react";
import { CartData, AddItemPayload } from "@/types";
import { CartService } from "@/services/cart.service";

// Global shared state - all hook instances will use this
let globalCart: CartData | null = null;
let globalLoading = true;
let globalError: string | null = null;
let globalListeners: Set<() => void> = new Set();
let globalCartFetchInitiated = false;

// Notify all listeners when state changes
function notifyListeners() {
    globalListeners.forEach(listener => listener());
}

export function useCart() {
    const [cart, setCart] = useState<CartData | null>(globalCart);
    const [loading, setLoading] = useState(globalLoading);
    const [error, setError] = useState<string | null>(globalError);
    const fetchInitiated = useRef(false);

    // Subscribe to global state changes
    useEffect(() => {
        const listener = () => {
            setCart(globalCart);
            setLoading(globalLoading);
            setError(globalError);
        };
        globalListeners.add(listener);
        return () => {
            globalListeners.delete(listener);
        };
    }, []);

    // Update global state helper
    const updateGlobalState = (newCart: CartData | null, newLoading: boolean, newError: string | null) => {
        globalCart = newCart;
        globalLoading = newLoading;
        globalError = newError;
        notifyListeners();
    };

    // Fetch cart initially - FIXED: Only fetch once
    const fetchCart = async (forceRefresh = false) => {
        // Prevent multiple simultaneous fetches
        if (fetchInitiated.current && !forceRefresh) {
            return;
        }

        fetchInitiated.current = true;
        updateGlobalState(globalCart, true, null);

        try {
            console.log("🔄 useCart: Fetching cart data...");
            const data = await CartService.fetchCart();
            console.log("✅ useCart: Cart data received:", data);
            updateGlobalState(data, false, null);
        } catch (err: any) {
            console.error("❌ useCart: Error fetching cart:", err);
            updateGlobalState(globalCart, false, err.message || "Failed to load cart");
        }
    };

    // Add item to cart
    const addToCart = async (payload: AddItemPayload) => {
        updateGlobalState(globalCart, true, null);
        try {
            console.log("🛒 useCart: Adding item to cart...", payload);
            const updatedCart = await CartService.addItem(payload);
            console.log("✅ useCart: Item added, updated cart:", updatedCart);
            updateGlobalState(updatedCart, false, null);
            return updatedCart;
        } catch (err: any) {
            console.error("❌ useCart: Failed to add item:", err);
            updateGlobalState(globalCart, false, err.message || "Failed to add to cart");
            // Re-fetch cart to ensure sync
            await fetchCart(true);
            throw err;
        }
    };

    // Update item quantity
    const updateQuantity = async (itemId: string, quantity: number) => {
        updateGlobalState(globalCart, true, null);
        try {
            const updatedCart = await CartService.updateItemQuantity(itemId, quantity);
            updateGlobalState(updatedCart, false, null);
        } catch (err: any) {
            updateGlobalState(globalCart, false, err.message || "Failed to update quantity");
            // Re-fetch cart to ensure sync
            await fetchCart(true);
        }
    };

    // Remove item
    const removeItem = async (itemId: string) => {
        updateGlobalState(globalCart, true, null);
        try {
            const updatedCart = await CartService.removeItem(itemId);
            updateGlobalState(updatedCart, false, null);
        } catch (err: any) {
            updateGlobalState(globalCart, false, err.message || "Failed to remove item");
            // Re-fetch cart to ensure sync
            await fetchCart(true);
        }
    };

    // Clear cart
    const clearCart = async () => {
        updateGlobalState(globalCart, true, null);
        try {
            const updatedCart = await CartService.clearCart();
            updateGlobalState(updatedCart, false, null);
        } catch (err: any) {
            updateGlobalState(globalCart, false, err.message || "Failed to clear cart");
            // Re-fetch cart to ensure sync
            await fetchCart(true);
        }
    };

    // Load cart on first render - FIXED: Only fetch once globally
    useEffect(() => {
        if (!globalCartFetchInitiated) {
            globalCartFetchInitiated = true;
            fetchCart();
        } else if (!cart && !loading) {
            // If another hook instance mounts later, fetch only if we don't have data
            fetchCart();
        }
    }, []);

    return {
        cart,
        loading,
        error,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart: () => fetchCart(true), // Expose force refresh
    };
}