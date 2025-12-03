"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Layout,
  Blocks,
  ImageIcon,
  Grid3X3,
  Mail,
  Type,
  MousePointer,
  Calendar,
  BookOpen,
  Settings,
  Wrench,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { BlocksManager } from "@/components/modules/Blocks-manager";
import Slidermanager from "@/components/modules/Slider-manager";
import Bannarmanager from "@/components/modules/Bannar-manager";
import { useSearchParams, useRouter } from "next/navigation";
import { Item } from "@radix-ui/react-dropdown-menu";

const sections = [
  {
    label: "modules",
    icon: Layout,
    items: [
      { name: "Blocks", icon: Blocks, component: <BlocksManager /> },
      { name: "Banners", icon: ImageIcon, component: <Bannarmanager /> },
      { name: "Slider", icon: ImageIcon, component: <Slidermanager /> },
    ],
  },
];



export function Sidebar({ onSelect }: any) {
  const [activeSection, setActiveSection] = useState<string | null>("modules");
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const searchParams = useSearchParams();
  const blockId = searchParams.get("blockId");

  const toggleSection = (sectionLabel: string) => {
    setActiveSection(activeSection === sectionLabel ? null : sectionLabel);
  };
  useEffect(() => {
    if (blockId) {
      setActiveSection("modules"); // open the modules section

      const blocksItem = sections
        .find((s) => s.label === "modules")
        ?.items.find((i) => i.name === "Blocks");

      if (blocksItem && onSelect) {
        // this triggers your onSelect callback like user clicked "Blocks"
        onSelect(blocksItem.name, blocksItem.component);
      }
    }
  }, [blockId]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (item: any) => {
    onSelect(item.name, item.component);
  };

  // if (blockid) setActiveSection(activeSection === "blockid" && <BlocksManager />);

  return (
    <div
      className={cn(
        "bg-white dark:bg-gray-900 border-black border-r border-sidebar-border min-h-screen flex flex-col transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div>
              <h2 className="text-lg font-semibold text-sidebar-foreground">
                Content Manager
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Build your page content
              </p>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleCollapse}
            className="h-8 w-8 p-0 hover:bg-sidebar-accent"
          >
            {isCollapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-2 py-4 space-y-2">
        {sections.map((section) => {
          const SectionIcon = section.icon;
          const isExpanded = activeSection === section.label;

          return (
            <div key={section.label} className="space-y-1">
              {/* Section Header */}
              <button
                className={cn(
                  "w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isExpanded
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground"
                )}
                onClick={() => toggleSection(section.label)}
                title={isCollapsed ? section.label : undefined}
              >
                <div className="flex items-center gap-3">
                  <SectionIcon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && (
                    <span className="capitalize">{section.label}</span>
                  )}
                </div>
                {!isCollapsed &&
                  (isExpanded ? (
                    <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                  ) : (
                    <ChevronRight className="h-4 w-4 transition-transform duration-200" />
                  ))}
              </button>

              {/* Section Items */}
              {isExpanded && !isCollapsed && (
                <div className="ml-4 space-y-1 animate-in slide-in-from-top-2 duration-200">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isHovered = hoveredItem === item.name;

                    return (
                      <button
                        key={item.name}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-all duration-200",
                          "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1",
                          "text-muted-foreground hover:text-sidebar-accent-foreground",
                          isHovered && "bg-sidebar-accent/50"
                        )}
                        onClick={() => handleItemClick(item)}
                        onMouseEnter={() => setHoveredItem(item.name)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <ItemIcon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
