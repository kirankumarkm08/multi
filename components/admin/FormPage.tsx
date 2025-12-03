"use client";

import { DynamicPageData as PageData, FormConfig, SubmitMessage, FormField as FormFieldType } from "@/types";
import { FormField } from "./FormField";
import { SubmitButton } from "./FormSubmit";
import { MessageAlert } from "./MessageAlert";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AuthStorage } from "@/utils/storage";

interface FormPageProps {
  pageData: PageData;
  formData: Record<string, string>;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (name: string, value: string) => void;
  isSubmitting: boolean;
  submitMessage: SubmitMessage | null;
}

export function FormPage({
  pageData,
  formData,
  onSubmit,
  onInputChange,
  isSubmitting,
  submitMessage,
}: FormPageProps) {
  const [fields, setFields] = useState<FormFieldType[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Default fields for known page types
  const DEFAULT_LOGIN_FIELDS: FormFieldType[] = [
    {
      id: "email",
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Enter your password",
      required: true,
    },
  ];

  const DEFAULT_REGISTER_FIELDS: FormFieldType[] = [
    {
      id: "name",
      name: "name",
      label: "Full Name",
      type: "text",
      placeholder: "Enter your full name",
      required: true,
    },
    {
      id: "email",
      name: "email",
      label: "Email Address",
      type: "email",
      placeholder: "Enter your email",
      required: true,
    },
    {
      id: "password",
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Create a password",
      required: true,
    },
    {
      id: "confirm_password",
      name: "confirm_password",
      label: "Confirm Password",
      type: "password",
      placeholder: "Confirm your password",
      required: true,
    },
  ];

  // Parse form config or use defaults
  useEffect(() => {
    let formFields: FormFieldType[] = [];

    if (pageData.form_config) {
      try {
        const config = typeof pageData.form_config === 'string' 
          ? JSON.parse(pageData.form_config) 
          : pageData.form_config;
        
        if (config.fields && Array.isArray(config.fields) && config.fields.length > 0) {
          formFields = config.fields;
        }
      } catch (e) {
        console.error("Error parsing form config:", e);
      }
    }

    // If no fields found from config, use defaults based on page type
    if (formFields.length === 0) {
      if (pageData.page_type === "login") {
        formFields = DEFAULT_LOGIN_FIELDS;
      } else if (pageData.page_type === "register") {
        formFields = DEFAULT_REGISTER_FIELDS;
      }
    }

    setFields(formFields);
  }, [pageData.form_config, pageData.page_type]);
  
  // Redirect links based on slug
  const getAlternateLink = () => {
    if (pageData.page_type === "login") {
      return {
        text: "Don't have an account?",
        linkText: "Sign up",
        href: "/register" // This slug should come from your API
      };
    }
    
    if (pageData.page_type === "register") {
      return {
        text: "Already have an account?",
        linkText: "Sign in",
        href: "/login" 
      };
    }
    
    return null;
  };

  const getPageTitle = () => {
    return pageData.title;
  };

  const getPageSubtitle = () => {
    return pageData.meta_description;
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {getPageTitle()}
        </h1>
        {getPageSubtitle() && (
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {getPageSubtitle()}
          </p>
        )}
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        {fields.map((field) => (
          <FormField
            key={field.id}
            field={field}
            value={formData[field.name] || ""}
            onChange={onInputChange}
            error={errors[field.name]}
          />
        ))}

        {/* Remember me for login */}
        {pageData.page_type === "login" && (
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={formData.remember === "true"}
                onChange={(e) => onInputChange("remember", e.target.checked.toString())}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label
                htmlFor="remember"
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                Remember me
              </label>
            </div>
            
          
            <Link
              href="/forgot-password"
              className="text-sm text-blue-600 hover:text-blue-500 dark:text-blue-400"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <SubmitButton
          pageType={pageData.page_type}
          isSubmitting={isSubmitting}
        />

        {/* Alternate link */}
        {getAlternateLink() && (
          <div className="text-center mt-4">
            <p className="text-gray-600 dark:text-gray-400">
              {getAlternateLink()?.text}{" "}
              <Link
                href={getAlternateLink()?.href || "#"}
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
              >
                {getAlternateLink()?.linkText}
              </Link>
            </p>
          </div>
        )}
      </form>

      <MessageAlert message={submitMessage} />
    </div>
  );
}
