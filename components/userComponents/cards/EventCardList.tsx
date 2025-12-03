"use client";

import { Event } from "@/types/event";
import { Calendar, MapPin, Image as ImageIcon, Star } from "lucide-react";
import { getImageUrl, formatDate } from "./utils";

interface EventCardListProps {
  event: Event;
  showImages: boolean;
  showDescription: boolean;
  showDate: boolean;
  showLocation: boolean;
  buttonText: string;
  imageError: boolean;
  onImageError: (id: string) => void;
}

export function EventCardList({
  event,
  showImages,
  showDescription,
  showDate,
  showLocation,
  buttonText,
  imageError,
  onImageError,
}: EventCardListProps) {
  const imageUrl = getImageUrl(event);
  const eventImageUrl = event.ticket_logo || imageUrl;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-start gap-6">
      {showImages && (
        <div className="w-32 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
          {eventImageUrl && !imageError ? (
            <img
              src={eventImageUrl}
              alt={event.event_name}
              className="w-full h-full object-cover"
              onError={() => onImageError(event.id)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-400" />
            </div>
          )}
        </div>
      )}

      <div className="flex-1">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{event.event_name}</h3>
          {event.is_featured && <Star className="w-5 h-5 text-yellow-500 fill-current" />}
        </div>

        {showDescription && (
          <p className="text-gray-600 dark:text-gray-300 mb-4">{event.description}</p>
        )}

        <div className="flex items-center gap-6 text-sm text-gray-700 dark:text-gray-300 mb-4">
          {showDate && (
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(event.start_date || event.start_at)}</span>
            </div>
          )}
          {showLocation && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{event.venue_name}</span>
            </div>
          )}
        </div>

        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          {buttonText}
        </button>
      </div>
    </div>
  );
}
