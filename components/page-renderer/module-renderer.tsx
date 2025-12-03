"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { customerApi } from "@/lib/api";
import { formBuilderService } from "@/services";

// Dynamic imports
const DynamicSpeakers = dynamic(
  () => import("@/components/userComponents/DynamicSpeakers"),
  { ssr: false }
);
const DynamicTickets = dynamic(
  () => import("@/components/userComponents/DynamicTickets"),
  { ssr: false }
);
const DynamicEventsEnhanced = dynamic(
  () => import("@/components/userComponents/DynamicEventsEnhanced"),
  { ssr: false }
);
const DynamicUpcomingEvents = dynamic(
  () => import("@/components/userComponents/DynamicUpcomingEvents"),
  { ssr: false }
);

const DynamicFormRenderer = dynamic(
  () => import("@/components/userComponents/DynamicFormRenderer"),
  { ssr: false }
);

interface ModuleRendererProps {
  module: {
    id: string;
    name: string;
    description: string;
    icon: string;
    category: string;
    tags: string[];
    defaultProps?: Record<string, any>;
    blockId?: string;
  };
}

export function ModuleRenderer({ module }: ModuleRendererProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFormLoading, setFormLoading] = useState(false);
  const [isFormError, setFormError] = useState<string | null>(null);

  // Custom block state
  const [fetchBlock, setFetchBlock] = useState<any>(null);
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string | null>(null);
  const [isForms, setFetchedForm] = useState<any>(null);

  // Fetch module data (speakers, tickets, events)
  useEffect(() => {
    const fetchModuleData = async () => {
      setLoading(true);
      setError(null);

      try {
        let processedData: any[] = [];

        // ===== Speakers =====
        if (module.id.includes("speakers")) {
          console.log("Fetching speakers via customer API...");
          const response = await customerApi.getEventParticipants();
          const participants =
            response?.data && Array.isArray(response.data) ? response.data : [];

          // Filter only active speakers and special guests
          processedData = participants.filter((p: any) => {
            const isActive =
              p.status === "active" || p.status === "published" || !p.status;
            const isSpeaker =
              !p.participant_type ||
              ["speaker", "special_guest"].includes(p.participant_type);
            return isActive && isSpeaker;
          });

          console.log("Filtered speakers:", processedData);
        }

        // ===== Tickets =====
        else if (module.id.includes("tickets")) {
          const response = await customerApi.getTickets();
          console.log("tickets data ", response?.data);
          const allTickets = response?.data || [];
          processedData = allTickets.filter(
            (t: any) => t.event_editions && t.event_editions.length > 0
          );

          // Filter by ticketId if provided
          if (module.defaultProps?.ticketId) {
            const ticket = processedData.find(
              (t: any) => t.id === module.defaultProps.ticketId
            );
            processedData = ticket ? ticket.event_editions : [];
          }
        } else if (module.id.includes("upcoming_events")) {
          const response = await customerApi.getFeaturedEvents();
          const featuredEvents = response.data || [];
          processedData = featuredEvents.filter(
            (e: any) => e.status === "published"
          );
        }

        // ===== Events =====
        else if (module.id.includes("events")) {
          const response = await customerApi.getNonFeaturedEvents();
          const allEvents = response?.data || [];
          processedData = allEvents.filter(
            (e: any) => e.status === "published"
          );
        }

        setData(processedData);
      } catch (err: any) {
        console.error("Error fetching module data:", err);
        setError(err.message || `Failed to load ${module.name.toLowerCase()}`);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchModuleData();
  }, [module.id, module.defaultProps?.ticketId]);

  // Fetch custom block data
  useEffect(() => {
    const fetchBlockData = async () => {
      if (!module.blockId || module.category !== "Custom Blocks") return;

      setBlockLoading(true);
      setBlockError(null);

      try {
        console.log(`Fetching block data for blockId: ${module.blockId}`);
        const response = await fetch(
          `https://api.testjkl.in/api/guest/block/id/${module.blockId}`
        );
        if (!response.ok)
          throw new Error(`Failed to fetch block: ${response.status}`);
        const blockData = await response.json();
        setFetchBlock(blockData);
        console.log("Block data fetched:", blockData);
      } catch (err: any) {
        console.error("Error fetching block data:", err);
        setBlockError(err.message || "Failed to load block content");
      } finally {
        setBlockLoading(false);
      }
    };

    fetchBlockData();
  }, [module.blockId, module.category]);

  useEffect(() => {
    const fetchFormData = async () => {
      // Only run for "Form Builder" modules
      if (module.category !== "Form Builder") return;

      const formId = module.defaultProps?.formId;
      console.log("Form ID:", formId);

      if (!formId) return;

      setFormLoading(true);
      setFormError(null);

      try {
        console.log(`Fetching form data for formId: ${formId}`);

        // const response = await formBuilderService.getForm(formId)
        const response = await fetch(
          `https://api.testjkl.in/api/guest/form/builder/id/${formId}`
        );
        const result = await response.json();

        if (!result?.data)
          throw new Error("Form not found or invalid response");

        // Ensure form_config is parsed correctly
        const parseFormConfig = (formData: any) => {
          if (!formData) return { form_config: { fields: [] } };

          let parsedFormConfig = formData.form_config;
          if (typeof parsedFormConfig === "string") {
            try {
              parsedFormConfig = JSON.parse(parsedFormConfig);
            } catch (e) {
              console.error("Error parsing form_config:", e);
              parsedFormConfig = { fields: [] };
            }
          }

          return {
            ...formData,
            form_config: parsedFormConfig || { fields: [] },
          };
        };

        const parsedData = parseFormConfig(result.data);
        setFetchedForm({ data: parsedData });

        console.log("Form data fetched:", parsedData);
      } catch (error: any) {
        console.error("Error fetching form data:", error);
        setFormError(error.message || "Failed to load form data");
      } finally {
        setFormLoading(false);
      }
    };

    fetchFormData();
  }, [module.category, module.defaultProps?.formId]);

  // ===== Loading & Error States =====
  if (loading) return <p>Loading {module.name}...</p>;
  if (error) return <p className="text-red-500">{error}</p>;
  if (blockLoading) return <p>Loading block content...</p>;
  if (blockError) return <p className="text-red-500">{blockError}</p>;
  if (isFormLoading) return <p>Loading form...</p>;
  if (isFormError) return <p className="text-red-500">{isFormError}</p>;

  // ===== Render Speakers =====
  if (module.id.includes("speakers")) {
    return (
      <DynamicSpeakers
        speakers={data}
        layout={module.defaultProps?.layout || "grid"}
        showOnlyFeatured={module.defaultProps?.showOnlyFeatured || false}
        limit={module.defaultProps?.limit}
        showBio={module.defaultProps?.showBio !== false}
        showSocialLinks={module.defaultProps?.showSocialLinks !== false}
      />
    );
  }

  // ===== Render Tickets =====
  if (module.id.includes("tickets")) {
    console.log("data", data);
    return (
      <DynamicTickets
        tickets={data || []}
        title={module.defaultProps?.title || "Available Tickets"}
      />
    );
  }

  // ===== Render Events =====
  if (module.id.includes("events") && !module.id.includes("upcoming_events")) {
    return (
      <DynamicEventsEnhanced
        events={data || []}
        title={"Ongoing Events"}
        description={
          module.defaultProps?.description || "Explore our current events"
        }
        view={module.defaultProps?.view || "grid"}
        backgroundColor={module.defaultProps?.backgroundColor || "bg-gray-50 dark:bg-gray-900"}
        textColor="text-gray-900 dark:text-white"
      />
    );
  }

  if (module.id.includes("upcoming_events")) {
    return (
      <DynamicUpcomingEvents
        events={data || []}
        title={"Upcoming & Recent Events"}
        description={
          module.defaultProps?.description ||
          "Get your tickets now for these exciting upcoming events"
        }
        view={module.defaultProps?.view || "grid"}
        backgroundColor={module.defaultProps?.backgroundColor || "bg-gray-50 dark:bg-gray-900"}
      />
    );
  }
  // ===== Render Custom Blocks =====
  if (module.category === "Custom Blocks") {
    const displayContent =
      fetchBlock?.data?.content || module.defaultProps?.content || "";
    const displayContentType =
      fetchBlock?.data?.content_type ||
      module.defaultProps?.contentType ||
      "html";

    console.log("display from module:", module.defaultProps?.content);
    console.log("display from API:", fetchBlock?.data?.content);

    return (
      <section>
        <div>
          {displayContentType === "html" ? (
            <div
              className="text-black"
              dangerouslySetInnerHTML={{ __html: displayContent }}
            />
          ) : (
            <div className="prose max-w-none text-black">{displayContent}</div>
          )}
        </div>
      </section>
    );
  }

  if (module.category === "Form Builder") {
    if (!isForms || !isForms.data) {
      return (
        <div className="text-center py-8">
          <p className="text-gray-600">No form configured</p>
        </div>
      );
    }

    console.log("Form Builder - Rendering form with data:", isForms.data);
    console.log("Form config:", isForms.data.form_config);

    const handleFormSubmit = async (formData: Record<string, any>) => {
      console.log("Form submitted:", formData);
      // TODO: Implement form submission logic
      // You can add API call here to submit the form data
    };

    return (
      <section className="py-8">
        <DynamicFormRenderer
          formData={isForms.data}
          onSubmit={handleFormSubmit}
        />
      </section>
    );
  }

  return null;
}
