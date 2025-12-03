"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { FormField, FormConfig } from "@/services/formbuilder.service";

interface DynamicFormRendererProps {
  formData: {
    id: number;
    name: string;
    form_type: string;
    form_config: string | FormConfig;
    status: string;
  };
  onSubmit?: (data: Record<string, any>) => Promise<void>;
}

export default function DynamicFormRenderer({
  formData,
  onSubmit,
}: DynamicFormRendererProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  console.log("DynamicFormRenderer - Received formData:", formData);
  console.log(
    "DynamicFormRenderer - Form config type:",
    typeof formData?.form_config
  );
  console.log("DynamicFormRenderer - Form config:", formData?.form_config);
  console.log(
    "DynamicFormRenderer - Form fields:",
    formData?.form_config?.fields
  );

  // ✅ Parse form_config safely (string → object)
  let formConfig: FormConfig;
  try {
    formConfig =
      typeof formData.form_config === "string"
        ? JSON.parse(formData.form_config)
        : formData.form_config;

    console.log("DynamicFormRenderer - Parsed formConfig:", formConfig);
    console.log("DynamicFormRenderer - Parsed fields:", formConfig?.fields);
  } catch (error) {
    console.error("Invalid form_config JSON:", error);
    formConfig = { fields: [] };
  }

  const handleChange = (fieldName: string, value: any) => {
    setFormValues((prev) => ({ ...prev, [fieldName]: value }));
  };

  console.log("wwwwwwwwwwwwwwwww", formData.slug);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitMessage(null);

    try {
      // If a custom onSubmit function is passed as prop, use that
      const slugurl = formData.slug;
      const response = await fetch(
        `https://api.testjkl.in/api/guest/form/builder/${slugurl}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Origin: "localhost",
          },
          body: JSON.stringify(formValues),
        }
      );

      console.log("helloooooooo", response);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed: ${response.status} ${errorText}`);
        console.log(errorText);
      }

      setSubmitMessage({
        type: "success",
        text: "Form submitted successfully!",
      });
      setFormValues({});
    } catch (error: any) {
      console.error("Error submitting form:", error);
      setSubmitMessage({
        type: "error",
        text: error.message || "Failed to submit form",
      });
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field: FormField) => {
    const value = formValues[field.name] || "";

    switch (field.type) {
      case "text":
      case "email":
      case "number":
      case "tel":
      case "url":
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <Label
              htmlFor={field.name}
              className="font-medium text-gray-800 dark:text-gray-200"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.name}
              name={field.name}
              type={field.type}
              placeholder={field.placeholder || ""}
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        );

      case "textarea":
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <Label
              htmlFor={field.name}
              className="font-medium text-gray-800 dark:text-gray-200"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Textarea
              id={field.name}
              name={field.name}
              placeholder={field.placeholder || ""}
              required={field.required}
              value={value}
              onChange={(e) => handleChange(field.name, e.target.value)}
              rows={4}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            />
          </div>
        );

      case "select":
        return (
          <div key={field.id} className="flex flex-col space-y-1">
            <Label
              htmlFor={field.name}
              className="font-medium text-gray-800 dark:text-gray-200"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Select
              value={value}
              onValueChange={(val) => handleChange(field.name, val)}
            >
              <SelectTrigger className="w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-lg">
                <SelectValue
                  placeholder={field.placeholder || "Select an option"}
                />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option, index) => (
                  <SelectItem key={index} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case "radio":
        return (
          <div key={field.id} className="flex flex-col space-y-2">
            <Label className="font-medium text-gray-800 dark:text-gray-200">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <RadioGroup
              value={value}
              onValueChange={(val) => handleChange(field.name, val)}
              className="space-y-2"
            >
              {field.options?.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem
                    value={option}
                    id={`${field.name}-${index}`}
                  />
                  <Label
                    htmlFor={`${field.name}-${index}`}
                    className="font-normal"
                  >
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-2">
            <Checkbox
              id={field.name}
              checked={value === true}
              onCheckedChange={(checked) => handleChange(field.name, checked)}
            />
            <Label
              htmlFor={field.name}
              className="font-medium text-gray-800 dark:text-gray-200"
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      default:
        return null;
    }
  };

  const sortedFields = [...(formConfig.fields || [])].sort(
    (a, b) => a.order - b.order
  );

  console.log("DynamicFormRenderer - Sorted fields to render:", formData);

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-[#3f4d6b] rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {formData.name}
        </h2>
        {/* {formData.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {formData.description}
          </p>
        )} */}
      </div>

      {submitMessage && (
        <div
          className={`mb-6 p-4 rounded-md text-center ${
            submitMessage.type === "success"
              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
          }`}
        >
          {submitMessage.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {sortedFields.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No fields configured for this form</p>
          </div>
        ) : (
          <>
            {sortedFields.map((field) => renderField(field))}

            <Button
              type="submit"
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </Button>
          </>
        )}
      </form>
    </div>
  );
}
