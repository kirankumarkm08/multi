"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Plus,
  Check,
  X,
  Save,
  Copy,
  Trash2,
  PanelLeftOpen,
  PanelLeftClose,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Editor } from "@tinymce/tinymce-react";
import { blocksService, BlockData } from "@/services/blocks.service";
import Header from "../admin/headers/header";

interface BlocksManagerProps {
  selectedItem?: string;
}

interface BlockModule {
  id: string;
  name: string;
  status: boolean;
  content: string;
  contentType: "text" | "html";
  apiId?: number;
}

export function BlocksManager({ selectedItem }: BlocksManagerProps) {
  const searchParams = useSearchParams();
  const blockIdFromUrl = searchParams.get("blockId");

  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [savedModules, setSavedModules] = useState<BlockModule[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [currentModule, setCurrentModule] = useState<BlockModule>({
    id: "",
    name: "New Block",
    status: true,
    content: "",
    contentType: "html",
  });

  // Load blocks from API and localStorage
  useEffect(() => {
    const loadBlocks = async () => {
      try {
        setIsLoading(true);
        const apiBlocks = await blocksService.getBlocks();

        // Convert API blocks to BlockModule format
        const convertedBlocks: BlockModule[] = apiBlocks.map((block: any) => ({
          id: `api-${block.data?.id || block.id}`,
          name: block.data?.name || block.name || "Untitled Block",
          status: (block.data?.status || block.status) === "published",
          content: block.data?.content || block.content || "",
          contentType: (block.data?.content_type ||
            block.content_type ||
            "html") as "text" | "html",
          apiId: block.data?.id || block.id,
        }));

        // Load saved modules from localStorage
        const saved = localStorage.getItem("blockModules");
        const localBlocks: BlockModule[] = saved ? JSON.parse(saved) : [];

        // Merge blocks, avoiding duplicates
        const mergedBlocks = [...convertedBlocks];
        localBlocks.forEach((localBlock) => {
          if (
            !convertedBlocks.find(
              (apiBlock) => apiBlock.apiId === localBlock.apiId
            )
          ) {
            mergedBlocks.push(localBlock);
          }
        });

        setSavedModules(mergedBlocks);

        // If blockId is in URL, load that specific block
        if (blockIdFromUrl) {
          const targetBlock = mergedBlocks.find(
            (block) => block.apiId?.toString() === blockIdFromUrl
          );
          if (targetBlock) {
            setCurrentModule(targetBlock);
          }
        }
      } catch (error) {
        console.error("Error loading blocks:", error);
        // Fallback to localStorage only
        const saved = localStorage.getItem("blockModules");
        if (saved) {
          const localBlocks = JSON.parse(saved);
          setSavedModules(localBlocks);

          // If blockId is in URL, load that specific block
          if (blockIdFromUrl) {
            const targetBlock = localBlocks.find(
              (block: BlockModule) => block.apiId?.toString() === blockIdFromUrl
            );
            if (targetBlock) {
              setCurrentModule(targetBlock);
            }
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadBlocks();
  }, [blockIdFromUrl]);

  const handleInputChange = (field: string, value: any) => {
    setCurrentModule((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const saveModule = async () => {
    if (!currentModule.name.trim()) {
      toast.error("Please enter a module name");
      return;
    }

    if (!currentModule.content.trim()) {
      toast.error("Please enter some content");
      return;
    }

    setIsLoading(true);
    try {
      const blockData: BlockData = {
        name: currentModule.name,
        content: currentModule.content,
        content_type: currentModule.contentType,
        status: currentModule.status ? "published" : "draft",
      };

      if (currentModule.apiId) {
        // Update existing block
        await blocksService.updateBlock(currentModule.apiId, blockData);

        // Update local state
        setSavedModules((prev) =>
          prev.map((m) => (m.id === currentModule.id ? currentModule : m))
        );
      } else {
        // Create new block
        const response = await blocksService.createBlock(blockData);

        const moduleToSave = {
          ...currentModule,
          id: currentModule.id || Date.now().toString(),
          apiId: response.data.id,
        };

        setSavedModules((prev) => [...prev, moduleToSave]);
        setCurrentModule(moduleToSave);
      }

      toast.success("Block saved successfully!");
    } catch (error: any) {
      console.error("Error saving block:", error);
      toast.error(`Error saving block: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const duplicateModule = () => {
    const duplicated = {
      ...currentModule,
      id: Date.now().toString(),
      name: `${currentModule.name} (Copy)`,
      apiId: undefined,
    };
    setSavedModules((prev) => [...prev, duplicated]);
    setCurrentModule(duplicated);
  };

  const deleteModule = async () => {
    if (
      !currentModule.id ||
      !confirm("Are you sure you want to delete this block?")
    )
      return;

    setIsLoading(true);
    try {
      // Delete from API if it exists there
      if (currentModule.apiId) {
        await blocksService.deleteBlock(currentModule.apiId);
      }

      // Remove from local state
      setSavedModules((prev) => prev.filter((m) => m.id !== currentModule.id));

      // Create new empty module
      createNewModule();

      toast.success("Block deleted successfully!");
    } catch (error: any) {
      console.error("Error deleting block:", error);
      toast.error(`Error deleting block: ${error.message || "Unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const loadModule = (module: BlockModule) => {
    setCurrentModule(module);
  };

  const createNewModule = () => {
    setCurrentModule({
      id: "",
      name: "New Block",
      status: true,
      content: "",
      contentType: "html",
    });
  };

  const toggleLeftSidebar = () => {
    setIsLeftSidebarCollapsed(!isLeftSidebarCollapsed);
  };

  return (
    <div className="  border-2" id="blocks">
      {/* Header */}
      <div className="bg-slate-700 text-white p-4">
        <h1 className="text-xl font-semibold">Blocks Manager</h1>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <div
          className={cn(
            " text-white min-h-screen transition-all duration-300 overflow-y-auto scrollbar-hide",
            isLeftSidebarCollapsed ? "w-12" : "w-50"
          )}
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="p-4 border-b border-slate-700">
            <div className="flex items-center justify-between mb-3">
              {!isLeftSidebarCollapsed && (
                <h3 className="text-sm font-medium text-slate-300">
                  Saved Blocks
                </h3>
              )}
              <div className="flex items-center gap-2">
                {!isLeftSidebarCollapsed && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={createNewModule}
                    className="h-6 w-6 p-0"
                    title="New Block"
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={toggleLeftSidebar}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                  title={
                    isLeftSidebarCollapsed
                      ? "Expand sidebar"
                      : "Collapse sidebar"
                  }
                >
                  {isLeftSidebarCollapsed ? (
                    <PanelLeftOpen className="w-3 h-3" />
                  ) : (
                    <PanelLeftClose className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>

            {!isLeftSidebarCollapsed && (
              <div className="space-y-1 h-screen overflow-auto ">
                {savedModules.map((module) => (
                  <div
                    key={module.id}
                    className={cn(
                      "flex items-center justify-between border-b-2 p-2 rounded text-sm cursor-pointer transition-colors",
                      currentModule.id === module.id
                        ? "bg-blue-600 text-white"
                        : "hover:bg-slate-700 text-slate-300"
                    )}
                    onClick={() => loadModule(module)}
                  >
                    <span className="truncate flex-1">{module.name}</span>
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{
                        backgroundColor: module.status ? "#10b981" : "#ef4444",
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div
          className="flex-1  bg-slate-200 dark:bg-slate-800 overflow-y-auto scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-700">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {currentModule.id
                    ? `Editing: ${currentModule.name}`
                    : "Create New Block"}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={deleteModule}
                    disabled={!currentModule.id || isLoading}
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={duplicateModule}
                    title="Duplicate"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={saveModule}
                    disabled={isLoading}
                    title="Save"
                  >
                    <Save className="w-4 h-4 text-green-500" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              {/* Module Name */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium">Block Name</Label>
                <div className="col-span-3">
                  <Input
                    value={currentModule.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter block name..."
                    className="bg-white"
                  />
                </div>
              </div>

              {/* Status Toggle */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium">Status</Label>
                <div className="col-span-3 flex gap-2">
                  <Button
                    size="sm"
                    variant={currentModule.status ? "default" : "outline"}
                    className={cn(
                      currentModule.status && "bg-green-500 hover:bg-green-600"
                    )}
                    onClick={() => handleInputChange("status", true)}
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={!currentModule.status ? "default" : "outline"}
                    className={cn(
                      !currentModule.status && "bg-red-500 hover:bg-red-600"
                    )}
                    onClick={() => handleInputChange("status", false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Content Type */}
              <div className="grid grid-cols-4 gap-4 items-center">
                <Label className="text-right font-medium">Content Type</Label>
                <div className="col-span-3">
                  <Select
                    value={currentModule.contentType}
                    onValueChange={(value: "text" | "html") =>
                      handleInputChange("contentType", value)
                    }
                  >
                    <SelectTrigger className="bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Content Editor */}
              <div className="grid grid-cols-4 gap-4 items-start">
                <Label className="text-right font-medium pt-3">Content</Label>
                <div className="col-span-3">
                  {currentModule.contentType === "html" ? (
                    // <Editor
                    //   apiKey={
                    //     process.env.NEXT_PUBLIC_TINY_MCE_APP_KEY ||
                    //     "3q6asaisuvwjvbebebn75m64fybw6ych980qvy324rc9bfu2"
                    //   }
                    //   onEditorChange={(content) =>
                    //     handleInputChange("content", content)
                    //   }
                    //   init={{
                    //     height: 400,
                    //     menubar: false,
                    //     selector: "textarea",
                    //     extended_valid_elements: "style",
                    //     valid_children: "+body[style]",
                    //     valid_elements: "*[*]",
                    //     extended_valid_elements:"a[href|target|rel|class|style],div[*],span[*],p[*],h1[*],h2[*],h3[*],h4[*],h5[*],h6[*]",
                    //     // Don’t strip styles
                    //     verify_html: false,
                    //     plugins: [
                    //       "advlist",
                    //       "autolink",
                    //       "lists",
                    //       "link",
                    //       "image",
                    //       "charmap",
                    //       "preview",
                    //       "anchor",
                    //       "searchreplace",
                    //       "visualblocks",
                    //       "code",
                    //       "fullscreen",
                    //       "insertdatetime",
                    //       "media",
                    //       "table",
                    //       "help",
                    //       "wordcount",
                    //     ],
                    //     toolbar:
                    //       "undo redo | blocks | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | image code",
                    //     images_upload_handler: async (blobInfo) => {
                    //       // Convert image to base64
                    //       return new Promise((resolve, reject) => {
                    //         const reader = new FileReader();
                    //         reader.onload = () => {
                    //           resolve(reader.result as string);
                    //         };
                    //         reader.onerror = () => {
                    //           reject("Image reading failed");
                    //         };
                    //         reader.readAsDataURL(blobInfo.blob());
                    //       });
                    //     },
                    //     automatic_uploads: true,
                    //     content_style:
                    //       "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                    //   }}
                    // />
                    <Editor
                      apiKey={
                        process.env.NEXT_PUBLIC_TINY_MCE_APP_KEY ||
                        "3q6asaisuvwjvbebebn75m64fybw6ych980qvy324rc9bfu2"
                      }
                      value={currentModule.content}
                      init={{
                        height: 500,
                        menubar: true,
                        plugins: "code link lists",
                        toolbar:
                          "undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link | code",

                        // Allow all elements + attributes
                        valid_elements: "*[*]",
                        extended_valid_elements:
                          "a[href|target|rel|class|style],div[*],span[*],p[*],h1[*],h2[*],h3[*],h4[*],h5[*],h6[*]",

                        // Don’t strip styles
                        verify_html: false,
                        content_style:
                          "body { font-family:Arial,sans-serif; font-size:14px }",
                      }}
                      onEditorChange={(content) =>
                        setCurrentModule((prev) => ({ ...prev, content }))
                      }
                    />
                  ) : (
                    <Textarea
                      value={currentModule.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      placeholder="Enter your text content here..."
                      className="min-h-[400px] bg-white resize-none"
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
