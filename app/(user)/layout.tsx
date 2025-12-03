import type { Metadata } from "next";
import Navbar from "@/components/userComponents/Navbar";
import UserLayoutClient from "./UserLayout";
import { getLandingPageData, getNavigationData } from "@/lib/server-utils";
import { constructMetadata } from "@/lib/metadata";
import { mapNavigationItems } from "@/lib/mappers";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const [pageResponse, navigationResponse] = await Promise.all([
      getLandingPageData(),
      getNavigationData(),
    ]);

    return constructMetadata(
      pageResponse?.data,
      navigationResponse?.data?.tenant
    );
  } catch (error) {
    console.error("Error generating metadata:", error);
    return {
      title: "Event Platform",
      description: "Welcome",
    };
  }
}

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationData = await getNavigationData();
  const pages = mapNavigationItems(navigationData?.data?.navigation);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar data={pages} navData={navigationData} />
      <main className="flex-grow">
        <UserLayoutClient>{children}</UserLayoutClient>
      </main>
    </div>
  );
}
