"use client";
import { Event } from "@/types/event";
import { Calendar, Eye } from "lucide-react";
import { useState } from "react";
import { EventCardGrid } from "./cards/EventCardGrid";
import { EventCardList } from "./cards/EventCardList";
import { EventCardMinimal } from "./cards/EventCardMinimal";

interface DynamicEventsProps {
  events: Event[];
  title?: string;
  description?: string;
  showFeatured?: boolean;
  view?: "grid" | "list" | "card" | "minimal";
  limit?: number;
  showDate?: boolean;
  showLocation?: boolean;
  showDescription?: boolean;
  showImages?: boolean;
  buttonText?: string;
  buttonLink?: string;
  backgroundColor?: string;
  textColor?: string;
  compact?: boolean;
  ticket_logo?: string;
}

export default function DynamicEventsEnhanced({
  events,
  title = "Upcoming Events",
  description = "Discover amazing events happening near you",
  showFeatured = false,
  view = "grid",
  limit,
  showDate = true,
  showLocation = true,
  showDescription = true,
  showImages = true,
  buttonText = "View Event Details",
  buttonLink = "#",
  backgroundColor = "",
  textColor = "text-gray-900",
  compact = false,
  ticket_logo
}: DynamicEventsProps) {

  // Debug logging
  console.log("DynamicEventsEnhanced - Received props:", {
    eventsCount: events?.length || 0,
    events: events,
    title,
    showFeatured,
    limit,
    view
  });

  // Apply filters and limits
  let displayEvents = showFeatured ? events.filter(e => e.is_featured) : events;
  if (limit && limit > 0) {
    displayEvents = displayEvents.slice(0, limit);
  }

  const [imageErrors, setImageErrors] = useState<{[key: string]: boolean}>({});

  const handleImageError = (eventId: string | number) => {
    setImageErrors(prev => ({ ...prev, [eventId]: true }));
  };

  if (!events || events.length === 0) {
    return (
      <section className={``}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events available</h3>
            <p className="text-gray-500">Check back later for upcoming events!</p>
          </div>
        </div>
      </section>
    );
  }

  if (displayEvents.length === 0) {
    return (
      <section className={`${compact ? 'py-6' : 'py-12'} ${backgroundColor}`}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Eye className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No events match your criteria</h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        </div>
      </section>
    );
  }

  // Grid Layout (Default)
  if (view === "grid") {
    return (
      <section className={``}>
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <h2 className={`${compact ? 'text-3xl' : 'text-4xl'} font-bold ${textColor} mb-4`}>{title}</h2>
            {description && (
              <p className={`text-lg text-gray-600 dark:text-gray-300`}>{description}</p>
            )}
          </div>

          {/* Events Grid */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 ${compact ? 'gap-6' : 'gap-8'}`}>
            {displayEvents.map((event) => (
              <EventCardGrid
                key={event.id}
                event={event}
                showImages={showImages}
                showDescription={showDescription}
                showDate={showDate}
                showLocation={showLocation}
                buttonText={buttonText}
                compact={compact}
                imageError={!!imageErrors[event.id]}
                onImageError={() => handleImageError(event.id)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // List Layout
  if (view === "list") {
    return (
      <section className={`${compact ? 'py-6' : 'py-12'} ${backgroundColor}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`${compact ? 'text-3xl' : 'text-4xl'} font-bold ${textColor} mb-4`}>{title}</h2>
            {description && (
              <p className="text-lg text-gray-600 dark:text-gray-300">{description}</p>
            )}
          </div>

          <div className="space-y-6">
            {displayEvents.map((event) => (
              <EventCardList
                key={event.id}
                event={event}
                showImages={showImages}
                showDescription={showDescription}
                showDate={showDate}
                showLocation={showLocation}
                buttonText={buttonText}
                imageError={!!imageErrors[event.id]}
                onImageError={() => handleImageError(event.id)}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Minimal Layout
  if (view === "minimal") {
    return (
      <section className={`${compact ? 'py-4' : 'py-8'} ${backgroundColor}`}>
        <div className="container mx-auto px-4">
          {title && (
            <h2 className={`${compact ? 'text-2xl' : 'text-3xl'} font-bold ${textColor} mb-6 text-center`}>{title}</h2>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {displayEvents.map((event) => (
              <EventCardMinimal
                key={event.id}
                event={event}
                showDate={showDate}
                showLocation={showLocation}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return null;
}