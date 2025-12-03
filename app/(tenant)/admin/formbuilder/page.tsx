"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { GripVertical, Trash2, Plus,Loader2 ,Save} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { formBuilderService } from "@/services/formbuilder.service"
import {toast} from "sonner"

interface FormField {
  id: string
  name: string
  label: string
  type: string
  required: boolean
  placeholder: string
  order: number
  options?: string[]
}

interface PageSettings {
  title: string
  slug: string
  status: "draft" | "published" | "archived"
}

interface FormErrors {
  [key: string]: string
}

function FormField({
  label,
  id,
  value,
  onChange,
  placeholder,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div>
      <Label htmlFor={id} className="dark:text-gray-200 text-sm">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
      />
    </div>
  )
}

function SelectField({
  label,
  value,
  onValueChange,
  options,
}: {
  label: string
  value: string
  onValueChange: (value: string) => void
  options: { value: string; label: string }[]
}) {
  return (
    <div>
      <Label className="dark:text-gray-200 text-sm">{label}</Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
          {options.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

export default function BlogFormBuilder() {
  const [formConfig, setFormConfig] = useState<FormField[]>([])
  const [page, setPage] = useState<PageSettings>({
    title: "",
    slug: "",
   
    status: "draft",
  })
   const {token}=useAuth()

  const [sections, setSections] = useState<string[]>([])
  const [newSectionName, setNewSectionName] = useState("")
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [nextId, setNextId] = useState(1)

  const onSettingsChange = (updates: Partial<PageSettings>) => {
    setPage({ ...page, ...updates })
  }

  const addField = () => {
    const newField: FormField = {
      id: String(nextId),
      name: `field_${nextId}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value",
      order: formConfig.length,
    }
    setFormConfig([...formConfig, newField])
    setNextId(nextId + 1)
  }

  const addSection = () => {
    if (!newSectionName.trim()) return
    setSections([...sections, newSectionName.trim()])
    setNewSectionName("")
  }

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFormConfig(formConfig.map((f) => (f.id === id ? { ...f, ...updates } : f)))
  }

  const deleteField = (id: string) => {
    setFormConfig(formConfig.filter((f) => f.id !== id))
  }

  const handleDragStart = (e: React.DragEvent, id: string) => setDraggedId(id)
  const handleDragOver = (e: React.DragEvent) => e.preventDefault()
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    const draggedIndex = formConfig.findIndex((f) => f.id === draggedId)
    const targetIndex = formConfig.findIndex((f) => f.id === targetId)
    const newConfig = [...formConfig]
    const [draggedField] = newConfig.splice(draggedIndex, 1)
    newConfig.splice(targetIndex, 0, draggedField)
    setFormConfig(newConfig.map((f, i) => ({ ...f, order: i })))
    setDraggedId(null)
  }
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveForm = async () => {
    setIsSaving(true)
    try {
        const formData = {
            name: page.title || "Untitled Form",
            form_type: "form_builder",
            form_config: JSON.stringify({
              fields: formConfig.map((f) => ({
                id: f.id,
                name: f.name,
                label: f.label,
                type: f.type,
                required: f.required,
                placeholder: f.placeholder,
                order: f.order,
                options: f.options || [],
              })),
            }),
            status: page.status,
          }
          

      const result = await formBuilderService.createForm(formData, token)

      toast("✅ Form saved successfully!")
      console.log("Saved form:", result)
    } catch (error: any) {
      console.error("Error saving form:", error)
      toast(`❌ ${error.message}`)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto ">
        <div className="flex justify-between items-center">
         <h1 className="text-3xl font-bold mb-8"> Form Builder</h1>
        <div className="">
           <Button
                onClick={handleSaveForm}
                size="sm"
                disabled={isSaving || !token}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Page
                  </>
                )}
              </Button>    
        </div>    
        </div>
       
     

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE — Settings and Add Field */}
          <div className="w-full lg:w-1/3 space-y-4">
            {/* Page Settings card */}
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <FormField
                    label="Form Name"
                    id="form-name"
                    value={page.title}
                    onChange={(value) => onSettingsChange({ title: value })}
                    placeholder="Page title"
                  />

                  {/* <FormField
                    label="URL Slug"
                    id="page-slug"
                    value={page.slug}
                    onChange={(value) => onSettingsChange({ slug: value })}
                    placeholder="page-url"
                  /> */}

               

                  <SelectField
                    label="Status"
                    value={page.status}
                    onValueChange={(value: string) =>
                      onSettingsChange({ status: value as "draft" | "published" | "archived" })
                    }
                    options={[
                      { value: "draft", label: "Draft" },
                      { value: "published", label: "Published" },
                      { value: "archived", label: "Archived" },
                    ]}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Add Field</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={addField} className="w-full" size="lg">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Field
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE — Form Builder */}
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-semibold">Form Fields</h2>

            {formConfig.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No fields yet. Click "Add New Field" to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {formConfig.map((field) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative group hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow"
                    draggable
                    onDragStart={(e) => handleDragStart(e, field.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, field.id)}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-move" />
                        <Badge variant="outline" className="dark:border-gray-600 dark:text-gray-300">
                          {field.type}
                        </Badge>
                        {field.required && (
                          <Badge variant="destructive" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteField(field.id)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-gray-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="dark:text-gray-200 text-sm">Field Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
                        />
                      </div>
                      <div>
                        <Label className="dark:text-gray-200 text-sm">Field Name</Label>
                        <Input
                          value={field.name}
                          onChange={(e) => updateField(field.id, { name: e.target.value })}
                          className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label className="dark:text-gray-200 text-sm">Field Type</Label>
                        <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v })}>
                          <SelectTrigger className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="dark:bg-gray-800 dark:border-gray-600">
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="tel">Phone</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="textarea">Textarea</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="radio">Radio</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) => updateField(field.id, { required: e.target.checked })}
                          className="h-4 w-4 dark:bg-gray-800 dark:border-gray-600"
                        />
                        <Label className="dark:text-gray-200 text-sm">Required</Label>
                      </div>
                    </div>

                    <div>
                      <Label className="dark:text-gray-200 text-sm">Placeholder</Label>
                      <Input
                        value={field.placeholder}
                        onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                        className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
                      />
                    </div>

                    {(field.type === "select" || field.type === "radio") && (
                      <div className="mt-4">
                        <Label className="dark:text-gray-200 text-sm">Options (comma-separated)</Label>
                        <Input
                          value={field.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((o) => o.trim())
                                .filter(Boolean),
                            })
                          }
                          className="dark:bg-gray-800 dark:border-gray-600 dark:text-white mt-1"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
