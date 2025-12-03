import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "../context/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { ThemeProvider } from "@/context/ThemeContext";
import { Web3Provider } from "@/context/Web3Context";
import { QueryProvider } from "@/components/providers/QueryProvider";
import { headers } from "next/headers";
import { StrictMode } from "react";
import { customerApi } from "@/lib/api";



// export async function generateMetadata(): Promise<Metadata> {
//   try {
   
//     const headersList = await headers();
//     const domain = headersList.get("host") || "";

   
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/common/tenant/branding,
// `,
//       {
//         headers: {
//           "Content-Type": "application/json",
//         },
//         Origin: domain,
//         next: { revalidate: 3600 }, // Cache for 1 hour
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Failed to fetch branding data");
//     }

//     const brandingData = await response.json();

//     return {
//       metadataBase: new URL(
//         process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
//       ),
//       icons: brandingData?.data?.tenant.favicon_url
//         ? [
//             {
//               rel: "icon",
//               url: brandingData.data.favicon_url,
//               sizes: "any",
//               type: "image/x-icon",
//             },
//             {
//               rel: "shortcut icon",
//               url: brandingData.data.favicon_url,
//               sizes: "any",
//               type: "image/x-icon",
//             },
//           ]
//         : undefined,
//       viewport: {
//         width: "device-width",
//         initialScale: 1,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching branding data:", error);
//     return {
//       metadataBase: new URL(
//         process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
//       ),
//       viewport: {
//         width: "device-width",
//         initialScale: 1,
//       },
//     };
//   }
// }

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StrictMode>
          <QueryProvider>
            <AuthProvider>
              <ThemeProvider>
                <Web3Provider>
                  {children}
                  <Toaster />
                  <SonnerToaster position="top-right" richColors />
                </Web3Provider>
              </ThemeProvider>
            </AuthProvider>
          </QueryProvider>
        </StrictMode>
      </body>
    </html>
  );
}
