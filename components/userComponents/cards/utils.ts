import { Event } from "@/types/event";

export const getImageUrl = (event: Event) => {
  if (event.event_banner) {
    if (event.event_banner.startsWith('http')) {
      return event.event_banner;
    }
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://165.227.182.17';
    return `${baseUrl.replace('/api', '')}/${event.event_banner.replace(/^\//, '')}`;
  }
  return null;
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
