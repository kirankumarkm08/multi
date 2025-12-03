import React from "react";
import { Navbar } from "@/components/userComponents";
import { serverApiFetch } from "@/lib/server-api";
import { headers } from "next/headers";

const SlugLayout = async ({ children }: { children: React.ReactNode }) => {
  let navData = null;
  let pages = [];

  try {
    const headersList = await headers();
    const host = headersList.get("host") || "localhost";
    const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
    const origin = `${protocol}://${host}`;

    const response = await serverApiFetch("/guest/pages/navigation", {
      headers: {
        Origin: origin,
      },
      cache: "no-store",
    });
    
    navData = response;
    pages = navData?.data?.navigation?.map((item: any) => ({
      label: item.title,
      href: `/${item.slug}`,
      page_type: item.page_type,
    })) || [];
  } catch (error) {
    console.error("[SlugLayout] Error fetching navigation:", error);
    // Fallback or empty navigation on error
  }

  return (
    <div>
      <Navbar data={pages} navData={navData} />
      {children}
    </div>
  );
};

export default SlugLayout;
