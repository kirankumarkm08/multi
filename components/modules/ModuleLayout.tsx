"use client"

import { useState } from "react"
import { Sidebar } from "@/components/admin/sliders/sliders"
import { BlocksManager } from "@/components/modules/Blocks-manager"
import  BannersManager  from "@/components/modules/Bannar-manager"
import Slidermanager from "@/components/modules/Slider-manager"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function ModuleLayout({ children }: AdminLayoutProps) {
  const [selectedItem, setSelectedItem] = useState<string>("")

  const handleSelect = (item: string) => {
    console.log("Selected:", item)
    setSelectedItem(item)
  }

  const renderContent = () => {
    switch (selectedItem) {
      case "Blocks":
        return <BlocksManager selectedItem={selectedItem} />
      case "Banners":
        return <BannersManager selectedItem={selectedItem} />
      case "Slider":
        return <Slidermanager selectedItem={selectedItem} />
      default:
        return children
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar onSelect={handleSelect} selectedItem={selectedItem} />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  )
}