"use client";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Menu, X, Home } from "lucide-react";
import WalletConnect from "@/components/web3/WalletConnect";
import { useWeb3 } from "@/context/Web3Context";
import { CartSheet } from "../cart/cart-sheet";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { NavItem } from "@/types";
import { MobileMenu } from "./mobile/MobileNav";
import { NavLinks } from "./navigation/NavLinks";
export default function Navbar({ data: initialPages, navData }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [pages, setPages] = useState<NavItem[]>(initialPages || []);
  const [loading, setLoading] = useState(!initialPages);
  const [error, setError] = useState<string | null>(null);
  const { isWeb3Enabled } = useWeb3();
  const { cart } = useCart();
  const [tenant, setTenant] = useState<{
    tenant_name?: string;
    logo_url?: string;
  } | null>(navData?.data?.tenant || null);
  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  const data = navData;

  // Calculate cart item count
  const cartItemCount =
    cart?.items?.reduce((total, item) => total + (item.quantity || 0), 0) || 0;

  const shownav = data?.data.tenant;

  const displayPages = initialPages || pages;
   console.log("pagessss",displayPages)

  if (loading && !initialPages) {
    return (
      <nav className=" shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center"></div>
            <div className="text-sm text-gray-500">Loading...</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className=" bg-white   z-50 w-full  shadow-sm border-b  text-black border-gray-200 dark:border-gray-700">
      <div className=" px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link
              href="/"
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              {tenant?.logo_url && (
                <img
                  src={tenant.logo_url}
                  alt={tenant.tenant_name || "logo"}
                  className="w-[150px] h-[40px]  mr-2"
                />
              )}
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center gap-2">
            {/* {Array.isArray(displayPages) &&
              displayPages.length > 0 &&
              displayPages.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="  dark:text-black dark:hover:text-black-600  transition-colors"
                  >
                    {item.label}
                  </Button>
                </Link>
              ))} */}
            {Array.isArray(displayPages) && displayPages.length > 0 && (
              <NavLinks pages={displayPages} />
            )}


            {error && (
              <div className="text-sm text-red-500">Navigation unavailable</div>
            )}

            {shownav.show_wallet ? (
              <div className="ml-2">
                <WalletConnect />
              </div>
            ) : (
              ""
            )}
            {shownav.show_add_to_cart ? (
              <div className="">
                <CartSheet>
                  <Button
                    variant="default"
                    size="sm"
                    aria-label="Open cart"
                    className="relative"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    {cartItemCount > 0 && (
                      <span
                        aria-live="polite"
                        className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white font-semibold"
                      >
                        {cartItemCount}
                      </span>
                    )}
                  </Button>
                </CartSheet>
              </div>
            ) : (
              ""
            )}
          </div>

          {/* Mobile actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <MobileMenu
          pages={pages}
          closeMenu={closeMobileMenu}
          shownav={shownav}
        />
      )}
    </nav>
  );
}
