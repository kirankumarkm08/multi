"use client";

import { useState } from "react";
import { Sidebar } from "@/components/admin/sliders/sliders";
import { BlocksManager } from "@/components/modules/Blocks-manager";

export default function Home({ children }: { children: React.ReactNode }) {
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [activeComponent, setActiveComponent] = useState<React.ReactNode>(null);

  const handleSelect = (item: string, component?: React.ReactNode) => {
    console.log("Selected:", item);
    setSelectedItem(item);
    setActiveComponent(component || null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onSelect={handleSelect} />
      <main className="flex-1">{activeComponent || children}</main>
    </div>
  );
}
