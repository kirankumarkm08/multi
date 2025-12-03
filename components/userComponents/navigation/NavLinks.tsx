// src/components/navigation/NavLinks.tsx
"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { NavItem } from "@/types";
import { usePathname } from "next/navigation";

interface NavLinksProps {
  pages: NavItem[];
}

export function NavLinks({ pages }: NavLinksProps) {
  const pathname = usePathname();
  if (!Array.isArray(pages) || pages.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex gap-2">
        {pages.map((item) => {
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
              relative pb-1 text-sm font-medium transition-colors duration-300 
              ${
                isActive
                  ? "text-black dark:text-white"
                  : "text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white"
              }
            `}
            >
              {item.label}
              {/* underline animation */}
              <span
                className={`
                absolute left-0 bottom-0 h-[2px] bg-black dark:bg-white transition-all duration-500 ease-in-out
                ${isActive ? "w-full" : "w-0 group-hover:w-full"}
              `}
              />
            </Link>
          );
        })}
      </div>
    </>
  );
}
