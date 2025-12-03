"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Loader2 } from "lucide-react";
import { tenantApi } from "@/lib/api";
import { ContactPage } from "@/types";
import { toast } from "sonner";

// Constants
const DEFAULT_CONTACT_PAGE: ContactPage = {
  id: "",
  name: "Contact Page",
  slug: "contact-us",
  title: "Contact Us",
  description:
    "We'd love to hear from you. Fill out the form and we'll respond soon.",
  meta_description: "",
  meta_keywords: "",
  show_in_nav: 0,
  settings: {
    nameLabel: "Your Name",
    emailLabel: "Email Address",
    messageLabel: "Message",
    submitButtonText: "Send Message",
    recipientEmail: "",
  },
};

// Utilities
const sanitizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const parseJSON = <T,>(value: string | T, fallback: T): T => {
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value || fallback;
};

interface FormField {
  id: string;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string;
  order: number;
}

const createFormFields = (page: ContactPage): FormField[] => {
  const fields: FormField[] = [
    {
      id: "name",
      name: "name",
      label: page.settings.nameLabel.trim(),
      type: "text",
      required: true,
      placeholder: "Enter your full name",
      order: 0,
    },
    {
      id: "email",
      name: "email",
      label: page.settings.emailLabel.trim(),
      type: "email",
      required: true,
      placeholder: "Enter your email address",
      order: 1,
    },
    {
      id: "message",
      name: "message",
      label: page.settings.messageLabel.trim(),
      type: "textarea",
      required: true,
      placeholder: "Enter your message",
      order: 2,
    },
  ];

  return fields;
};

const validatePage = (page: ContactPage): string[] => {
  const errors: string[] = [];

  if (!page.name.trim()) errors.push("Page name is required");
  if (!page.title.trim()) errors.push("Page title is required");
  if (!page.settings.nameLabel.trim()) errors.push("Name label is required");
  if (!page.settings.emailLabel.trim()) errors.push("Email label is required");

  return errors;
};

