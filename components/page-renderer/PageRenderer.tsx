"use client";

import { useEffect, useState } from "react";
import DynamicEvents from "@/components/userComponents/DynamicEvents";
import DynamicTickets from "@/components/userComponents/DynamicTickets";
import HeroSection from "@/components/userComponents/Hero";
import Navbar from "@/components/userComponents/Navbar";
import DynamicSpeakers from "@/components/userComponents/DynamicSpeakers";
import { BlockRenderer } from "./BlockRenderer";

interface Module {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  tags: string[];
  isPremium?: boolean;
  preview?: string;
  defaultProps?: Record<string, any>;
}

interface Column {
  id: string;
  width: number;
  modules: Module[];
}

interface Row {
  id: string;
  columns: Column[];
}

interface Section {
  id: string;
  name: string;
  type: "header" | "content" | "footer" | "custom";
  rows: Row[];
}

interface PageLayout {
  sections: Section[];
}

interface PageRendererProps {
  events?: any[];
  tickets?: any[];
  speakers?: any[];
  pages?: { label: string; href: string }[];
}

const ModuleRenderer = ({
  module,
  events = [],
  tickets = [],
  speakers = [],
}: {
  module: Module;
  events?: any[];
  tickets?: any[];
  speakers?: any[];
}) => {
  // Debug logging
  console.log(`Rendering module: ${module.id}`, {
    module,
    eventsCount: events.length,
    ticketsCount: tickets.length,
    speakersCount: speakers.length,
    events: events.slice(0, 2), // Show first 2 items for debugging
    tickets: tickets.slice(0, 2),
    speakers: speakers.slice(0, 2),
  });

  useEffect(() => {
    speakers.forEach((i) => {
      console.log(i.profile_image);
    });
  }, [speakers]);

  switch (module.id) {
    case "speakers":
      return (
        <DynamicSpeakers
          speakers={speakers}
          layout={module.defaultProps?.layout || "grid"}
          showOnlyFeatured={module.defaultProps?.showOnlyFeatured || false}
          limit={module.defaultProps?.limit}
          showBio={module.defaultProps?.showBio !== false}
          showSocialLinks={module.defaultProps?.showSocialLinks !== false}
        />
      );

    case "events":
      return <DynamicEvents events={events} />;

    case "tickets":
    // return <DynamicTickets tickets={tickets} showOnlyActive={false} />

    case "hero":
      return <HeroSection />;

    case "navbar":
      return <Navbar pages={[]} />;

    case "blocks":
      return <BlockRenderer module={module} />;

    case "special-guest":
      return (
        <DynamicSpeakers
          speakers={speakers}
          layout="featured"
          showOnlyFeatured={true}
          limit={module.defaultProps?.limit || 3}
          showBio={module.defaultProps?.showBio !== false}
          showSocialLinks={module.defaultProps?.showSocialLinks !== false}
        />
      );

    case "sponsors":
      return (
        <div className="">
          <div className="">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Our Sponsors & Partners
            </h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">🏢 Sponsors module</p>
              <p className="text-sm text-gray-500">
                Create sponsors in your admin panel to display them here
              </p>
            </div>
          </div>
        </div>
      );

    case "schedule":
      return (
        <div className="">
          <div className="">
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
              Event Schedule
            </h2>
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-600 mb-4">⏰ Schedule module</p>
              <p className="text-sm text-gray-500">
                Connect your event schedule to display the agenda here
              </p>
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">
            {module.icon} {module.name}
          </h3>
          <p className="text-sm text-gray-600">{module.description}</p>
        </div>
      );
  }
};

