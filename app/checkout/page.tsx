import { Suspense } from "react";
import {CheckoutForm}  from "@/components/payments/checkout-form";
import { Providers } from "@/components/payments/providers";
import { Web3Provider } from "@/context/Web3Context";

export default function Page() {
  return (
    <Web3Provider>
      <main className="mx-auto max-w-3xl p-6">
        <header className="mb-6">
          <h1 className="text-2xl font-semibold text-balance">
            Ticket Checkout
          </h1>
          <p className="text-sm text-muted-foreground">
            Fast, single-step checkout with card or crypto.
          </p>
        </header>

        <Suspense>
          <CheckoutForm />
        </Suspense>
      </main>
    </Web3Provider>
  );
}