// Main Component
export default function ContactPageBuilder() {
  const [page, setPage] = useState<ContactPage>(DEFAULT_CONTACT_PAGE);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
      loadPage(id);
    } else {
      loadLatestContactPage();
    }
  }, []);

  const loadLatestContactPage = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await tenantApi.getPageByType("contact_us");
      const pages = Array.isArray(response?.data) ? response.data : response?.data ? [response.data] : [];

      if (pages.length > 0) {
        // Sort by ID descending to get the latest
        const latestPage = pages.sort((a: any, b: any) => Number(b.id) - Number(a.id))[0];
        await loadPage(latestPage.id);
        window.history.replaceState({}, "", `?id=${latestPage.id}`);
      } else {
        // No contact page exists, user can create a new one
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Failed to load contact pages:", error);
      // If 404 or error, allow user to create new page
      setIsLoading(false);
    }
  }, []);

  const loadPage = useCallback(async (id: string) => {
    try {
      setIsLoading(true);
      const response = await tenantApi.getPageById(Number(id));
      const data = response?.data || response;

      const formConfig = parseJSON(data.form_config, { fields: [] });
      const fields =
        formConfig?.fields || (Array.isArray(formConfig) ? formConfig : []);
      const settings = parseJSON(data.settings, {});

      const findFieldLabel = (fieldName: string, defaultLabel: string) =>
        fields.find((f: any) => f.name === fieldName)?.label || defaultLabel;

      setPage({
        id: data.id,
        name: data.title || data.name || "Contact Page",
        slug: data.slug || "contact",
        title: data.title || "Contact Us",
        description: data.description || DEFAULT_CONTACT_PAGE.description,
        meta_description: data.meta_description || "",
        meta_keywords: Array.isArray(data.meta_keywords)
          ? data.meta_keywords.join(", ")
          : data.meta_keywords || "",
        show_in_nav: data.show_in_nav || 0,
        settings: {
          nameLabel: findFieldLabel("name", "Your Name"),
          emailLabel: findFieldLabel("email", "Email Address"),
          messageLabel: findFieldLabel("message", "Message"),
          submitButtonText: settings?.submitButtonText || "Send Message",
          recipientEmail: settings?.recipientEmail || "",
        },
      });
    } catch (error) {
      console.error("Failed to load page:", error);
      toast.error("Failed to load contact page");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const savePage = useCallback(async () => {
    const validationErrors = validatePage(page);
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsSaving(true);
    setErrors([]);

    try {
      const slug = sanitizeSlug(page.slug || page.name);
      const formFields = createFormFields(page);

      const body = {
        title: page.title.trim(),
        slug,
        page_type: "contact_us",
        form_config: JSON.stringify({ fields: formFields }),
        metadata: JSON.stringify({
          description: page.description,
          recipientEmail: page.settings.recipientEmail,
        }),
        meta_description: page.meta_description || "",
        meta_keywords: page.meta_keywords || "",
        show_in_nav: page.show_in_nav,
        show_in_footer: 0,
        status: "published",
        position: 1,
      };

      const saved = page.id
        ? await tenantApi.updatePage(Number(page.id), body)
        : await tenantApi.createPage(body);

      const savedId = saved?.data?.id || saved?.id;

      if (savedId) {
        setPage((prev) => ({ ...prev, id: savedId, slug }));
        window.history.pushState({}, "", `?id=${savedId}`);
        toast.success("Contact page saved successfully");
      }
    } catch (error: any) {
      console.error("Save error:", error);
      const errorMessage = error?.message || "Failed to save page";
      setErrors([errorMessage]);
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  }, [page]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-gray-600 dark:text-gray-400" />
          <p className="text-gray-600 dark:text-gray-400">Loading contact page...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header isSaving={isSaving} onSave={savePage} />
      {errors.length > 0 && <ErrorDisplay errors={errors} />}

      <div className="container mx-auto p-6 grid lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <PageSettings page={page} setPage={setPage} />
          {/* <FormSettings page={page} setPage={setPage} /> */}
        </div>
        <FormPreview page={page} />
      </div>
    </div>
  );
}

// Sub-components
function Header({
  isSaving,
  onSave,
}: {
  isSaving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Contact Page Builder
            </h1>
            <Badge
              variant="secondary"
              className="dark:bg-gray-700 dark:text-gray-200"
            >
              Contact Form
            </Badge>
          </div>
        </div>
        <Button onClick={onSave} size="sm" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ErrorDisplay({ errors }: { errors: string[] }) {
  return (
    <div className="container mx-auto mt-6">
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-md">
        <h3 className="text-red-800 dark:text-red-300 font-medium mb-2">
          Errors:
        </h3>
        <ul className="text-red-700 dark:text-red-400 text-sm space-y-1">
          {errors.map((error, index) => (
            <li key={index}>• {error}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PageSettings({
  page,
  setPage,
}: {
  page: ContactPage;
  setPage: React.Dispatch<React.SetStateAction<ContactPage>>;
}) {
  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="dark:border-gray-700">
        <CardTitle className="dark:text-white">Page Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <FormInput
          label="Title"
          value={page.title}
          onChange={(value) => setPage((p) => ({ ...p, title: value }))}
        />

        <div className="space-y-2">
          <Label className="dark:text-gray-200 font-medium text-sm">
            Page URL
          </Label>
          <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-700">
            <span className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              /
            </span>
            <span className="text-gray-900 dark:text-white font-mono text-sm">
              contact-us
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            This URL is automatically generated for contact pages
          </p>
        </div>
        <div className="space-y-2">
          <Label className="dark:text-gray-200 font-medium text-sm">
            Show in Navigation
          </Label>
          <Select
            value={page.show_in_nav?.toString() || "0"}
            onValueChange={(value) =>
              setPage((p) => ({ ...p, show_in_nav: Number(value) }))
            }
          >
            <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">No</SelectItem>
              <SelectItem value="1">Yes</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <FormTextarea
          label="Description"
          rows={3}
          placeholder="Description"
          value={page.description}
          onChange={(value) => setPage((p) => ({ ...p, description: value }))}
        />
      </CardContent>
    </Card>
  );
}

// function FormSettings({
//   page,
//   setPage,
// }: {
//   page: ContactPage;
//   setPage: React.Dispatch<React.SetStateAction<ContactPage>>;
// }) {
//   const updateSetting = useCallback(
//     (key: keyof ContactPage["settings"], value: any) => {
//       setPage((p) => ({ ...p, settings: { ...p.settings, [key]: value } }));
//     },
//     [setPage]
//   );

//   return (
//     <Card className="dark:bg-gray-800 dark:border-gray-700">
//       <CardHeader className="dark:border-gray-700">
//         <CardTitle className="dark:text-white">Form Settings</CardTitle>
//       </CardHeader>
//       <CardContent className="space-y-4">
//         <FormInput
//           label="Recipient Email"
//           type="email"
//           value={page.settings.recipientEmail}
//           onChange={(value) => updateSetting("recipientEmail", value)}
//           placeholder="admin@example.com"
//         />
//         <FormInput
//           label="Name Field Label"
//           value={page.settings.nameLabel}
//           onChange={(value) => updateSetting("nameLabel", value)}
//         />
//         <FormInput
//           label="Email Field Label"
//           value={page.settings.emailLabel}
//           onChange={(value) => updateSetting("emailLabel", value)}
//         />
//         <FormInput
//           label="Message Field Label"
//           value={page.settings.messageLabel}
//           onChange={(value) => updateSetting("messageLabel", value)}
//         />
//         <FormInput
//           label="Submit Button Text"
//           value={page.settings.submitButtonText}
//           onChange={(value) => updateSetting("submitButtonText", value)}
//         />
//       </CardContent>
//     </Card>
//   );
// }

function FormPreview({ page }: { page: ContactPage }) {
  return (
    <div className="lg:col-span-2">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader className="dark:border-gray-700">
          <CardTitle className="dark:text-white">Form Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {page.title}
              </h2>
              {page.description && (
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  {page.description}
                </p>
              )}
            </div>

            <form className="space-y-4">
              <FormInput
                label={page.settings.nameLabel}
                placeholder="Enter your full name"
                disabled
              />
              <FormInput
                label={page.settings.emailLabel}
                type="email"
                placeholder="Enter your email address"
                disabled
              />
              <FormTextarea
                label={page.settings.messageLabel}
                placeholder="Enter your message"
                rows={4}
                disabled
              />
              <Button type="button" className="w-full" disabled>
                {page.settings.submitButtonText}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Form Components
interface FormInputProps
  extends Omit<React.ComponentProps<"input">, "onChange"> {
  label?: string;
  onChange?: (value: string) => void;
}

function FormInput({ label, onChange, ...props }: FormInputProps) {
  return (
    <div>
      {label && (
        <Label className="mb-1 block dark:text-gray-200">{label}</Label>
      )}
      <input
        {...props}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400"
      />
    </div>
  );
}

interface FormTextareaProps
  extends Omit<React.ComponentProps<"textarea">, "onChange"> {
  label?: string;
  onChange?: (value: string) => void;
}

function FormTextarea({ label, onChange, ...props }: FormTextareaProps) {
  return (
    <div>
      {label && (
        <Label className="mb-1 block dark:text-gray-200">{label}</Label>
      )}
      <textarea
        {...props}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 text-sm disabled:bg-gray-100 dark:disabled:bg-gray-600 disabled:text-gray-500 dark:disabled:text-gray-400 resize-vertical"
      />
    </div>
  );
}
