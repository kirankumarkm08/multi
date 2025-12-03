// src/components/navigation/MobileMenu.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/types";
import WalletConnect from "@/components/web3/WalletConnect";
import { CartSheet } from "@/components/cart/cart-sheet";
import { ShoppingCart } from "lucide-react";

interface MobileMenuProps {
  pages: NavItem[];
  closeMenu: () => void;
}

export function MobileMenu({ pages, closeMenu, shownav }: MobileMenuProps) {
  if (!Array.isArray(pages) || pages.length === 0) {
    return null;
  }

  console.log("pages", pages);

  return (
    <div className="px-4 py-2 space-y-2 md:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      {pages.map((item) => (
        <Link key={item.href} href={item.href} onClick={closeMenu}>
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-gray-700 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700 dark:border-gray-600 transition-colors"
          >
            {item.label}
          </Button>
        </Link>
      ))}
      <div className="">
        {shownav.show_wallet ? (
          <div className="ml-2">
            <WalletConnect />
          </div>
        ) : (
          ""
        )}
        {shownav.show_add_to_cart ? (
          <CartSheet>
            <Button
              variant="default"
              size="sm"
              aria-label="Open cart"
              className="relative"
            >
              <ShoppingCart className="h-4 w-4" />
              {/* {cartItemCount > 0 && (
                <span
                  aria-live="polite"
                  className="absolute -right-2 -top-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white font-semibold"
                >
                  {cartItemCount}
                </span>
              )} */}
            </Button>
          </CartSheet>
        ) : (
          ""
        )}
      </div>
    </div>
  );
}
