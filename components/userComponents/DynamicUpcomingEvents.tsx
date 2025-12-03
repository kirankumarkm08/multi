"use client";

import React, { useState } from "react";
import type { Event } from "@/types/event";
import {
  Calendar,
  MapPin,
  ImageIcon,
  Star,
  ArrowRight,
  Clock,
  CalendarRange 
} from "lucide-react";
import ZeroItems from "../common/Zeroitems";

interface DynamicUpcomingEventsProps {
  events: Event[];
  title?: string;
  description?: string;
  limit?: number;
  view?: "grid" | "list" | "card" | "minimal";
  showDate?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showImages?: boolean;
  buttonText?: string;
  backgroundColor?: string;
  textColor?: string;
  compact?: boolean;
}

export default function DynamicUpcomingEvents({
  events,
  title = "featured  Events",
  description = "Get your tickets now for these exciting upcoming events.",
  limit = 3,
  view = "grid",
  showDate = true,
  showLocation = true,
  showDescription = true,
  showImages = true,
  buttonText = "Get Tickets",
  compact = false,
}: DynamicUpcomingEventsProps) {
  const [hoveredCard, setHoveredCard] = useState<string | number | null>(null);

  if (!events?.length) {
    return (
      <ZeroItems
        items={events}
        Icon={Calendar}
        message="Currently, there are no upcoming events configured."
      />
    );
  }

  const displayedEvents = events.slice(0, limit);

  const formatEventDate = (dateString?: string): string => {
    if (!dateString) return "Date TBA";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDateParts = (dateString?: string) => {
    if (!dateString) return { month: "TBA", day: "" };

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return { month: "TBA", day: "" };

    return {
      month: date.toLocaleDateString("en-US", { month: "short" }),
      day: date.getDate().toString(),
    };
  };

  if (view === "grid") {
    return (
      <section className={` text-black`}>
        <div className="container mx-auto px-4">
          <div className="text-start mb-12">
            <h2
              className={`${
                compact ? "text-3xl" : "text-4xl"
              } font-bold ${"textColor"} mb-4 tracking-tight`}
            >
              {title}
            </h2>
            {/* {description && (
              <p className="text-lg text-slate-300 max-w-2xl mx-auto">
                {description}
              </p>
            )} */}
          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${
              compact ? "gap-6" : "gap-8"
            }`}
          >
            {displayedEvents.map((event) => {
              const dateParts = getDateParts(
                event.start_date || event.start_at
              );

              return (
                <div
                  key={event.id}
                  onMouseEnter={() => setHoveredCard(event.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  className="group relative h-full"
                >
                  <div className="rounded-2xl shadow-2xl overflow-hidden transition-all duration-500 transform hover:-translate-y-3 border border-slate-700 hover:border-blue-500/50 h-full flex flex-col relative">
                    <div className="relative h-64 w-full overflow-hidden bg-slate-800">
                      {event.event_banner ? (
                        <img
                          src={event.event_banner}
                          alt={event.event_name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                          <ImageIcon className="w-16 h-16 text-slate-500" />
                        </div>
                      )}

                      {event.event_logo && (
                        <div className="absolute top-4 left-4 z-20">
                          <div className="w-16 h-16 rounded-full border-4 border-white shadow-lg overflow-hidden bg-slate-700 flex items-center justify-center">
                            <img
                              src={event.event_logo}
                              alt={`${event.event_name} logo`}
                              className="w-full h-full object-cover"
                              // onError={() => handleLogoError(event.id)}
                            />
                          </div>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent opacity-90" />

                      {event.is_featured && (
                        <div className="absolute top-4 right-4 z-10">
                          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-orange-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg">
                            <Star className="w-4 h-4 fill-current" />
                            Featured
                          </div>
                        </div>
                      )}

                      <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-700 rounded-lg px-3 py-2 text-center shadow-lg">
                        <div className="text-xs font-bold text-blue-400">
                          {dateParts.month}
                        </div>
                        <div className="text-lg font-bold text-white">
                          {dateParts.day}
                        </div>
                      </div>
                    </div>

                    <div className="relative z-20 p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-black mb-3 line-clamp-2 group-hover:text-blue-300 transition-colors">
                          {event.event_name}
                        </h3>

                        {showDescription && (
                          <p className="text-slate-800 text-sm line-clamp-2 mb-4 leading-relaxed">
                            {event.description ||
                              "Join us for an amazing experience!"}
                          </p>
                        )}
                      </div>

                      <div className="space-y-3 mb-6">
                        {showDate && (
                          <div className="flex items-center gap-3 text-sm text-black">
                            <div className="p-2 bg-blue-500/30 rounded-lg border border-blue-400/50">
                              <CalendarRange  className="w-4 h-4 text-blue-900" />
                            </div>
                            <span className="font-medium">
                              {formatEventDate(
                                event.start_date || event.start_at
                              )}
                            </span>
                          </div>
                        )}

                        {showLocation && (
                          <div className="flex items-center gap-3 text-sm text-black">
                            <div className="p-2 bg-purple-500/30 rounded-lg border border-purple-400/50">
                              <MapPin className="w-4 h-4 text-purple-900" />
                            </div>
                            <span className="font-medium truncate">
                              {event.venue_name || "Venue TBA"}
                            </span>
                          </div>
                        )}
                      </div>

                      <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-blue-500/50 transform hover:scale-105">
                        {buttonText}
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    );
  }

  
}
