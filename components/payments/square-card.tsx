"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, CreditCard, Shield } from "lucide-react";

declare global {
  interface Window {
    Square?: any;
  }
}

const SQUARE_JS_URL = "https://sandbox.web.squarecdn.com/v1/square.js";

async function loadSquareSdk() {
  if (typeof window === "undefined") return;
  if (window.Square) return window.Square;
  await new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[src="${SQUARE_JS_URL}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("Square SDK failed to load"))
      );
      return;
    }
    const script = document.createElement("script");
    script.src = SQUARE_JS_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Square SDK failed to load"));
    document.head.appendChild(script);
  });
  return window.Square;
}

export function SquareCard({
  name,
  email,
  amount,
  disabled,
  isLoading,
  onPay,
}: {
  name: string;
  email: string;
  amount: number; // in cents
  disabled?: boolean;
  isLoading?: boolean;
  onPay: (token: string) => Promise<void>;
}) {
  const appId = "sandbox-sq0idb-Q3B94XQNS3E_75nsyzwUlg";
  const locationId = "L5G7EVWZ7KZAP";

   console.log(appId,locationId)

  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const cardRef = useRef<any>(null);
  const hasSetupRef = useRef(false);

  const setupCard = useCallback(async () => {
    try {
      if (hasSetupRef.current) {
        return;
      }
      if (!appId || !locationId) {
        setLoadError("Payment system IDs are not configured.");
        return;
      }

      const Square = await loadSquareSdk();
      if (!Square) {
        throw new Error("Failed to load payment system");
      }

      const payments = Square.payments(appId, locationId);
      
      // FIX: Add options for appearance if needed, or leave blank for default
      const card = await payments.card({}); 

      // Ensure container is empty before attaching (avoids duplicate iframes)
      const container = document.getElementById("card-container");
      if (container) {
        container.innerHTML = "";
      }

      await card.attach("#card-container");
      cardRef.current = card;
      setReady(true);
      setLoadError(null);
      hasSetupRef.current = true;
    } catch (error: any) {
      console.error("Payment setup error:", error);
      setLoadError("Unable to load payment form. Please refresh the page.");
    }
  }, [appId, locationId]);

  useEffect(() => {
    setupCard();
    return () => {
      try {
        if (cardRef.current?.destroy) {
          cardRef.current.destroy();
        }
      } catch {}
      cardRef.current = null;
      hasSetupRef.current = false;
      const container = document.getElementById("card-container");
      if (container) {
        container.innerHTML = "";
      }
    };
  }, [setupCard]);

  const handlePay = async () => {
    try {
      if (!cardRef.current) {
        alert("Payment form not ready. Please wait a moment.");
        return;
      }

      const result = await cardRef.current.tokenize();

      if (result.status === "OK") {
        await onPay(result.token);
      } else {
        const message =
          result.errors?.map((e: any) => e.message).join(", ") ||
          "Payment processing failed";
        alert(`Card Tokenization failed: ${message}`);
      }
    } catch (err: any) {
      alert(
        `Tokenization error: ${
          err?.message || "Please check your card details and try again."
        }`
      );
    }
  };

  const displayAmount = (amount / 100).toFixed(2);

  return (
    <div className="space-y-4">
      {/* Payment Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Card Payment
        </h3>
        <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
          <Shield className="h-3 w-3" />
          Secure
        </div>
      </div>

      {/* Card Form Container */}
      <div className="space-y-3">
        <div className="text-sm text-gray-600">Enter your card details (use test cards for sandbox)</div>

        <div className="rounded-lg border border-gray-200 p-4 bg-white shadow-sm">
          {!ready && !loadError && (
            <div className="flex items-center justify-center h-20 text-gray-500">
              <div className="text-center">
                <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                <p className="text-sm">Loading secure payment form...</p>
              </div>
            </div>
          )}
          <div
            id="card-container"
            className={!ready ? "hidden" : "block min-h-[60px]"}
          />
        </div>
      </div>

      {/* Error States */}
      {loadError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">{loadError}</p>
          <p className="text-xs text-red-600 mt-1">
            Please check your configuration or try again later.
          </p>
        </div>
      )}

      {/* Pay Button */}
      <Button
        type="button"
        className="w-full h-12 text-base font-medium"
        disabled={disabled || !ready || isLoading || !!loadError}
        onClick={handlePay}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Processing...
          </>
        ) : (
          `Pay $${displayAmount}`
        )}
      </Button>

      {/* Security Footer */}
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 mb-2">
          <span>PCI Compliant</span>
          <span>•</span>
          <span>256-bit Encryption</span>
        </div>
        <p className="text-xs text-gray-400">
          Your payment details are securely processed by Square
        </p>
      </div>
    </div>
  );
}