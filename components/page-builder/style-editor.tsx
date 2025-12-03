"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
// import { ColorPicker } from "@/components/ui/color-picker"; // Assuming this doesn't exist yet, using Input for color
import { Slider } from "@/components/ui/slider";

interface StyleEditorProps {
  target: "row" | "column";
  style: any;
  onStyleChange: (style: any) => void;
  onClose: () => void;
}

export function StyleEditor({ target, style, onStyleChange, onClose }: StyleEditorProps) {
  const [currentStyle, setCurrentStyle] = useState(style || {});

  const updateStyle = (updates: any) => {
    const newStyle = { ...currentStyle, ...updates };
    setCurrentStyle(newStyle);
    onStyleChange(newStyle);
  };

  const updatePadding = (side: string, value: string) => {
    const padding = currentStyle.padding || { top: "0", right: "0", bottom: "0", left: "0" };
    updateStyle({
      padding: { ...padding, [side]: value }
    });
  };

  const updateMargin = (side: string, value: string) => {
    const margin = currentStyle.margin || { top: "0", right: "0", bottom: "0", left: "0" };
    updateStyle({
      margin: { ...margin, [side]: value }
    });
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex justify-between items-center">
          <span>Edit {target === "row" ? "Row" : "Column"} Style</span>
          <Button variant="ghost" size="sm" onClick={onClose}>×</Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="background">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="background">Background</TabsTrigger>
            <TabsTrigger value="spacing">Spacing</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="background" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="backgroundColor">Background Color</Label>
              <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={currentStyle.backgroundColor || "#ffffff"}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                  />
                  <Input
                    value={currentStyle.backgroundColor || ""}
                    onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                  />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="backgroundImage">Background Image</Label>
              <Input
                id="backgroundImage"
                value={currentStyle.backgroundImage || ""}
                onChange={(e) => updateStyle({ backgroundImage: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            {currentStyle.backgroundImage && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="backgroundSize">Background Size</Label>
                  <Select
                    value={currentStyle.backgroundSize || "cover"}
                    onValueChange={(value: any) => updateStyle({ backgroundSize: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cover">Cover</SelectItem>
                      <SelectItem value="contain">Contain</SelectItem>
                      <SelectItem value="auto">Auto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="backgroundPosition">Background Position</Label>
                  <Select
                    value={currentStyle.backgroundPosition || "center"}
                    onValueChange={(value: string) => updateStyle({ backgroundPosition: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="center">Center</SelectItem>
                      <SelectItem value="top">Top</SelectItem>
                      <SelectItem value="bottom">Bottom</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </TabsContent>

          <TabsContent value="spacing" className="space-y-3">
            {target === "row" && (
              <div className="space-y-2">
                <Label htmlFor="minHeight">Minimum Height</Label>
                <Input
                  id="minHeight"
                  value={currentStyle.minHeight || ""}
                  onChange={(e) => updateStyle({ minHeight: e.target.value })}
                  placeholder="200px, 50vh, etc."
                />
              </div>
            )}

            <div className="space-y-3">
              <Label>Padding</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="paddingTop" className="text-xs">Top</Label>
                  <Input
                    id="paddingTop"
                    value={currentStyle.padding?.top || "0"}
                    onChange={(e) => updatePadding("top", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="paddingRight" className="text-xs">Right</Label>
                  <Input
                    id="paddingRight"
                    value={currentStyle.padding?.right || "0"}
                    onChange={(e) => updatePadding("right", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="paddingBottom" className="text-xs">Bottom</Label>
                  <Input
                    id="paddingBottom"
                    value={currentStyle.padding?.bottom || "0"}
                    onChange={(e) => updatePadding("bottom", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="paddingLeft" className="text-xs">Left</Label>
                  <Input
                    id="paddingLeft"
                    value={currentStyle.padding?.left || "0"}
                    onChange={(e) => updatePadding("left", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Margin</Label>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="marginTop" className="text-xs">Top</Label>
                  <Input
                    id="marginTop"
                    value={currentStyle.margin?.top || "0"}
                    onChange={(e) => updateMargin("top", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="marginRight" className="text-xs">Right</Label>
                  <Input
                    id="marginRight"
                    value={currentStyle.margin?.right || "0"}
                    onChange={(e) => updateMargin("right", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="marginBottom" className="text-xs">Bottom</Label>
                  <Input
                    id="marginBottom"
                    value={currentStyle.margin?.bottom || "0"}
                    onChange={(e) => updateMargin("bottom", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="marginLeft" className="text-xs">Left</Label>
                  <Input
                    id="marginLeft"
                    value={currentStyle.margin?.left || "0"}
                    onChange={(e) => updateMargin("left", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="borderRadius">Border Radius</Label>
              <Input
                id="borderRadius"
                value={currentStyle.borderRadius || ""}
                onChange={(e) => updateStyle({ borderRadius: e.target.value })}
                placeholder="4px, 50%, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="border">Border</Label>
              <Input
                id="border"
                value={currentStyle.border || ""}
                onChange={(e) => updateStyle({ border: e.target.value })}
                placeholder="1px solid #e2e8f0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="boxShadow">Box Shadow</Label>
              <Input
                id="boxShadow"
                value={currentStyle.boxShadow || ""}
                onChange={(e) => updateStyle({ boxShadow: e.target.value })}
                placeholder="0 4px 6px -1px rgba(0, 0, 0, 0.1)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="textAlign">Text Alignment</Label>
              <Select
                value={currentStyle.textAlign || "left"}
                onValueChange={(value: any) => updateStyle({ textAlign: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Left</SelectItem>
                  <SelectItem value="center">Center</SelectItem>
                  <SelectItem value="right">Right</SelectItem>
                  <SelectItem value="justify">Justify</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customCSS">Custom CSS</Label>
              <textarea
                id="customCSS"
                value={currentStyle.customCSS || ""}
                onChange={(e) => updateStyle({ customCSS: e.target.value })}
                placeholder="Enter custom CSS here..."
                className="w-full h-20 p-2 text-sm border rounded-md resize-none"
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
