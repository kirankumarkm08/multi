"use client";

import { Event } from "@/types/event";
import { Calendar, MapPin, Image as ImageIcon, Star } from "lucide-react";
import { getImageUrl, formatDate } from "./utils";

interface EventCardGridProps {
  event: Event;
  showImages: boolean;
  showDescription: boolean;
  showDate: boolean;
  showLocation: boolean;
  buttonText: string;
  compact: boolean;
  imageError: boolean;
  onImageError: (id: string) => void;
}

export function EventCardGrid({
  event,
  showImages,
  showDescription,
  showDate,
  showLocation,
  buttonText,
  compact,
  imageError,
  onImageError,
}: EventCardGridProps) {
  const imageUrl = getImageUrl(event);
  const eventImageUrl = event.ticket_logo || imageUrl;

  return (
    <div
      className="bg-gray-50 rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
    >
      {/* Event Image */}
      {showImages && (
        <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 relative overflow-hidden">
          {eventImageUrl && !imageError ? (
            <img
              src={eventImageUrl}
              alt={event.event_name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              onError={() => onImageError(event.id)}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-gray-400" />
            </div>
          )}

          {event.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-black px-3 py-1 rounded-full text-sm font-semibold">
                <Star className="w-3 h-3 fill-current" />
                Featured
              </span>
            </div>
          )}
        </div>
      )}

      {/* Event Content */}
      <div className={compact ? 'p-4' : 'p-6'}>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 line-clamp-2">
          {event.event_name}
        </h3>

        {showDescription && (
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
            {event.description || 'Join us for an amazing event experience!'}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-3 mb-6">
          {showDate && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>{formatDate(event.start_date || event.start_at)}</span>
            </div>
          )}

          {showLocation && (
            <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
              <MapPin className="w-4 h-4 text-purple-600" />
              <span className="truncate">{event.venue_name}</span>
            </div>
          )}
        </div>

        <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
