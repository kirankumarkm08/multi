"use client";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect, ReactNode } from "react";
import Sidebar from "@/components/admin/sliders/Slider";
import Header from "@/components/admin/headers/header";

export function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { token, isInitialized } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) router.replace("/admin-login");
  }, [isInitialized, token, router]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }

  if (!token) return null;

  return (
    <div className="min-h-screen flex relative bg-gray-800">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col transition-all duration-300 min-h-screen">
        <header className="sticky top-0 z-40 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
