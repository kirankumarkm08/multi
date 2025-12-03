"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formBuilderService } from "@/services";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Save, Plus, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const EditFormPage = () => {
  const params = useParams();
  const router = useRouter();
  const formId = params?.id as string;

  const [formConfig, setFormConfig] = useState<any[]>([]);
  const [page, setPage] = useState({ title: "", status: "draft" });
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // ✅ Fetch form data by ID
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const data = await formBuilderService.getForm(formId);
        if (data?.data) {
          const form = data.data;
          setPage({
            title: form.name,
            status: form.status || "draft",
          });
          setFormConfig(JSON.parse(form.form_config)?.fields || []);
        }
      } catch (err) {
        console.error("Error fetching form:", err);
        toast.error("Failed to load form data.");
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [formId]);

  // ✅ Handlers
  const handleSaveForm = async () => {
    try {
      setIsSaving(true);
      const payload = {
        name: page.title,
        status: page.status,
        form_config: JSON.stringify({ fields: formConfig }),
        form_type: "form_builder",
      };

      await formBuilderService.updateForm(formId, payload);
      toast.success("✅ Form saved successfully!");
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error("❌ Failed to save form.");
    } finally {
      setIsSaving(false);
    }
  };

  const addField = () => {
    const newField = {
      id: Date.now().toString(),
      name: `field_${formConfig.length + 1}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter value",
      order: formConfig.length,
      options: [],
    };
    setFormConfig([...formConfig, newField]);
  };

  const deleteField = (id: string) => {
    setFormConfig(formConfig.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: any) => {
    setFormConfig(
      formConfig.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const onSettingsChange = (updates: any) => {
    setPage((prev) => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="animate-spin h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold mb-8">Edit Form</h1>
          <Button onClick={handleSaveForm} size="sm" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Form
              </>
            )}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* LEFT SIDE — Settings */}
          <div className="w-full lg:w-1/3 space-y-4">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Form Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Form Name</Label>
                  <Input
                    value={page.title}
                    onChange={(e) =>
                      onSettingsChange({ title: e.target.value })
                    }
                    placeholder="Enter form name"
                  />
                </div>

                <div>
                  <Label>Status</Label>
                  <Select
                    value={page.status}
                    onValueChange={(v) => onSettingsChange({ status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Add Field</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={addField} className="w-full" size="lg">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Field
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* RIGHT SIDE — Fields */}
          <div className="flex-1 space-y-4">
            <h2 className="text-xl font-semibold">Form Fields</h2>

            {formConfig.length === 0 ? (
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">
                  No fields yet. Click “Add New Field” to get started.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {formConfig.map((field) => (
                  <div
                    key={field.id}
                    className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 relative group hover:shadow-md transition"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                        <Badge variant="outline">{field.type}</Badge>
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
                        className="opacity-0 group-hover:opacity-100 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Field Inputs */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Label</Label>
                        <Input
                          value={field.label}
                          onChange={(e) =>
                            updateField(field.id, { label: e.target.value })
                          }
                        />
                      </div>
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={field.name}
                          onChange={(e) =>
                            updateField(field.id, { name: e.target.value })
                          }
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Type</Label>
                        <Select
                          value={field.type}
                          onValueChange={(v) =>
                            updateField(field.id, { type: v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="number">Number</SelectItem>
                            <SelectItem value="radio">Radio</SelectItem>
                            <SelectItem value="textarea">Text Area</SelectItem>
                            <SelectItem value="checkbox">Checkbox</SelectItem>
                            <SelectItem value="select">Select</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center space-x-2 pt-6">
                        <input
                          type="checkbox"
                          checked={field.required}
                          onChange={(e) =>
                            updateField(field.id, {
                              required: e.target.checked,
                            })
                          }
                        />
                        <Label>Required</Label>
                      </div>
                    </div>

                    <div>
                      <Label>Placeholder / Default Value</Label>

                      {field.type === "textarea" ? (
                        <Textarea
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Enter text..."
                          className="min-h-[80px]"
                        />
                      ) : (
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Enter placeholder"
                        />
                      )}

                      {(field.type === "select" || field.type === "radio") && (
                        <div className="mt-4">
                          <Label>Options (comma-separated)</Label>
                          <Input
                            value={
                              field.optionsInput ||
                              field.options?.join(", ") ||
                              ""
                            }
                            onChange={(e) =>
                              updateField(field.id, {
                                optionsInput: e.target.value,
                                options: e.target.value
                                  .split(",")
                                  .map((o) => o.trim())
                                  .filter(Boolean),
                              })
                            }
                          />
                        </div>
                      )}
                    </div>
                    {(field.type === "select" || field.type === "radio") && (
                      <div className="mt-4">
                        <Label>Options (comma-separated)</Label>
                        <Input
                          value={
                            field.optionsInput ||
                            field.options?.join(", ") ||
                            ""
                          }
                          onChange={(e) =>
                            updateField(field.id, {
                              optionsInput: e.target.value,
                              options: e.target.value
                                .split(",")
                                .map((o) => o.trim())
                                .filter(Boolean),
                            })
                          }
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
  );
};

export default EditFormPage;
