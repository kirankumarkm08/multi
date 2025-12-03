"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import Link from "next/link";
// Assuming formatCurrency and Image are imported from somewhere accessible
// NOTE: You'll need to pass formatCurrency or define it here if it's not globally available
import { formatCurrency } from "@/constants/cart"; 
import Image from "next/image";
import React from "react";

// --- TYPES (Prop for UI Items - UNCHANGED) ---
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

// --- NEW PROPS FOR SUMMARY DATA ---
interface OrderSummaryData {
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  discount?: number; // Optional, as it wasn't in your sample JSON
}

// --- PROPS (MODIFIED) ---
interface OrderSummaryProps {
  /** The UI-ready list of cart items (for rendering the list). */
  items: UIMappedItem[];
  /** All financial summary data. */
  summary: OrderSummaryData;
  /** Whether to show the 'Proceed to Checkout' button. */
  showCheckoutButton?: boolean;
}

/**
 * Displays the cart's financial summary and a brief list of items,
 * receiving all data via props.
 */
export function OrderSummary({
  items,
  summary,
  showCheckoutButton = true,
}: OrderSummaryProps) {
  // 1. Destructure data from the 'summary' prop
  const {
    subtotal,
    tax: taxAmount,
    total: orderTotal,
    currency,
    discount = 0, // Default to 0 if not provided
  } = summary;

  // Calculate itemCount using the numeric quantity from the prop data
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  // ----------------------------------------------------------------------------------

  // 2. Handle empty states (No need for loading/error now, as data is passed in)
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Your Cart</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-muted-foreground">
          Your cart is empty.
        </CardContent>
        {showCheckoutButton && (
          <CardFooter>
            <Button asChild className="w-full" variant="outline">
              <Link href="/">Continue Shopping</Link>
            </Button>
          </CardFooter>
        )}
      </Card>
    );
  }

  // --- Calculations & Formatting ---
  // The tax percentage calculation must use numbers.
  const taxPercentage =
    subtotal > 0 ? ((taxAmount / subtotal) * 100).toFixed(1) : "0.0";
  const format = (value: number) => formatCurrency(value, currency);

  return (
    <Card aria-labelledby="order-summary-title">
      <CardHeader>
        <CardTitle id="order-summary-title" className="text-xl">
          Order Summary ({itemCount}{" "}
          {itemCount === 1 ? "ticket" : "tickets"})
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Cart Items List: Uses items prop */}
        <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md border">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill={true}
                  sizes="48px"
                  style={{ objectFit: "cover" }}
                />
              </div>
              <div className="flex-grow">
                <p className="font-medium text-sm leading-snug">{item.name}</p>
                <p className="text-xs text-muted-foreground">
                  Qty: {item.quantity}
                </p>
              </div>
              <p className="font-medium text-sm flex-shrink-0">
                {format(item.total)}
              </p>
            </div>
          ))}
        </div>

        <Separator />

        {/* Subtotals and Breakdown: Uses data from the summary prop */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>{format(subtotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Discount:</span>
              <span className="text-green-600">- {format(discount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-muted-foreground">
              Tax ({taxPercentage}%):
            </span>
            <span>{format(taxAmount)}</span>
          </div>
        </div>

        <Separator />

        {/* Final Total */}
        <div className="flex justify-between text-base font-semibold">
          <span>Order Total:</span>
          <span>{format(orderTotal)}</span>
        </div>
      </CardContent>

      {/* Checkout Button */}
      {showCheckoutButton && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/checkout">Proceed to Checkout</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}