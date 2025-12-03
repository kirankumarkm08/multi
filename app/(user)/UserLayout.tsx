"use client";

import { useAuth } from "@/context/AuthContext";
import { useEffect } from "react";
import { tenantApi } from "@/lib/api";

export default function UserLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token } = useAuth();

 

  return <>{children}</>;
}
