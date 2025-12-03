"use client";

import React, { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RowStyling, ColumnStyling } from "@/types/pagebuilder";
import { AlignLeft, AlignCenter, AlignRight, AlignJustify, ArrowUpToLine, ArrowDownToLine, Minus } from "lucide-react";

interface StylingPanelProps {
  styling: RowStyling | ColumnStyling | undefined;
  onChange: (newStyling: any) => void;
  type: "row" | "column";
  onClose: () => void;
}

export function StylingPanel({
  styling,
  onChange,
  type,
  onClose,
}: StylingPanelProps) {
  const [localStyling, setLocalStyling] = useState<any>(styling || {});

  useEffect(() => {
    setLocalStyling(styling || {});
  }, [styling]);

  const handleChange = (key: string, value: any) => {
    const newStyling = { ...localStyling, [key]: value };
    setLocalStyling(newStyling);
    onChange(newStyling);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Tabs defaultValue="background" className="w-full flex-1">
        <TabsList className="w-full grid grid-cols-5 mb-4">
          <TabsTrigger value="background">Background</TabsTrigger>
          <TabsTrigger value="spacing">Spacing</TabsTrigger>
          <TabsTrigger value="border">Border</TabsTrigger>
          {type === "column" && <TabsTrigger value="alignment">Align</TabsTrigger>}
          <TabsTrigger value="effects">Effects</TabsTrigger>
        </TabsList>

        {/* Background Tab */}
        <TabsContent value="background" className="space-y-4">
          <div className="space-y-2">
            <Label>Background Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={localStyling.backgroundColor || "#ffffff"}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={localStyling.backgroundColor || ""}
                onChange={(e) => handleChange("backgroundColor", e.target.value)}
                placeholder="#ffffff"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Background Image URL</Label>
            <Input
              type="text"
              value={localStyling.backgroundImage || ""}
              onChange={(e) => handleChange("backgroundImage", e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Size</Label>
              <Select
                value={localStyling.backgroundSize || "auto"}
                onValueChange={(val) => handleChange("backgroundSize", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Auto</SelectItem>
                  <SelectItem value="cover">Cover</SelectItem>
                  <SelectItem value="contain">Contain</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Repeat</Label>
              <Select
                value={localStyling.backgroundRepeat || "repeat"}
                onValueChange={(val) => handleChange("backgroundRepeat", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select repeat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="repeat">Repeat</SelectItem>
                  <SelectItem value="no-repeat">No Repeat</SelectItem>
                  <SelectItem value="repeat-x">Repeat X</SelectItem>
                  <SelectItem value="repeat-y">Repeat Y</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        {/* Spacing Tab */}
        <TabsContent value="spacing" className="space-y-4">
          <div className="space-y-2">
            <Label>Padding</Label>
            <Input
              value={localStyling.padding || ""}
              onChange={(e) => handleChange("padding", e.target.value)}
              placeholder="e.g. 20px or 10px 20px"
            />
            <p className="text-xs text-muted-foreground">CSS format: top right bottom left</p>
          </div>

          <div className="space-y-2">
            <Label>Margin</Label>
            <Input
              value={localStyling.margin || ""}
              onChange={(e) => handleChange("margin", e.target.value)}
              placeholder="e.g. 0px auto"
            />
          </div>

          {type === "row" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Min Height</Label>
                <Input
                  value={localStyling.minHeight || ""}
                  onChange={(e) => handleChange("minHeight", e.target.value)}
                  placeholder="e.g. 100px"
                />
              </div>
              <div className="space-y-2">
                <Label>Max Height</Label>
                <Input
                  value={localStyling.maxHeight || ""}
                  onChange={(e) => handleChange("maxHeight", e.target.value)}
                  placeholder="e.g. 500px"
                />
              </div>
            </div>
          )}
        </TabsContent>

        {/* Border Tab */}
        <TabsContent value="border" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
              <Label>Border Style</Label>
              <Select
                value={localStyling.borderStyle || "solid"}
                onValueChange={(val) => handleChange("borderStyle", val)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">Solid</SelectItem>
                  <SelectItem value="dashed">Dashed</SelectItem>
                  <SelectItem value="dotted">Dotted</SelectItem>
                  <SelectItem value="double">Double</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Border Width</Label>
              <Input
                value={localStyling.borderWidth || ""}
                onChange={(e) => handleChange("borderWidth", e.target.value)}
                placeholder="e.g. 1px"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Color</Label>
            <div className="flex gap-2">
              <Input
                type="color"
                value={localStyling.borderColor || "#e0e0e0"}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                className="w-12 h-10 p-1 cursor-pointer"
              />
              <Input
                type="text"
                value={localStyling.borderColor || ""}
                onChange={(e) => handleChange("borderColor", e.target.value)}
                placeholder="#e0e0e0"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Border Radius</Label>
            <Input
              value={localStyling.borderRadius || ""}
              onChange={(e) => handleChange("borderRadius", e.target.value)}
              placeholder="e.g. 4px"
            />
          </div>
        </TabsContent>

        {/* Alignment Tab (Column Only) */}
        {type === "column" && (
          <TabsContent value="alignment" className="space-y-4">
            <div className="space-y-2">
              <Label>Text Alignment</Label>
              <div className="flex gap-2">
                <Button
                  variant={localStyling.textAlign === "left" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("textAlign", "left")}
                >
                  <AlignLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyling.textAlign === "center" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("textAlign", "center")}
                >
                  <AlignCenter className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyling.textAlign === "right" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("textAlign", "right")}
                >
                  <AlignRight className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyling.textAlign === "justify" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("textAlign", "justify")}
                >
                  <AlignJustify className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Vertical Alignment</Label>
              <div className="flex gap-2">
                <Button
                  variant={localStyling.verticalAlign === "top" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("verticalAlign", "top")}
                >
                  <ArrowUpToLine className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyling.verticalAlign === "middle" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("verticalAlign", "middle")}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <Button
                  variant={localStyling.verticalAlign === "bottom" ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleChange("verticalAlign", "bottom")}
                >
                  <ArrowDownToLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </TabsContent>
        )}

        {/* Effects Tab */}
        <TabsContent value="effects" className="space-y-4">
          <div className="space-y-2">
            <Label>Opacity ({localStyling.opacity ?? 1})</Label>
            <Slider
              value={[localStyling.opacity ?? 1]}
              min={0}
              max={1}
              step={0.1}
              onValueChange={(val) => handleChange("opacity", val[0])}
            />
          </div>

          <div className="space-y-2">
            <Label>Box Shadow</Label>
            <Select
              value={localStyling.boxShadow || "none"}
              onValueChange={(val) => handleChange("boxShadow", val)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select shadow" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                <SelectItem value="0 1px 2px 0 rgb(0 0 0 / 0.05)">Subtle</SelectItem>
                <SelectItem value="0 4px 6px -1px rgb(0 0 0 / 0.1)">Medium</SelectItem>
                <SelectItem value="0 10px 15px -3px rgb(0 0 0 / 0.1)">Strong</SelectItem>
                <SelectItem value="0 20px 25px -5px rgb(0 0 0 / 0.1)">Heavy</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
