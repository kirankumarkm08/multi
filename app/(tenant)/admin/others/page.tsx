"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const Page = () => {
  const [showWallet, setShowWallet] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    const fetchBrandingSettings = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        console.error("No access token found");
        setInitialLoading(false);
        return;
      }

      try {
        const res = await fetch(
          "https://api.testjkl.in/api/tenant/onboarding/branding",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        console.log("API Response:", data);

        if (res.ok && data) {
          // Based on your curl command, the API expects string "1" or "0"
          // Handle both string and boolean responses
          if (data.data) {
            // If response has data property
            setShowWallet(data.data.show_wallet === "1" || data.data.show_wallet === 1 || data.data.show_wallet === true);
            setShowCart(data.data.show_add_to_cart === "1" || data.data.show_add_to_cart === 1 || data.data.show_add_to_cart === true);
          } else {
            // If response is direct
            setShowWallet(data.show_wallet === "1" || data.show_wallet === 1 || data.show_wallet === true);
            setShowCart(data.show_add_to_cart === "1" || data.show_add_to_cart === 1 || data.show_add_to_cart === true);
          }
          
          console.log("Parsed settings - Wallet:", showWallet, "Cart:", showCart);
        } else {
          console.error("Failed to fetch settings:", data);
          // Use default values if API fails
        }
      } catch (err) {
        console.error("Error fetching settings:", err);
        // Use default values if API fails
      } finally {
        setInitialLoading(false);
      }
    };

    fetchBrandingSettings();
  }, []);

  const handleToggle = async (field: "wallet" | "cart", value: boolean) => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      alert("No authentication token found");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("logo", "");
    formData.append("banner", "");
    formData.append("primary_color", "");
    formData.append("secondary_color", "");
    formData.append("font_family", "");
    
    // Use string "1" and "0" as shown in your curl command
    formData.append(
      "show_add_to_cart",
      field === "cart" ? (value ? "1" : "0") : (showCart ? "1" : "0")
    );
    formData.append(
      "show_wallet",
      field === "wallet" ? (value ? "1" : "0") : (showWallet ? "1" : "0")
    );

    try {
      const res = await fetch(
        "https://api.testjkl.in/api/tenant/onboarding/branding",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const data = await res.json();
      console.log("Update Response:", data);

      if (res.ok) {
        // Update local state after successful API call
        if (field === "wallet") setShowWallet(value);
        if (field === "cart") setShowCart(value);
        
        // Show success message
        alert(`Successfully ${value ? 'enabled' : 'disabled'} ${field}`);
      } else {
        alert("Failed to update: " + (data?.message || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Error updating toggle");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({
    isOn,
    onClick,
    disabled = false,
  }: {
    isOn: boolean;
    onClick: () => void;
    disabled?: boolean;
  }) => (
    <div
      onClick={disabled ? undefined : onClick}
      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
        disabled ? "bg-gray-400 cursor-not-allowed" : 
        isOn ? "bg-blue-600" : "bg-gray-300"
      }`}
    >
      <motion.div
        className="w-5 h-5 bg-white rounded-full shadow-md"
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        style={{
          x: isOn ? 24 : 0,
        }}
      />
    </div>
  );

  if (initialLoading) {
    return (
      <div className="max-w-2xl mx-auto mt-10 space-y-6">
        <h1 className="text-2xl font-semibold mb-6">Feature Toggles</h1>
        <div className="flex justify-center items-center py-8">
          <p className="text-sm text-gray-500 animate-pulse">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-6">
      <h1 className="text-2xl font-semibold mb-6">Feature Toggles</h1>

      <div className="w-full flex justify-between items-center px-6 py-3 rounded-lg border border-gray-300">
        <div>
          <h2 className="font-medium">Web3 Wallet</h2>
          <small className="text-yellow-500">(Show/Hide in navbar)</small>
        </div>
        <Toggle
          isOn={showWallet}
          onClick={() => handleToggle("wallet", !showWallet)}
          disabled={loading}
        />
      </div>

      <div className="w-full flex justify-between items-center px-6 py-3 rounded-lg border border-gray-300">
        <div>
          <h2 className="font-medium">Cart</h2>
          <small className="text-yellow-500">(Show/Hide in navbar)</small>
        </div>
        <Toggle
          isOn={showCart}
          onClick={() => handleToggle("cart", !showCart)}
          disabled={loading}
        />
      </div>

      {loading && (
        <p className="text-sm text-gray-500 animate-pulse">Updating...</p>
      )}

      {/* Debug info - remove in production */}
      {/* <div className="mt-8 p-4 bg-gray-100 rounded-lg">
        <h3 className="font-medium mb-2">Debug Info:</h3>
        <p>Wallet: {showWallet ? "ON" : "OFF"}</p>
        <p>Cart: {showCart ? "ON" : "OFF"}</p>
      </div> */}
    </div>
  );
};

export default Page;