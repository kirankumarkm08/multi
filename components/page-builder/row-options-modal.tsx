"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { X, Copy, Trash2 } from "lucide-react"

interface RowOptionsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  rowId: string
  sectionId: string
  currentSettings?: any
  onSave?: (settings: any) => void
  onDelete?: () => void
  onDuplicate?: () => void
}

export function RowOptionsModal({ 
  open, 
  onOpenChange,
  rowId,
  sectionId,
  currentSettings,
  onSave,
  onDelete,
  onDuplicate
}: RowOptionsModalProps) {
  const [settings, setSettings] = useState<any>({})

  // Initialize state from props when modal opens
  useEffect(() => {
    if (open) {
      setSettings(currentSettings ? JSON.parse(JSON.stringify(currentSettings)) : {})
    }
  }, [open, currentSettings])

  const updateSettings = (updates: any) => {
    setSettings((prev: any) => ({ ...prev, ...updates }))
  }

  const updateNestedSetting = (category: string, key: string, value: string) => {
    setSettings((prev: any) => ({
      ...prev,
      [category]: {
        ...(prev[category] || {}),
        [key]: value
      }
    }))
  }

  const handleApply = () => {
    if (onSave) {
      onSave(settings)
    }
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80" onClick={() => onOpenChange(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 max-h-[90vh] bg-card border border-border rounded-lg shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-foreground">Row Options</h2>
            <div className="flex items-center gap-1">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
                onClick={onDuplicate}
              >
                <Copy className="w-4 h-4 mr-1.5" />
                Copy
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-red-500 hover:text-red-400 hover:bg-red-500/10"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-1.5" />
                Delete
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <Tabs defaultValue="layout" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="background">Background</TabsTrigger>
              <TabsTrigger value="style">Style</TabsTrigger>
            </TabsList>

            <TabsContent value="layout" className="space-y-6">
              {/* Padding */}
              <div className="space-y-3">
                <Label>Padding</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input 
                      value={settings.padding?.top || "0px"} 
                      onChange={(e) => updateNestedSetting("padding", "top", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input 
                      value={settings.padding?.right || "0px"} 
                      onChange={(e) => updateNestedSetting("padding", "right", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input 
                      value={settings.padding?.bottom || "0px"} 
                      onChange={(e) => updateNestedSetting("padding", "bottom", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input 
                      value={settings.padding?.left || "0px"} 
                      onChange={(e) => updateNestedSetting("padding", "left", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Margin */}
              <div className="space-y-3">
                <Label>Margin</Label>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Top</Label>
                    <Input 
                      value={settings.margin?.top || "0px"} 
                      onChange={(e) => updateNestedSetting("margin", "top", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Right</Label>
                    <Input 
                      value={settings.margin?.right || "0px"} 
                      onChange={(e) => updateNestedSetting("margin", "right", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Bottom</Label>
                    <Input 
                      value={settings.margin?.bottom || "0px"} 
                      onChange={(e) => updateNestedSetting("margin", "bottom", e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Left</Label>
                    <Input 
                      value={settings.margin?.left || "0px"} 
                      onChange={(e) => updateNestedSetting("margin", "left", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Min Height */}
              <div className="space-y-3">
                <Label>Minimum Height</Label>
                <Input 
                  value={settings.minHeight || ""} 
                  onChange={(e) => updateSettings({ minHeight: e.target.value })}
                  placeholder="e.g. 300px, 50vh"
                />
              </div>
            </TabsContent>

            <TabsContent value="background" className="space-y-6">
              <div className="space-y-3">
                <Label>Background Color</Label>
                <div className="flex gap-2">
                  <Input 
                    type="color" 
                    className="w-12 h-10 p-1 cursor-pointer"
                    value={settings.backgroundColor || "#ffffff"}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                  />
                  <Input 
                    value={settings.backgroundColor || ""} 
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    placeholder="#ffffff"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>Background Image URL</Label>
                <Input 
                  value={settings.backgroundImage || ""} 
                  onChange={(e) => updateSettings({ backgroundImage: e.target.value })}
                  placeholder="https://..."
                />
              </div>

              {settings.backgroundImage && (
                <>
                  <div className="space-y-3">
                    <Label>Background Size</Label>
                    <Select 
                      value={settings.backgroundSize || "cover"} 
                      onValueChange={(val) => updateSettings({ backgroundSize: val })}
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

                  <div className="space-y-3">
                    <Label>Background Position</Label>
                    <Select 
                      value={settings.backgroundPosition || "center"} 
                      onValueChange={(val) => updateSettings({ backgroundPosition: val })}
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

            <TabsContent value="style" className="space-y-6">
              <div className="space-y-3">
                <Label>Border</Label>
                <Input 
                  value={settings.border || ""} 
                  onChange={(e) => updateSettings({ border: e.target.value })}
                  placeholder="e.g. 1px solid #e2e8f0"
                />
              </div>

              <div className="space-y-3">
                <Label>Border Radius</Label>
                <Input 
                  value={settings.borderRadius || ""} 
                  onChange={(e) => updateSettings({ borderRadius: e.target.value })}
                  placeholder="e.g. 8px"
                />
              </div>

              <div className="space-y-3">
                <Label>Box Shadow</Label>
                <Input 
                  value={settings.boxShadow || ""} 
                  onChange={(e) => updateSettings({ boxShadow: e.target.value })}
                  placeholder="e.g. 0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                />
              </div>

              <div className="space-y-3">
                <Label>Custom CSS</Label>
                <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={settings.customCSS || ""} 
                  onChange={(e) => updateSettings({ customCSS: e.target.value })}
                  placeholder="Enter custom CSS..."
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-secondary/30 flex items-center justify-end gap-3 shrink-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleApply}
          >
            Apply Changes
          </Button>
        </div>
      </div>
    </div>
  )
}
