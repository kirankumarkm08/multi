"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  GripVertical,
  MoreVertical,
  Settings,
  Trash2,
  Copy,
  Eye,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { iconMap } from "./module-library"; // Import iconMap to resolve icons
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Module } from "@/types/pagebuilder";

interface ModuleInstanceProps {
  id: string;
  module: Module;
  index: number;
  onRemove: () => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ModuleInstance({
  id,
  module,
  index,
  onRemove,
  isSelected,
  onSelect,
}: ModuleInstanceProps) {
  const [isHovered, setIsHovered] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Handle both emoji string icons and Lucide component icons
  const renderIcon = () => {
    if (typeof module.icon === "string") {
      return <span className="text-sm">{module.icon}</span>;
    } else {
      const Icon = iconMap[module.icon as keyof typeof iconMap];
      return Icon ? (
        <Icon className="h-3 w-3 text-primary" />
      ) : (
        <span className="text-sm">📦</span>
      );
    }
  };

  // // Map module names to their admin page links
  // const getModuleLink = (moduleName: string): string | null => {
  //   if (module.defaultProps?.blockId || module.category === "Custom Blocks") {
  //     const blockId = module.defaultProps?.blockId;

  //     return blockId
  //       ? `/admin/page-builder/modules?blockId=${blockId}`
  //       : "/admin/page-builder/modules";
  //   }

  //   const linkMap: Record<string, string> = {
  //     Speakers: "/admin/speakers",
  //     "Upcoming Events": "/admin/events",
  //     Events: "/admin/events",
  //     Tickets: "/admin/tickets",
  //     Sponsors: "/admin/others",
  //     Venue: "/admin/others",
  //     Schedule: "/admin/events",
  //     Staff: "/admin/staff",
  //   };
  //   return linkMap[moduleName] || null;
  // };

  // ✅ Improved getModuleLink — accepts full module object
  const getModuleLink = (module: Module): string | null => {
    if (module?.defaultProps?.blockId || module?.category === "Custom Blocks") {
      const blockId = module.defaultProps?.blockId;
      return blockId
        ? `/admin/page-builder/modules?blockId=${blockId}`
        : "/admin/page-builder/modules";
    }

    const linkMap: Record<string, string> = {
      Speakers: "/admin/speakers",
      "Upcoming Events": "/admin/events",
      Events: "/admin/events",
      Tickets: "/admin/tickets",
      Sponsors: "/admin/others",
      Venue: "/admin/others",
      Schedule: "/admin/events",
      Staff: "/admin/staff",
    };

    return linkMap[module.name] || null;
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border transition-all cursor-move",
        isSelected && "border-primary bg-primary/5 shadow-md",
        isHovered && !isDragging && "border-primary/50 shadow-sm",
        isDragging && "opacity-50 scale-95"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onSelect}
    >
      <div className="p-3">
        <div className="flex items-center gap-3">
          {/* Drag Handle */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <GripVertical
              className="h-4 w-4 text-muted-foreground cursor-move"
              {...attributes}
              {...listeners}
            />
          </div>

          {/* Module Icon */}
          <div className="p-1.5 bg-primary/10 rounded flex items-center justify-center">
            {renderIcon()}
          </div>

          {/* Module Info */}
          <div className="flex-1 min-w-0">
            <h6 className="font-medium text-sm text-foreground truncate">
              {module.name}
            </h6>
            <p className="text-xs text-muted-foreground truncate">
              {module.category}
            </p>
          </div>

          {/* Actions */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* <DropdownMenuItem>
                  <Settings className="h-3 w-3 mr-2" />
                  Configure
                </DropdownMenuItem> */}
                {/* <DropdownMenuItem>
                  <Copy className="h-3 w-3 mr-2" />
                  Duplicate
                </DropdownMenuItem> */}

                <DropdownMenuItem
                  onClick={onRemove}
                  className="text-destructive"
                >
                  <Trash2 className="h-3 w-3 mr-2" />
                  Remove
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Module Preview/Content */}
        {module.defaultProps && (
          <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
            {module.name === "Text Block" && module.defaultProps.content}
            {module.name === "Heading" && (
              <div className="font-semibold">{module.defaultProps.text}</div>
            )}
            {module.name === "Hero Section" && (
              <div>
                <div className="font-medium">{module.defaultProps.title}</div>
                <div className="text-xs">{module.defaultProps.subtitle}</div>
              </div>
            )}
            {!["Text Block", "Heading", "Hero Section"].includes(
              module.name
            ) && (
              <>
                {getModuleLink(module) ? (
                  <Link
                    href={getModuleLink(module)!}
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between gap-2 hover:text-primary transition-colors cursor-pointer"
                  >
                    <span className="text-xs">
                      Click to configure {module.name.toLowerCase()}
                    </span>
                    <div className="inline-flex items-center gap-1 text-primary">
                      <span className="text-xs font-medium">Manage</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                  </Link>
                ) : (
                  <span
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelect?.();
                    }}
                    className="text-xs text-muted-foreground hover:text-primary cursor-pointer transition-colors"
                  >
                    Click to configure {module.name.toLowerCase()}
                  </span>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}
