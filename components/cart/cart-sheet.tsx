"use client";

import { ReactNode, useState } from "react";
import { useCart } from "@/hooks/useCart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { CartItemRow } from "./cart-item-row";
import { OrderSummary } from "./order-summary";

interface CartSheetProps {
  children: ReactNode;
}
interface ApiItem {
  id: string;
  name: string;
  description: string;
  price: number;
  productId: string;
  quantity: number;
  total: number;
  image: string;
}

// Structure of the root cart object from the API (flat summary structure)
interface ApiCartData {
  id: string; // Order ID
  guestId: string;
  items: ApiItem[];
  subtotal: number; // Changed to number
  tax: number; // Added
  shipping: number; // Added
  total: number; // Added
  currency: string; // Pulled up
  discount?: number; // Optional discount field
}

// --- MAPPED UI ITEM STRUCTURE (Used for CartItemRow and OrderSummary item list) ---
interface UIMappedItem {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  total: number;
  image: string;
  tier: undefined;
}

export function CartSheet({ children }: CartSheetProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Cast useCart result to the new, flat ApiCartData structure
  const {
    cart,
    loading,
    error,
    updateQuantity,
    removeItem,
    clearCart,
    fetchCart,
  } = useCart() as {
    cart: ApiCartData | null;
    loading: boolean;
    error: string | null;
    updateQuantity: (itemId: string, newQuantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
    fetchCart: () => Promise<void>;
  };

  // Refresh cart when sheet opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      console.log("🛒 CartSheet: Opening, refreshing cart...");
      fetchCart();
    }
  };
  // ----------------------------------------

  // Convert raw API items to the UI-mapped structure
  const apiItems: ApiItem[] = cart?.items || [];

  // Map is simplified since the provided JSON item structure is clean
  const items: UIMappedItem[] = apiItems.map((item) => {
    return {
      id: item.id,
      name: item.name,
      description: item.description,
      price: item.price,
      quantity: item.quantity,
      total: item.total,
      image: item.image || "/placeholder-logo.png",
      tier: undefined,
    } as UIMappedItem;
  });
  // --------------------------------------------------------------------

  const isCartEmpty = items.length === 0;

  // 🏆 FIX: Prepare the OrderSummaryData object from the 'cart' for the OrderSummary component
  const orderSummaryData = {
    subtotal: cart?.subtotal || 0,
    tax: cart?.tax || 0,
    total: cart?.total || 0,
    currency: cart?.currency || "USD",
    discount: cart?.discount || 0, // Assuming a discount field
  };

  const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
    } else {
      await updateQuantity(itemId, newQuantity);
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    await removeItem(itemId);
  };

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent className="flex w-full flex-col p-0 sm:max-w-lg">
        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 dark:bg-gray-900/70">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}

        {/* Error */}
        {error && <div className="p-4 text-red-600">Error: {error}</div>}

        {/* Header */}
        <SheetHeader className="px-6 pb-2 pt-6">
          <SheetTitle className="text-lg font-semibold">
            Your Cart
            {cart?.items && cart.items.length > 0 && ` (${items.length} items)`}
          </SheetTitle>
        </SheetHeader>
        <Separator />

        {/* Cart Content */}
        {isCartEmpty ? (
          <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
            <p className="mb-4 text-lg font-medium">Your cart is empty 🛒</p>
            <Button asChild>
              <a href="/#tickets">Browse Tickets</a>
            </Button>
          </div>
        ) : (
          <>
            {/* Scrollable Items */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="space-y-4">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    id={item.id}
                    name={item.name}
                    description={item.description}
                    price={item.price}
                    quantity={item.quantity}
                    total={item.total}
                    image={item.image}
                    onQuantityChange={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              <Separator />
              <div className="my-4 py-5 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearCart}
                  disabled={loading}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Cart
                </Button>
              </div>
            </div>
            <Separator />

            {/* Summary/Footer */}
            <div className="space-y-3 p-6">
              {/* 🏆 FIX: Pass the items list as 'items' and the summary data as 'summary' */}
              <OrderSummary items={items} summary={orderSummaryData} />

              <Button variant="ghost" className="w-full" asChild>
                <a href="/#tickets">Continue shopping</a>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
