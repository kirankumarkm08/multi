"use client";

import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useWeb3 } from "@/context/Web3Context";
import { Wallet } from "lucide-react";

export default function Web3Toggle() {
  const { isWeb3Enabled, setWeb3Enabled } = useWeb3();

  return (
    <div className="flex items-center space-x-2">
      <Wallet className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      <Label htmlFor="web3-toggle" className="text-sm font-medium">
        Enable Web3 Wallet
      </Label>
      <Switch
        id="web3-toggle"
        checked={isWeb3Enabled}
        onCheckedChange={setWeb3Enabled}
      />
    </div>
  );
}