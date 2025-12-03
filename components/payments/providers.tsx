"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { type ReactNode, useMemo } from "react";
import {
  RainbowKitProvider,
  getDefaultWallets,
  lightTheme,
  connectors as getRainbowKitConnectors, // 👈 Rename the import for clarity
} from "@rainbow-me/rainbowkit";
import { WagmiProvider, createConfig, http } from "wagmi";
import { mainnet, polygon, base } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// ⚠️ Best Practice: Define a type for your environment variable for better type safety
type ProjectId = string;
const projectId: ProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "";

// Best Practice: Abstract the configuration logic away from the component's render
const configureWagmi = (chains: readonly [any, ...any[]]) => {
  // 1. Get default wallets
  const { wallets } = getDefaultWallets({
    appName: "Wallet Checkout (SaaS Tenant Name)", // 💡 Multi-Tenant Best Practice: Consider dynamically setting the appName based on the tenant.
    projectId,
    chains,
  });

  // 2. Process the wallets array using the RainbowKit utility to get properly structured connectors
  const connectors = getRainbowKitConnectors({
    projectId,
    version: "2", // Using v2 is generally a good practice for WalletConnect
    chains,
    wallets,
  });

  // 3. Build Wagmi config
  const config = createConfig({
    chains,
    transports: {
      // 💡 Best Practice: Only define transports for chains you expect to use frequently, or all chains in your `chains` array.
      [base.id]: http(), 
      // [mainnet.id]: http(), // example
      // [polygon.id]: http(), // example
    },
    connectors, // 👈 CORRECT: Pass the processed connectors
    ssr: true,
  });

  return config;
};

export function Providers({ children }: { children: ReactNode }) {
  // Best Practice: Keep non-changing data/config outside the component or memoized.
  // Using `useMemo` for QueryClient is good practice.
  const queryClient = useMemo(() => new QueryClient(), []);
  
  // 💡 Best Practice: Define the chains as a constant outside the component if they don't change.
  const chains = useMemo(() => [mainnet, polygon, base] as const, []);

  // 4. Configure Wagmi (memoize for performance)
  const config = useMemo(() => configureWagmi(chains), [chains]); // Recalculate only if chains change (which they shouldn't here)

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          chains={chains} // 👈 CORRECT: Pass all configured chains for a better UX, or specifically the ones you want visible in the UI
          theme={lightTheme({ borderRadius: "medium" })}
          // 💡 Multi-Tenant Best Practice: Use a custom color/brand based on the tenant's theme/branding.
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}