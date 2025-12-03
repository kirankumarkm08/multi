"use client";

import { useEffect, useState } from "react";
import { blocksService } from "@/services/blocks.service";

interface BlockRendererProps {
  module: {
    id: string;
    name: string;
    defaultProps?: {
      content?: string;
      contentType?: "html" | "text";
      blockId?: number;
    };
  };
}

interface BlockData {
  id: number;
  name: string;
  content: string;
  content_type: string;
  status: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export function BlockRenderer({ module }: BlockRendererProps) {
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBlock, setSelectedBlock] = useState<BlockData | null>(null);

  useEffect(() => {
    loadBlocks();
  }, []);

  const loadBlocks = async () => {
    try {
      setLoading(true);

      // Load blocks from tenant API endpoint
      const apiBlocks = await blocksService.getBlocks();
      console.log("API response:", apiBlocks);

      if (apiBlocks && Array.isArray(apiBlocks)) {
        // Filter only published blocks
        const publishedBlocks = apiBlocks
          .filter((block: any) => {
            const blockData = block.data || block;
            return blockData.status === "published";
          })
          .map((block: any) => {
            const blockData = block.data || block;
            return {
              id: blockData.id,
              name: blockData.name,
              content: blockData.content,
              content_type: blockData.content_type,
              status: blockData.status,
              tenant_id: blockData.tenant_id,
              created_at: blockData.created_at,
              updated_at: blockData.updated_at,
            };
          });

        setBlocks(publishedBlocks);

        // If there's a specific block to show, select it
        if (module.defaultProps?.blockId) {
          const blockToShow = publishedBlocks.find(
            (b: any) => b.id === module.defaultProps?.blockId
          );
          if (blockToShow) {
            setSelectedBlock(blockToShow);
          }
        } else if (publishedBlocks.length > 0) {
          // Show the first published block by default
          setSelectedBlock(publishedBlocks[0]);
        }
      } else {
        console.log("No blocks returned from API or invalid response format");
        setBlocks([]);
      }
    } catch (error) {
      console.error("Error loading blocks from API:", error);
      setBlocks([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-gray-600 text-sm">Loading blocks...</p>
        </div>
      </div>
    );
  }

  if (!blocks.length) {
    return (
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-blue-800 mb-2">
            📄 No Published Blocks
          </h3>
          <p className="text-blue-600 text-sm mb-3">
            Create and publish content blocks to display them here
          </p>
          <div className="text-xs text-blue-500 bg-blue-100 px-3 py-2 rounded">
            Go to Admin → Blocks to create your first block and set status to
            Published
          </div>
        </div>
      </div>
    );
  }

  if (!selectedBlock) {
    return (
      <div className="p-6 bg-yellow-50 rounded-lg border border-yellow-200">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">
            📄 Block Not Found
          </h3>
          <p className="text-yellow-600 text-sm">
            The specified block could not be loaded
          </p>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    if (selectedBlock.content_type === "html") {
      return (
        <div
          className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: selectedBlock.content }}
        />
      );
    } else {
      return (
        <div className="whitespace-pre-wrap text-gray-800">
          {selectedBlock.content}
        </div>
      );
    }
  };

  return (
    <div className=" rounded-lg border border-gray-200 overflow-hidden">
      {/* Block Header (optional, can be hidden) */}
      {blocks.length > 1 && (
        <div className=" px-4 py-2 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              📄 {selectedBlock.name}
            </h4>
            <select
              value={selectedBlock.id}
              onChange={(e) => {
                const block = blocks.find(
                  (b) => b.id.toString() === e.target.value
                );
                if (block) setSelectedBlock(block);
              }}
              className="text-xs  border border-gray-300 rounded px-2 py-1"
            >
              {blocks.map((block) => (
                <option key={block.id} value={block.id}>
                  {block.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Block Content */}
      <div className="p-4">{renderContent()}</div>
    </div>
  );
}
