"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface Web3ContextType {
  isWeb3Enabled: boolean;
  setWeb3Enabled: (enabled: boolean) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export function Web3Provider({ children }: { children: ReactNode }) {
  const [isWeb3Enabled, setIsWeb3Enabled] = useState(false);

  useEffect(() => {
    // Check if Web3 should be enabled (from settings, localStorage, etc.)
    const savedPreference = localStorage.getItem("web3-enabled");
    if (savedPreference === "true") {
      setIsWeb3Enabled(true);
    }
  }, []);

  const setWeb3Enabled = (enabled: boolean) => {
    setIsWeb3Enabled(enabled);
    localStorage.setItem("web3-enabled", enabled.toString());
  };

  return (
    <Web3Context.Provider value={{ isWeb3Enabled, setWeb3Enabled }}>
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}