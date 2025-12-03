"use client";

import { Suspense } from "react";
import { CheckCircle2, CreditCard, Wallet, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function SuccessInner() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "N/A";
  const method = searchParams.get("method") || "card";
  const amount = Number(searchParams.get("amount") || 0);
  const currency = searchParams.get("currency") || "USD";

  const displayAmount = (amount / 100).toFixed(2);
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const PaymentIcon = method === "crypto" ? Wallet : CreditCard;

  return (
    <main className="mx-auto max-w-3xl p-6 min-h-screen flex items-center justify-center">
      <div className="w-full space-y-6">
        {/* Success Header */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <CheckCircle2 className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-green-600">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground mt-2">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <section className="rounded-lg border bg-card shadow-sm">
          <div className="border-b bg-muted/30 px-6 py-4">
            <h2 className="text-lg font-semibold">Order Details</h2>
            <p className="text-sm text-muted-foreground">{currentDate}</p>
          </div>

          <div className="p-6 space-y-4">
            {/* Order ID */}
            <div className="flex items-start justify-between py-3 border-b">
              <div className="space-y-1">
                <dt className="text-sm font-medium text-muted-foreground">
                  Order ID
                </dt>
                <dd className="text-base font-mono font-semibold break-all">
                  {orderId}
                </dd>
              </div>
            </div>

            {/* Payment Method */}
            <div className="flex items-center justify-between py-3 border-b">
              <dt className="text-sm font-medium text-muted-foreground">
                Payment Method
              </dt>
              <dd className="flex items-center gap-2 font-medium capitalize">
                <PaymentIcon className="h-4 w-4" />
                {method}
              </dd>
            </div>

            {/* Amount */}
            <div className="flex items-center justify-between py-3 border-b">
              <dt className="text-sm font-medium text-muted-foreground">
                Amount Paid
              </dt>
              <dd className="text-2xl font-bold text-green-600">
                {currency} ${displayAmount}
              </dd>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between py-3">
              <dt className="text-sm font-medium text-muted-foreground">
                Status
              </dt>
              <dd className="flex items-center gap-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700">
                  <span className="mr-1.5 h-2 w-2 rounded-full bg-green-600"></span>
                  Completed
                </span>
              </dd>
            </div>
          </div>
        </section>

        {/* Confirmation Message */}
        <div className="rounded-lg border bg-blue-50 border-blue-200 p-4">
          <p className="text-sm text-blue-900">
            <strong>What's next?</strong> A confirmation email has been sent to
            your email address with your order details and receipt. Please check
            your inbox.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button asChild className="flex-1" size="lg">
            <Link href="/">
              <Home className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            size="lg"
            onClick={() => window.print()}
          >
            <Download className="mr-2 h-4 w-4" />
            Download Receipt
          </Button>
        </div>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <SuccessInner />
    </Suspense>
  );
}