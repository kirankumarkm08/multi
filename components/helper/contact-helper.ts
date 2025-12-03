import { ContactPageSettings,ContactPage } from "@/types";

export const sanitizeSlug = (input: string): string =>
  input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const getPlaceholderText = (label: string): string => {
  const l = label.toLowerCase();
  if (l.includes("name")) return "Enter your name";
  if (l.includes("email")) return "Enter your email";
  if (l.includes("phone")) return "Enter your phone";
  if (l.includes("message")) return "Enter your message";
  return `Enter your ${l.replace(/^your\s+/, "")}`;
};

export const createFormConfig = (settings: ContactPageSettings) => {
  const formFields: any[] = [
    {
      id: "name",
      name: "name",
      label: settings.nameLabel.trim(),
      type: "text",
      required: true,
      placeholder: "Enter your full name",
      order: 0,
    },
    {
      id: "email",
      name: "email",
      label: settings.emailLabel.trim(),
      type: "email",
      required: true,
      placeholder: "Enter your email address",
      order: 1,
    },
    {
      id: "message",
      name: "message",
      label: settings.messageLabel.trim(),
      type: "textarea",
      required: true,
      placeholder: "Enter your message",
      order: 3,
    },
  ];

  // if (settings.phoneEnabled) {
  //   formFields.push({
  //     id: "phone",
  //     name: "phone",
  //     label: settings.phoneLabel.trim(),
  //     type: "tel",
  //     required: false,
  //     placeholder: "Enter your phone number",
  //     order: 2,
  //   });
  // }

  return {
    fields: formFields,
  };
};

export const validateContactPage = (page: ContactPage): string[] => {
  const errors: string[] = [];
  if (!page.name.trim()) errors.push("Page name is required");
  if (!page.title.trim()) errors.push("Page title is required");
  if (!page.settings.nameLabel.trim()) errors.push("Name label is required");
  if (!page.settings.emailLabel.trim()) errors.push("Email label is required");
  return errors;
};
