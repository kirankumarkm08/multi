"use client";

import { Event } from "@/types/event";
import { formatDate } from "./utils";

interface EventCardMinimalProps {
  event: Event;
  showDate: boolean;
  showLocation: boolean;
}

export function EventCardMinimal({
  event,
  showDate,
  showLocation,
}: EventCardMinimalProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow hover:shadow-md transition-shadow">
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">{event.event_name}</h3>
      {showDate && (
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{formatDate(event.start_date || event.start_at)}</p>
      )}
      {showLocation && (
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{event.venue_name}</p>
      )}
    </div>
  );
}
