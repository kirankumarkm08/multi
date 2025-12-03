import { LoginFormField } from "@/types/formfields";

export const defaultLoginFields: LoginFormField[] = [
  {
    id: "email",
    name: "email",
    label: "emails",
    type: "text",
    required: true,
    placeholder: "Enter your  email",
    order: 0,
  },
  {
    id: "password",
    name: "password",
    label: "Password",
    type: "password",
    required: true,
    placeholder: "Enter your password",
    order: 1,
  },
];
