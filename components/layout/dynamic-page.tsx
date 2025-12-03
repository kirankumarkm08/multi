"use client";

import { useState, useEffect } from "react";
import { DynamicPageData as PageData, SubmitMessage } from "@/types";
import { notFound, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api-config";
import Loading from "@/components/common/Loading";
import { FormPage } from "@/components/admin/FormPage";
import { ContentPage } from "@/components/admin/ContentPage";
import { AuthStorage } from "@/utils/storage";

interface DynamicPageProps {
  slug: string;
  pageData: PageData;
}

export function DynamicPage({ slug, pageData: preloadedPageData }: DynamicPageProps) {
  const [pageData, setPageData] = useState<PageData | null>(preloadedPageData);
  const [loading, setLoading] = useState(!preloadedPageData);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage | null>(null);
  const router = useRouter();

  // Check if user is already logged in (for login/register pages)
  useEffect(() => {
    if (pageData?.page_type === "login" || pageData?.page_type === "register") {
      if (AuthStorage.isAuthenticated()) {
        // Redirect to dashboard if already logged in
        router.push("/customer/dashboard");
      }
    }
  }, [pageData?.page_type, router]);

  // Fetch page data if not preloaded (client-side fallback)
  useEffect(() => {
    if (preloadedPageData) return;

    async function fetchPage() {
      try {
        setLoading(true);
        setError(null);

        const response = await apiFetch(`/guest/pages/${slug}`, {
          method: "GET",
        });

        if (!response.success || !response.data) {
          setError("Page not found");
          return;
        }

        const data = response.data;

        if (data.status !== "published") {
          setError("Page not published");
          return;
        }

        setPageData(data);
      } catch (err: any) {
        console.error("Error fetching page:", err);
        setError(err.message || "Failed to load page");
      } finally {
        setLoading(false);
      }
    }

    fetchPage();
  }, [slug, preloadedPageData]);

  const handleFormSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      if (!pageData) {
        throw new Error("No page data available");
      }

      const actualPageData = pageData;
      
      // Determine API endpoint based on page type
      let endpoint: string;
      let payload: any = {
        ...formData,
        page_id: actualPageData.id,
        page_type: actualPageData.page_type,
        slug: actualPageData.slug,
      };

      // Remove confirm_password from payload
      if (payload.confirm_password) {
        delete payload.confirm_password;
      }

      // Handle different page types
      switch (actualPageData.page_type) {
        case "contact_us":
          endpoint = `/customer/form/contact-us`;
          break;
        case "register":
          endpoint = `/customer/form/register`;
          break;
        case "login":
          endpoint = `/customer/form/login`;
          // For login, only send email and password
          payload = {
            email: formData.email || "",
            password: formData.password || "",
          };
          break;
        default:
          // For custom forms, use a generic endpoint
          endpoint = `/customer/form/submit`;
          break;
      }

      console.log("Submitting to:", endpoint, payload);

      const response = await apiFetch(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      console.log("API Response:", response);

      // Handle login response
      if (actualPageData.page_type === "login") {
        if (response?.token) {
          // Store authentication data
          AuthStorage.setAuth(response.token, response.user);
          
          setSubmitMessage({
            type: "success",
            text: "Login successful! Redirecting...",
          });

          // Redirect after delay
          setTimeout(() => {
            const redirectTo = formData.redirect || "/my-account";
            router.push(redirectTo);
          }, 1500);
          return;
        } else {
          throw new Error(response?.message || "Login failed. Please check your credentials.");
        }
      }

      // Handle register response
      if (actualPageData.page_type === "register") {
        if (response?.token) {
          // Auto-login after successful registration
          AuthStorage.setAuth(response.token, response.user);
          
          setSubmitMessage({
            type: "success",
            text: "Registration successful! You are being logged in...",
          });

         
          return;
        } else if (response?.success) {
          setSubmitMessage({
            type: "success",
            text: response.message || "Registration successful!",
          });
        } else {
          throw new Error(response?.message || "Registration failed. Please try again.");
        }
      }

      // Handle contact_us and other form submissions
      if (["contact_us", "custom"].includes(actualPageData.page_type || "")) {
        if (response?.success) {
          setSubmitMessage({
            type: "success",
            text: response.message || getSuccessMessage(actualPageData.page_type),
          });
          
          // Reset form on success
          setFormData({});
        } else {
          throw new Error(response?.message || "Form submission failed.");
        }
      }

    } catch (error: any) {
      console.error("Form submission error:", error);
      setSubmitMessage({
        type: "error",
        text: error?.message || "Failed to submit form. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSuccessMessage = (pageType?: string): string => {
    switch (pageType) {
      case "contact_us":
        return "Thank you for your message! We'll get back to you soon.";
      case "register":
        return "Registration successful!";
      case "login":
        return "Login successful!";
      default:
        return "Form submitted successfully!";
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const renderPageContent = () => {
    if (!pageData) return null;

    // Check if this is a form page
    const isFormPage = pageData.form_config || 
      ["contact_us", "register", "login"].includes(pageData.page_type || "");

    if (isFormPage) {
      return (
        <FormPage
          pageData={pageData}
          formData={formData}
          onSubmit={handleFormSubmission}
          onInputChange={handleInputChange}
          isSubmitting={isSubmitting}
          submitMessage={submitMessage}
        />
      );
    }

    // Otherwise render as content page
    return <ContentPage pageData={pageData} />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  // Error state
  if (error || !pageData) {
    console.log("DynamicPage - Error or no page data:", {
      error,
      pageData: !!pageData,
    });
    return notFound();
  }

  return (
    <div className="min-h-screen">
      <main className="container mx-auto px-4 py-8">
        {renderPageContent()}
      </main>
    </div>
  );
}
