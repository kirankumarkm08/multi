"use client";

import React, { useState, useEffect } from "react";
import { X, Search, FileText, Plus, Eye, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { blocksService } from "@/services/blocks.service";
import { cn } from "@/lib/utils";

interface Block {
  id: number;
  name: string;
  content: string;
  content_type: string;
  status: string;
}

interface BlocksPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBlock: (block: Block) => void;
}

export function BlocksPopup({
  isOpen,
  onClose,
  onSelectBlock,
}: BlocksPopupProps) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadBlocks();
    }
  }, [isOpen]);

  const loadBlocks = async () => {
    try {
      setLoading(true);
      const apiBlocks = await blocksService.getBlocks();

      if (apiBlocks && Array.isArray(apiBlocks)) {
        const allBlocks = apiBlocks.map((block: any) => {
          const blockData = block.data || block;
          return {
            id: blockData.id,
            name: blockData.name,
            content: blockData.content,
            content_type: blockData.content_type,
            status: blockData.status,
          };
        });

        setBlocks(allBlocks);
      }
    } catch (error) {
      console.error("Error loading blocks:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const statuses = Array.from(new Set(blocks.map((block) => block.status)));

  const filteredBlocks = blocks.filter((block) => {
    const matchesSearch =
      block.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      block.content.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !selectedStatus || block.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  const handleBlockSelect = (block: Block) => {
    onSelectBlock(block);
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800";
      case "draft":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className=" rounded-lg shadow-lg w-full max-w-5xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              Custom Blocks
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Select a block to add to your page
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Search and Filters */}
        {/* <div className="p-6 border-b space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search blocks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedStatus(null)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
                !selectedStatus
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              All Status
            </button>
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm font-medium transition-colors capitalize",
                  selectedStatus === status
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                )}
              >
                {status}
              </button>
            ))}
          </div>
        </div> */}

        {/* Blocks Grid */}
        <div className="flex-1 overflow-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading blocks...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBlocks.map((block) => (
                <Card
                  key={block.id}
                  className="cursor-pointer hover:shadow-md transition-all group border-2 border-transparent hover:border-blue-200"
                  onClick={() => handleBlockSelect(block)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-sm font-medium text-gray-900 truncate">
                            {block.name}
                          </CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            Block #{block.id}
                          </CardDescription>
                        </div>
                      </div>
                      <Badge
                        className={cn("text-xs", getStatusColor(block.status))}
                        variant="secondary"
                      >
                        {block.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-600 mb-3 line-clamp-3">
                      {block.content_type === "html" ? (
                        <div
                          dangerouslySetInnerHTML={{
                            __html:
                              block.content.substring(0, 100) +
                              (block.content.length > 100 ? "..." : ""),
                          }}
                        />
                      ) : (
                        block.content.substring(0, 100) +
                        (block.content.length > 100 ? "..." : "")
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        {block.content_type.toUpperCase()}
                      </Badge>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBlockSelect(block);
                        }}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredBlocks.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Search className="h-6 w-6 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No blocks found
              </h3>
              <p className="text-gray-600 mb-4">
                {blocks.length === 0
                  ? "Create your first block in the admin panel to get started"
                  : "Try adjusting your search terms or status filter"}
              </p>
              {blocks.length === 0 && (
                <Button variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Block
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              Showing {filteredBlocks.length} of {blocks.length} blocks
            </div>
            <div className="flex items-center gap-4">
              <span>Press ESC to close</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
