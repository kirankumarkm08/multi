"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { Save, Plus, Trash2, GripVertical, Loader2 } from "lucide-react";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import { defaultRegistrationFields } from "@/constants/registrationfields";
import type { RegistrationPage, FormField } from "@/types/formfields";
import { toast } from "sonner";

export default function RegistrationPageBuilder() {
  const { token, isInitialized } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  const [page, setPage] = useState<RegistrationPage>({
    id: "",
    title: "Event Registration",
    slug: "",
    page_type: "register",
    form_config: defaultRegistrationFields,
    settings: {
      submitButtonText: "Register Now",
      successMessage: "Thank you for registering!",
      redirectUrl: "",
    },
    status: "draft",
  });

  useEffect(() => {
    if (!isInitialized) return;
    if (!token) return;

    const pageId = new URLSearchParams(window.location.search).get("id");
    if (pageId) {
      loadPage(pageId);
    }
  }, [token, isInitialized]);

  const loadPage = async (pageId: string) => {
    try {
      const data = await apiFetch(`/tenant/pages/${pageId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // Parse form_config if it's a string
      let formConfig = data.form_config;
      if (typeof formConfig === "string") {
        try {
          formConfig = JSON.parse(formConfig);
        } catch {
          formConfig = { fields: [] };
        }
      }

      // Extract fields array
      let formFields: FormField[] = [];
      if (Array.isArray(formConfig)) {
        formFields = formConfig;
      } else if (formConfig?.fields) {
        formFields = formConfig.fields;
      } else {
        formFields = defaultRegistrationFields;
      }

      // Parse settings if it's a string
      let settings = data.settings;
      if (typeof settings === "string") {
        try {
          settings = JSON.parse(settings);
        } catch {
          settings = {};
        }
      }

      setPage({
        ...data,
        form_config: formFields,
        settings: {
          submitButtonText: settings?.submitButtonText || "Register Now",
          successMessage:
            settings?.successMessage || "Thank you for registering!",
          redirectUrl: settings?.redirectUrl || "",
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      toast.error("Failed to load page data");
    }
  };

  const addField = () => {
    const newField: FormField = {
      id: Date.now().toString(),
      name: `field_${Date.now()}`,
      label: "New Field",
      type: "text",
      required: false,
      placeholder: "Enter text",
      order: page.form_config.length,
    };

    setPage((prev) => ({
      ...prev,
      form_config: [...prev.form_config, newField],
    }));
  };

  const updateField = (fieldId: string, updates: Partial<FormField>) => {
    setPage((prev) => ({
      ...prev,
      form_config: prev.form_config.map((field) =>
        field.id === fieldId ? { ...field, ...updates } : field
      ),
    }));
  };

  const deleteField = (fieldId: string) => {
    const field = page.form_config.find((f) => f.id === fieldId);
    const protectedFields = [
      "first_name",
      "last_name",
      "email",
      "password",
      "phone",
    ];

    if (field && protectedFields.includes(field.name)) {
      toast.error("Cannot delete required default fields");
      return;
    }

    setPage((prev) => ({
      ...prev,
      form_config: prev.form_config.filter((field) => field.id !== fieldId),
    }));
  };

  const savePage = async () => {
    if (!page.title?.trim()) {
      toast.error("Page title is required");
      return;
    }

    if (!page.form_config?.length) {
      toast.error("At least one form field is required");
      return;
    }

    setIsSaving(true);
    try {
      const formConfigToSave = {
        fields: page.form_config.map((field, index) => ({
          ...field,
          order: field.order ?? index,
        })),
      };

      const requestData = {
        title: page.title.trim(),
        slug: page.slug?.trim() || null,
        page_type: page.page_type,
        form_config: JSON.stringify(formConfigToSave),
        settings: JSON.stringify(page.settings),
        status: page.status,
        // API-aligned fields from screenshot
        position: 1, // Default position as shown in API
        show_in_nav: 1, // Boolean as 0/1 per API
        show_in_footer: 0, // Boolean as 0/1 per API
        metadata: "", // Optional field from API
      };

      const endpoint = page.id ? `/tenant/pages/${page.id}` : `/tenant/pages`;
      const method = page.id ? "PATCH" : "POST";

      const savedPage = await apiFetch(endpoint, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      if (!page.id && savedPage.id) {
        setPage((prev) => ({ ...prev, id: savedPage.id }));
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.set("id", savedPage.id);
        window.history.replaceState({}, "", newUrl.toString());
      }

      toast.success(
        page.id ? "Page updated successfully!" : "Page created successfully!"
      );

      if (!page.id && savedPage.id) {
        await loadPage(savedPage.id);
      }
    } catch (error: any) {
      console.error("Save error:", error);
      if (error?.data?.errors) {
        const errorMessages = Object.values(error.data.errors)
          .flat()
          .join("\n");
        toast.error(`Validation failed:\n${errorMessages}`);
      } else {
        toast.error(
          error?.data?.message || error?.message || "Failed to save page"
        );
      }
    } finally {
      setIsSaving(false);
    }
  };

  const deletePage = async () => {
    if (!page.id) return;
    if (!confirm("Delete this registration page?")) return;

    setIsDeleting(true);
    try {
      confirm(
        "Are you sure you want to delete this page? This action cannot be undone."
      );
      if (!confirm) return;
      await apiFetch(`/tenant/pages/${page.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Registration page deleted successfully");

      // Reset to default
      setPage({
        id: "",
        title: "Event Registration",
        slug: "",
        page_type: "register",
        form_config: defaultRegistrationFields,
        settings: {
          submitButtonText: "Register Now",
          successMessage: "Thank you for registering!",
          redirectUrl: "",
        },
        status: "draft",
      });

      window.history.pushState({}, "", window.location.pathname);
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(error?.message || "Failed to delete page");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (e: React.DragEvent, fieldId: string) => {
    setDraggedField(fieldId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, targetFieldId: string) => {
    e.preventDefault();
    if (!draggedField || draggedField === targetFieldId) return;

    const draggedIndex = page.form_config.findIndex(
      (f) => f.id === draggedField
    );
    const targetIndex = page.form_config.findIndex(
      (f) => f.id === targetFieldId
    );
    const newFields = [...page.form_config];
    const [draggedItem] = newFields.splice(draggedIndex, 1);
    newFields.splice(targetIndex, 0, draggedItem);

    const updatedFields = newFields.map((field, index) => ({
      ...field,
      order: index,
    }));

    setPage((prev) => ({ ...prev, form_config: updatedFields }));
    setDraggedField(null);
  };

  const sortedFields = [...page.form_config].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Registration Page Builder
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <Badge
                  variant="secondary"
                  className="dark:bg-gray-700 dark:text-gray-200"
                >
                  Registration Form
                </Badge>
                <Badge
                  variant={
                    page.status === "published"
                      ? "default"
                      : page.status === "archived"
                      ? "destructive"
                      : "outline"
                  }
                  className={
                    page.status === "draft"
                      ? "dark:border-gray-600 dark:text-gray-200"
                      : ""
                  }
                >
                  {page.status?.charAt(0).toUpperCase() + page.status?.slice(1)}
                </Badge>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={savePage} size="sm" disabled={isSaving}>
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
              {page.id && (
                <Button
                  onClick={deletePage}
                  size="sm"
                  variant="destructive"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Page Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="page-title" className="dark:text-gray-200">
                    Page Title *
                  </Label>
                  <Input
                    id="page-title"
                    value={page.title}
                    onChange={(e) =>
                      setPage((prev) => ({ ...prev, title: e.target.value }))
                    }
                    placeholder="Event Registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label htmlFor="page-slug" className="dark:text-gray-200">
                    Page Slug
                  </Label>
                  <h2>/register</h2>
                  {/* <Input
                   disabled
                    id="page-slug"
                    value={page.slug}
                    onChange={(e) => setPage(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="event-registration"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  /> */}
                </div>

                <div>
                  <Label className="dark:text-gray-200">Form Type</Label>
                  <Badge>{page.page_type}</Badge>
                </div>

                <div>
                  <Label htmlFor="page-status" className="dark:text-gray-200">
                    Status
                  </Label>
                  <Select
                    value={page.status}
                    onValueChange={(
                      value: "draft" | "published" | "archived"
                    ) => setPage((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger
                      id="page-status"
                      className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="submit-text" className="dark:text-gray-200">
                    Submit Button Text
                  </Label>
                  <Input
                    id="submit-text"
                    value={page.settings.submitButtonText}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          submitButtonText: e.target.value,
                        },
                      }))
                    }
                    placeholder="Register Now"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="success-message"
                    className="dark:text-gray-200"
                  >
                    Success Message
                  </Label>
                  <Input
                    id="success-message"
                    value={page.settings.successMessage}
                    onChange={(e) =>
                      setPage((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          successMessage: e.target.value,
                        },
                      }))
                    }
                    placeholder="Thank you for registering!"
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Add New Field</CardTitle>
              </CardHeader>
              <CardContent>
                <Button onClick={addField} className="w-full">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Field
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Form Builder */}
          <div className="lg:col-span-2">
            <Card className="dark:bg-gray-800 dark:border-gray-700">
              <CardHeader className="dark:border-gray-700">
                <CardTitle className="dark:text-white">Form Builder</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedFields.map((field) => (
                    <div
                      key={field.id}
                      className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 dark:bg-gray-750 relative group hover:shadow-md dark:hover:shadow-gray-900/20 transition-shadow"
                      draggable
                      onDragStart={(e) => handleDragStart(e, field.id)}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, field.id)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500 cursor-move" />
                          <Badge
                            variant="outline"
                            className="dark:border-gray-600 dark:text-gray-300"
                          >
                            {field.type}
                          </Badge>
                          {field.required && (
                            <Badge variant="destructive" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        {![
                          "first_name",
                          "last_name",
                          "email",
                          "password",
                          "phone",
                        ].includes(field.name) && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteField(field.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity dark:hover:bg-gray-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="dark:text-gray-200">
                            Field Label
                          </Label>
                          <Input
                            value={field.label}
                            onChange={(e) =>
                              updateField(field.id, { label: e.target.value })
                            }
                            placeholder="Field label"
                            className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                        <div>
                          <Label className="dark:text-gray-200">
                            Field Name
                          </Label>
                          <Input
                            value={field.name}
                            onChange={(e) =>
                              updateField(field.id, { name: e.target.value })
                            }
                            placeholder="field_name"
                            disabled={[
                              "first_name",
                              "last_name",
                              "email",
                              "password",
                              "phone",
                            ].includes(field.name)}
                            className="dark:bg-gray-600 dark:border-gray-500 dark:text-white disabled:dark:bg-gray-700"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <Label className="dark:text-gray-200">
                            Field Type
                          </Label>
                          <Select
                            value={field.type}
                            onValueChange={(value) =>
                              updateField(field.id, { type: value as any })
                            }
                          >
                            <SelectTrigger className="dark:bg-gray-600 dark:border-gray-500 dark:text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                              <SelectItem value="text">Text</SelectItem>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="tel">Phone</SelectItem>
                              <SelectItem value="password">Password</SelectItem>
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
                            id={`required-${field.id}`}
                            checked={field.required}
                            onChange={(e) =>
                              updateField(field.id, {
                                required: e.target.checked,
                              })
                            }
                            disabled={[
                              "first_name",
                              "last_name",
                              "email",
                              "password",
                              "phone",
                            ].includes(field.name)}
                            className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
                          />
                          <Label
                            htmlFor={`required-${field.id}`}
                            className="dark:text-gray-200"
                          >
                            Required
                          </Label>
                        </div>
                      </div>

                      <div>
                        <Label className="dark:text-gray-200">
                          Placeholder
                        </Label>
                        <Input
                          value={field.placeholder || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              placeholder: e.target.value,
                            })
                          }
                          placeholder="Enter placeholder text"
                          className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                        />
                      </div>

                      {(field.type === "select" || field.type === "radio") && (
                        <div className="mt-4">
                          <Label className="dark:text-gray-200">
                            Options (comma-separated)
                          </Label>
                          <Input
                            value={field.options?.join(", ") || ""}
                            onChange={(e) =>
                              updateField(field.id, {
                                options: e.target.value
                                  .split(",")
                                  .map((o) => o.trim())
                                  .filter((o) => o),
                              })
                            }
                            placeholder="Option 1, Option 2, Option 3"
                            className="dark:bg-gray-600 dark:border-gray-500 dark:text-white"
                          />
                        </div>
                      )}

                      {/* Field Preview */}
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded">
                        <Label className="text-sm font-medium dark:text-gray-200">
                          {field.label}
                          {field.required && (
                            <span className="text-red-500 ml-1">*</span>
                          )}
                        </Label>
                        {field.type === "textarea" ? (
                          <textarea
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white"
                            placeholder={field.placeholder}
                            disabled
                            rows={3}
                          />
                        ) : field.type === "select" ? (
                          <select
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white"
                            disabled
                          >
                            <option>
                              {field.placeholder || "Select an option"}
                            </option>
                            {field.options?.map((option, index) => (
                              <option key={index}>{option}</option>
                            ))}
                          </select>
                        ) : field.type === "checkbox" ? (
                          <div className="mt-1 flex items-center space-x-2">
                            <input
                              type="checkbox"
                              disabled
                              className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
                            />
                            <span className="text-sm dark:text-gray-300">
                              {field.placeholder || field.label}
                            </span>
                          </div>
                        ) : field.type === "radio" ? (
                          <div className="mt-1 space-y-2">
                            {field.options?.map((option, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-2"
                              >
                                <input
                                  type="radio"
                                  name={field.name}
                                  disabled
                                  className="h-4 w-4 dark:bg-gray-600 dark:border-gray-500"
                                />
                                <span className="text-sm dark:text-gray-300">
                                  {option}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <input
                            type={field.type}
                            className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-500 rounded-md bg-white dark:bg-gray-600 dark:text-white"
                            placeholder={field.placeholder}
                            disabled
                          />
                        )}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                    <Button className="w-full" disabled>
                      {page.settings.submitButtonText}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
