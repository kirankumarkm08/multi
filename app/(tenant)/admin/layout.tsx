import { AuthProvider } from "@/context/AuthContext";
import { AdminLayoutContent } from "./AdminLayoutContent";
import { ReactNode } from "react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin Dashboard",
    template: "%s | Admin Dashboard",
  },
  description: "Manage users, content, and settings",
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AuthProvider>
  );
}
