"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { SquareCard } from "./square-card";
import { toast } from "@/hooks/use-toast";
import WalletConnect from "@/components/web3/WalletConnect";
// 🎯 Import useCart hook
import { useCart } from "@/hooks/useCart";
import { Loader2, AlertTriangle } from "lucide-react";
import Link from "next/link";

type Method = "card" | "crypto";

export function CheckoutForm() {
  const router = useRouter();
  // 🎯 Use the centralized cart state
  const { cart, loading, error, fetchCart } = useCart();
  const total = cart?.total;
  const currency = cart?.currency;

  const [method, setMethod] = useState<Method>("card");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentAmountCents, setPaymentAmountCents] = useState<number>(0);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // 🎯 useEffect to synchronize cart total with payment amount
  useEffect(() => {
    if (cart) {
      // Convert total (e.g., 217.80 USD) to cents (21780)
      const cents = Math.round(cart.total * 100);
      setPaymentAmountCents(cents);
    }
  }, [cart]);

  // --- Loading and Error Handlers for Cart ---
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading cart details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border border-destructive rounded-lg h-64 text-destructive">
        <AlertTriangle className="w-8 h-8" />
        <p className="mt-4">Error loading order. Please try again.</p>
        <Button onClick={fetchCart} variant="link" className="mt-2">
          Reload Cart
        </Button>
      </div>
    );
  }

  // Check for empty cart
  if (!cart || cart.items.length === 0 || paymentAmountCents === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 border rounded-lg h-64 text-muted-foreground">
        <p className="text-lg font-medium">Your cart is empty.</p>
        <Button asChild className="mt-4">
          <Link href="/">Continue Shopping</Link>
        </Button>
      </div>
    );
  }

  // Total in display units (dollars, etc.)
  const displayAmount = (paymentAmountCents / 100).toFixed(2);

  // --- Payment Functions ---

  const onCardPay = async (token: string) => {
    try {
      setIsLoading(true);
      setCheckoutError(null);
      const res = await fetch("/api/payments/square", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          amount: paymentAmountCents, // 🎯 Use the dynamic amount in cents
          currency: currency, // 🎯 Use the dynamic currency from the cart
          buyerEmail: email,
          buyerName: name,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.message || "Payment failed");
      }

      const { orderId } = await res.json();
      toast({
        title: "Payment successful",
        description: `Order ${orderId} confirmed.`,
      });
      router.push(
        `/checkout/success?orderId=${encodeURIComponent(
          orderId
        )}&amount=${paymentAmountCents}&method=card&currency=${currency}`
      );
    } catch (e: any) {
      setCheckoutError(e?.message || "Payment failed");
      toast({
        title: "Payment failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCryptoPay = async () => {
    // Demo: simulate instant confirmation after wallet connect.
    setIsLoading(true);
    setCheckoutError(null);
    setTimeout(() => {
      setIsLoading(false);
      toast({
        title: "Crypto payment simulated",
        description: "Redirecting to success.",
      });
      router.push(
        `/checkout/success?orderId=demo-crypto-${Date.now()}&amount=${paymentAmountCents}&method=crypto&currency=${currency}`
      );
    }, 800);
  };

  const disabled = !name || !email;

  return (
    <div className="grid gap-6">
      {/* 🎯 Order Summary Section (Replacing static ticket) */}
      <section
        aria-labelledby="order-total"
        className="rounded-lg border p-4 bg-muted/20"
      >
        <h2 id="order-total" className="text-lg font-medium">
          Order Total
        </h2>
        <div className="mt-3 text-sm font-semibold text-foreground">
          <div className="flex items-center justify-between">
            <span className="text-base">Final Amount Due:</span>
            <span className="text-xl">
              {currency} {displayAmount}
            </span>
          </div>
        </div>
      </section>

      <section aria-labelledby="buyer" className="rounded-lg border p-4">
        <h2 id="buyer" className="text-lg font-medium">
          Buyer Information
        </h2>
        <div className="mt-4 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="pay-method" className="rounded-lg border p-4">
        <h2 id="pay-method" className="text-lg font-medium">
          Payment Method
        </h2>

        <div className="mt-4 flex gap-2">
          <Button
            type="button"
            variant={method === "card" ? "default" : "secondary"}
            onClick={() => setMethod("card")}
          >
            Card
          </Button>
          <Button
            type="button"
            variant={method === "crypto" ? "default" : "secondary"}
            onClick={() => setMethod("crypto")}
          >
            Crypto
          </Button>
        </div>

        <div className="mt-4">
          {method === "card" ? (
            <div className="grid gap-4">
              <SquareCard
                name={name}
                email={email}
                amount={paymentAmountCents} // 🎯 Pass dynamic cents amount
                disabled={disabled || isLoading}
                onPay={onCardPay}
                isLoading={isLoading}
              />
            </div>
          ) : (
            <div className="grid gap-4">
              <WalletConnect />
              <Button
                type="button"
                className={cn("w-full")}
                disabled={disabled || isLoading}
                onClick={onCryptoPay}
              >
                {isLoading
                  ? "Processing…"
                  : `Pay ${currency} ${displayAmount} with Wallet`}
              </Button>
            </div>
          )}
        </div>

        {checkoutError && (
          <p role="alert" className="mt-4 text-sm text-destructive">
            {checkoutError}
          </p>
        )}
      </section>
    </div>
  );
}
