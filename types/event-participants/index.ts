export interface event_participants {
    id?: string;
    name: string;
    position: string;
    bio?: string;
    profile_image?: string | File; // Legacy field for backward compatibility
    speaker_image?: string; // New field matching API
    status: 'active' | 'inactive';
    social_media_links?: {
      platform: string;
      url: string;
    }[];
    is_featured?: boolean;
    sort_order?: number;
    custom_fields?: Record<string, any>;
    metadata?: Record<string, any>;
    participant_type: 'speaker' | 'special_guest';
}