export function PageRenderer({
  events = [],
  tickets = [],
  speakers = [],
  pages = [],
}: PageRendererProps) {
  const [layout, setLayout] = useState<PageLayout | null>(null);
  const [loading, setLoading] = useState(true);

  console.log("PageRenderer received data:", {
    eventsCount: events.length,
    ticketsCount: tickets.length,
    speakersCount: speakers.length,
    events: events.slice(0, 1),
    tickets: tickets.slice(0, 1),
    speakers: speakers.slice(0, 1),
  });

  useEffect(() => {
    loadPageLayout();
  }, []);

  const loadPageLayout = () => {
    try {
      // Load from localStorage for now (you can replace with API call)
      const savedLayout = localStorage.getItem("pageLayout");
      console.log("Loading page layout, savedLayout exists:", !!savedLayout);

      if (savedLayout) {
        const parsedLayout = JSON.parse(savedLayout);
        console.log("Using saved layout:", parsedLayout);
        setLayout(parsedLayout);
      } else {
        console.log("No saved layout, using default layout");
        // Default layout if none exists
        setLayout({
          sections: [
            {
              id: "hero-section",
              name: "Hero Section",
              type: "header",
              rows: [
                {
                  id: "hero-row",
                  columns: [
                    {
                      id: "hero-col",
                      width: 100,
                      modules: [
                        {
                          id: "hero",
                          name: "Hero Section",
                          description: "Landing page hero section",
                          icon: "🚀",
                          category: "Layout",
                          tags: ["hero", "landing", "banner"],
                          defaultProps: { title: "Welcome", showButton: true },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: "content-section",
              name: "Main Content",
              type: "content",
              rows: [
                {
                  id: "events-row",
                  columns: [
                    {
                      id: "events-col",
                      width: 100,
                      modules: [
                        {
                          id: "events",
                          name: "Events",
                          description: "Show upcoming events",
                          icon: "📅",
                          category: "Events",
                          tags: ["schedule", "calendar"],
                          defaultProps: { view: "list", limit: 5 },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "speakers-row",
                  columns: [
                    {
                      id: "speakers-col",
                      width: 100,
                      modules: [
                        {
                          id: "speakers",
                          name: "Speakers",
                          description: "Display event speakers with profiles",
                          icon: "🎤",
                          category: "Events",
                          tags: ["events", "people", "speakers"],
                          defaultProps: {
                            layout: "grid",
                            showOnlyFeatured: false,
                            limit: 8,
                            showBio: true,
                            showSocialLinks: true,
                          },
                        },
                      ],
                    },
                  ],
                },
                {
                  id: "tickets-row",
                  columns: [
                    {
                      id: "tickets-col",
                      width: 100,
                      modules: [
                        {
                          id: "tickets",
                          name: "Tickets",
                          description: "Ticket purchasing module",
                          icon: "🎫",
                          category: "Tickets",
                          tags: ["purchase", "booking"],
                          defaultProps: {
                            showPrices: true,
                            buttonText: "Buy Now",
                          },
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        });

        console.log("Default layout set with sections:", {
          sectionsCount: 2,
          heroSection: "hero",
          contentSections: ["events", "speakers", "tickets"],
        });
      }
    } catch (error) {
      console.error("Error loading page layout:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading page...</p>
        </div>
      </div>
    );
  }

  if (!layout || !layout.sections.length) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          No page layout found
        </h2>
        <p className="text-gray-600">
          Use the page builder to create your layout
        </p>
      </div>
    );
  }

  console.log("About to render layout:", {
    layout,
    sectionsCount: layout?.sections?.length || 0,
    sections:
      layout?.sections?.map((s) => ({
        id: s.id,
        rowsCount: s.rows?.length || 0,
      })) || [],
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {layout.sections.map((section, sectionIndex) => {
        console.log(
          `Rendering section ${sectionIndex}:`,
          section.id,
          `with ${section.rows.length} rows`
        );
        return (
          <section key={section.id} className="py-8">
            {section.rows.map((row, rowIndex) => {
              console.log(
                `  Rendering row ${rowIndex}:`,
                row.id,
                `with ${row.columns.length} columns`
              );
              return (
                <div key={row.id} className="">
                  <div className="grid grid-cols-12 gap-4">
                    {row.columns.map((column, columnIndex) => {
                      console.log(
                        `    Rendering column ${columnIndex}:`,
                        column.id,
                        `with ${column.modules.length} modules`
                      );
                      return (
                        <div
                          key={column.id}
                          className={`col-span-${Math.round(
                            (column.width / 100) * 12
                          )} space-y-4`}
                          style={{
                            gridColumn: `span ${Math.round(
                              (column.width / 100) * 12
                            )}`,
                          }}
                        >
                          {column.modules.map((module, moduleIndex) => {
                            console.log(
                              `      Rendering module ${moduleIndex}:`,
                              module.id,
                              module.name
                            );
                            return (
                              <div key={`${module.id}-${moduleIndex}`}>
                                <ModuleRenderer
                                  module={module}
                                  events={events}
                                  tickets={tickets}
                                  speakers={speakers}
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}
