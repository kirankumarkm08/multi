"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { tenantApi } from "@/lib/api";
import DynamicForm from "@/components/userComponents/forms/DynamicForm";
import Navbar from "@/components/userComponents/Navbar";

export default function FormPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [navPages, setNavPages] = useState<{ label: string; href: string }[]>(
    []
  );

  useEffect(() => {
    fetchFormData();
    fetchNavigation();
  }, [slug]);

  const fetchFormData = async () => {
    try {
      setLoading(true);
      // For login and register forms, use the type-based API
      if (slug === "login") {
        const pageData = await tenantApi.getPageByType("login");
        setFormData(pageData);
      } else if (slug === "register" || slug === "registration") {
        const pageData = await tenantApi.getPageByType("register");
        setFormData(pageData);
      } else {
        // For other forms, get all pages and filter by slug
        const pages = await tenantApi.getPages();
        const pageData = Array.isArray(pages)
          ? pages.find((p: any) => p.slug === slug)
          : pages?.data?.find((p: any) => p.slug === slug);

        if (!pageData) {
          throw new Error("Page not found");
        }
        setFormData(pageData);
      }
    } catch (error) {
      console.error("Failed to fetch form data:", error);
      setError("Failed to load form");
    } finally {
      setLoading(false);
    }
  };

  const fetchNavigation = async () => {
    try {
      const response = await tenantApi.getPages();
      console.log("Navigation response:", response);

      let pages = [];
      if (Array.isArray(response)) {
        pages = response;
      } else if (response?.data && Array.isArray(response.data)) {
        pages = response.data;
      } else if (response?.pages && Array.isArray(response.pages)) {
        pages = response.pages;
      }

      const navItems = pages.map((p: any) => ({
        label: p.title || p.name || "Untitled",
        href: p.slug
          ? `/forms/${p.slug}`
          : p.type === "login" || p.page_type === "login"
          ? "/login"
          : p.type === "register" || p.page_type === "register"
          ? "/registration"
          : `/forms/${p.slug || p.id}`,
      }));

      setNavPages(navItems);
    } catch (error) {
      console.error("Failed to fetch navigation:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar pages={navPages} />
        <div className="flex justify-center items-center h-96">
          <div className="text-gray-600 dark:text-gray-400">
            Loading form...
          </div>
        </div>
      </div>
    );
  }

  if (error || !formData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar pages={navPages} />
        <div className="flex justify-center items-center h-96">
          <div className="text-red-600 dark:text-red-400">
            {error || "Form not found"}
          </div>
        </div>
      </div>
    );
  }

  const fields =
    typeof formData.fields === "string"
      ? JSON.parse(formData.fields)
      : formData.fields || [];

  const settings =
    typeof formData.settings === "string"
      ? JSON.parse(formData.settings)
      : formData.settings || {};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar pages={navPages} />
      <main className=" py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">
            {formData.title || "Form"}
          </h1>
          {formData.description && (
            <p className="text-gray-600 dark:text-gray-400 mb-8">
              {formData.description}
            </p>
          )}
          <DynamicForm
            fields={fields}
            settings={settings}
            onSubmit={(data) => {
              console.log("Form submitted:", data);
            }}
          />
        </div>
      </main>
    </div>
  );
}
