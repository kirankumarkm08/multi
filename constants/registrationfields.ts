import type { FormField } from "@/types/formfields";

export const defaultRegistrationFields = [
  {
    id: "full_name",
    name: "full_name",
    label: "Full Name",
    type: "text",
    required: true,
    placeholder: "Enter your full name",
    order: 0,
  },
  {
    id: "email",
    name: "email",
    label: "Email Address",
    type: "email",
    required: true,
    placeholder: "Enter your email",
    order: 1,
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter your password",
    order: 2,
  },
  {
    id: "password_confirmation",
    name: "password_confirmation",
    label: "Confirm Password",
    type: "password",
    required: true,
    placeholder: "Re-enter your password",
    order: 3,
  },
  {
    id: "phone",
    name: "phone",
    label: "Phone Number",
    type: "tel",
    required: true,
    placeholder: "Enter your phone number",
    order: 4,
  },
];
