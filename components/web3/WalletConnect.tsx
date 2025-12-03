"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Wallet, Copy, ExternalLink, Unplug  } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface WalletState {
  address: string | null;
  isConnected: boolean;
  chainId: number | null;
  balance: string | null;
}

export default function WalletConnect() {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    chainId: null,
    balance: null,
  });
  const [isConnecting, setIsConnecting] = useState(false);

  // Check if MetaMask is installed
  const isMetaMaskInstalled = typeof window !== "undefined" && 
    typeof (window as any).ethereum !== "undefined";

  useEffect(() => {
    if (isMetaMaskInstalled) {
      checkConnection();
      setupEventListeners();
    }
  }, [isMetaMaskInstalled]);

  const checkConnection = async () => {
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_accounts",
      });
      
      if (accounts.length > 0) {
        const chainId = await (window as any).ethereum.request({
          method: "eth_chainId",
        });
        
        setWalletState({
          address: accounts[0],
          isConnected: true,
          chainId: parseInt(chainId, 16),
          balance: null,
        });
        
        // Optionally fetch balance
        fetchBalance(accounts[0]);
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const setupEventListeners = () => {
    if (isMetaMaskInstalled) {
      (window as any).ethereum.on("accountsChanged", handleAccountsChanged);
      (window as any).ethereum.on("chainChanged", handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setWalletState({
        address: null,
        isConnected: false,
        chainId: null,
        balance: null,
      });
    } else {
      setWalletState(prev => ({
        ...prev,
        address: accounts[0],
        isConnected: true,
      }));
      fetchBalance(accounts[0]);
    }
  };

  const handleChainChanged = (chainId: string) => {
    setWalletState(prev => ({
      ...prev,
      chainId: parseInt(chainId, 16),
    }));
  };

  const fetchBalance = async (address: string) => {
    try {
      const balance = await (window as any).ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      });
      
      // Convert from wei to ETH
      const balanceInEth = (parseInt(balance, 16) / Math.pow(10, 18)).toFixed(4);
      setWalletState(prev => ({
        ...prev,
        balance: balanceInEth,
      }));
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const connectWallet = async () => {
    if (!isMetaMaskInstalled) {
      toast.error("Please install MetaMask to connect your wallet");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    try {
      const accounts = await (window as any).ethereum.request({
        method: "eth_requestAccounts",
      });
      
      const chainId = await (window as any).ethereum.request({
        method: "eth_chainId",
      });

      setWalletState({
        address: accounts[0],
        isConnected: true,
        chainId: parseInt(chainId, 16),
        balance: null,
      });
      
      fetchBalance(accounts[0]);
      toast.success("Wallet connected successfully!");
    } catch (error: any) {
      console.error("Error connecting wallet:", error);
      toast.error(error.message || "Failed to connect wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      isConnected: false,
      chainId: null,
      balance: null,
    });
    toast.success("Wallet disconnected");
  };

  const copyAddress = () => {
    if (walletState.address) {
      navigator.clipboard.writeText(walletState.address);
      toast.success("Address copied to clipboard");
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    const chains: Record<number, string> = {
      1: "Ethereum",
      137: "Polygon",
      56: "BSC",
      43114: "Avalanche",
      250: "Fantom",
      42161: "Arbitrum",
      10: "Optimism",
    };
    return chains[chainId] || `Chain ${chainId}`;
  };

  if (!walletState.isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        size="sm"
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        <Wallet className="h-4 w-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-green-50 border-green-200 hover:bg-green-100 text-green-800 dark:bg-green-900/20 dark:border-green-800 dark:text-green-300"
        >
          <Wallet className="h-4 w-4 mr-2" />
          {formatAddress(walletState.address!)}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2">
          <div className="text-sm font-medium">Wallet Connected</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {getChainName(walletState.chainId!)}
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="h-4 w-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${walletState.address}`, "_blank")}
          className="cursor-pointer"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        
        {walletState.balance && (
          <div className="px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
            Balance: {walletState.balance} ETH
          </div>
        )}
        
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={disconnectWallet} className="cursor-pointer text-red-600">
          <Unplug  className="h-4 w-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}