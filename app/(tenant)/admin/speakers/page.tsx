'use client';

import React, { useState, useEffect } from 'react';
import SpeakerForm from '@/components/admin/speakers/SpeakerForm';
import SpeakersList from '@/components/admin/speakers/SpeakersList';
import { toast } from 'sonner';
import { tenantApi } from '@/lib/api';
import { AuthService } from '@/services/auth.service';
import { event_participants } from '@/types/event-participants';

export type Speaker = event_participants;

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<event_participants[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<event_participants | null>(null);

  useEffect(() => {
    fetchSpeakers();
  }, []);

  const fetchSpeakers = async () => {
    try {
      setIsLoading(true);
      const token = AuthService.getToken();
      const response = await tenantApi.getSpeakers(token || undefined);
      console.log('Speakers API Response:', response); // Debug log
      
      // Handle different response structures
      let speakersData = [];
      if (Array.isArray(response)) {
        speakersData = response;
      } else if (response?.data && Array.isArray(response.data)) {
        speakersData = response.data;
      } else if (response?.speakers && Array.isArray(response.speakers)) {
        speakersData = response.speakers;
      } else if (response?.data?.speakers && Array.isArray(response.data.speakers)) {
        speakersData = response.data.speakers;
      } else {
        console.warn('Unexpected speakers response structure:', response);
      }
      
      setSpeakers(speakersData);
    } catch (error: any) {
      // Check if it's a 404 "no speakers found" error
      if (error.status === 404 || error.message?.includes('No speakers found')) {
        // This is expected when no speakers exist yet
        setSpeakers([]);
        console.log('No speakers found yet - this is normal for a new tenant');
      } else {
        // This is an actual error
        toast.error(error.message || 'Failed to fetch speakers');
        console.error('Error fetching speakers:', error);
        setSpeakers([]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpeaker = async (speakerData: any) => {
    try {
      const token = AuthService.getToken();
      console.log('Creating speaker with data:', speakerData); // Debug log

      // Check if there's an image file to upload
      let requestData: FormData | event_participants;

      if (speakerData._imageFile) {
        // Create FormData for multipart upload
        const formData = new FormData();

        // Append the image file
        formData.append('profile_image', speakerData._imageFile);

        // Append other fields
        formData.append('name', speakerData.name);
        formData.append('position', speakerData.position);
        if (speakerData.bio) formData.append('bio', speakerData.bio);
        formData.append('status', speakerData.status);
        formData.append('participant_type', speakerData.participant_type);
        formData.append('is_featured', speakerData.is_featured ? '1' : '0');
        formData.append('sort_order', speakerData.sort_order.toString());

        // Append social media links as array items (API expects array, not JSON string)
        const socialLinks = speakerData.social_media_links || [];
        socialLinks.forEach((link: any, index: number) => {
          formData.append(`social_media_links[${index}][platform]`, link.platform);
          formData.append(`social_media_links[${index}][url]`, link.url);
        });

        // Append custom fields and metadata if present
        if (speakerData.custom_fields && Object.keys(speakerData.custom_fields).length > 0) {
          formData.append('custom_fields', JSON.stringify(speakerData.custom_fields));
        }
        if (speakerData.metadata && Object.keys(speakerData.metadata).length > 0) {
          formData.append('metadata', JSON.stringify(speakerData.metadata));
        }

        requestData = formData;
      } else {
        // No image file, send as JSON
        const { _imageFile, ...cleanData } = speakerData;
        requestData = {
          ...cleanData,
          social_media_links: Array.isArray(cleanData.social_media_links)
            ? cleanData.social_media_links
            : []
        };
      }

      console.log('Request data being sent:', requestData);
      console.log('social_media_links:', requestData.social_media_links);

      const response = await tenantApi.createSpeaker(requestData, token || undefined);
      console.log('Create speaker response:', response); // Debug log

      toast.success('Speaker created successfully');
      setShowForm(false);
      await fetchSpeakers(); // Refresh the list
    } catch (error: any) {
      toast.error(error.message || 'Failed to create speaker');
      console.error('Error creating speaker:', error);

      // Log more details for debugging
      if (error.data) {
        console.error('Error details:', error.data);
      }
    }
  };

  const handleUpdateSpeaker = async (speakerData: any) => {
    try {
      if (!speakerData.id) {
        toast.error('Speaker ID is missing');
        return;
      }

      const token = AuthService.getToken();

      // Check if there's an image file to upload
      let requestData: FormData | event_participants;

      if (speakerData._imageFile) {
        // Create FormData for multipart upload
        const formData = new FormData();

        // Append the image file
        formData.append('profile_image', speakerData._imageFile);

        // Append other fields
        formData.append('name', speakerData.name);
        formData.append('position', speakerData.position);
        if (speakerData.bio) formData.append('bio', speakerData.bio);
        formData.append('status', speakerData.status);
        formData.append('participant_type', speakerData.participant_type);
        formData.append('is_featured', speakerData.is_featured ? '1' : '0');
        formData.append('sort_order', speakerData.sort_order.toString());

        // Append social media links as array items (API expects array, not JSON string)
        const socialLinks = speakerData.social_media_links || [];
        socialLinks.forEach((link: any, index: number) => {
          formData.append(`social_media_links[${index}][platform]`, link.platform);
          formData.append(`social_media_links[${index}][url]`, link.url);
        });

        // Append custom fields and metadata if present
        if (speakerData.custom_fields && Object.keys(speakerData.custom_fields).length > 0) {
          formData.append('custom_fields', JSON.stringify(speakerData.custom_fields));
        }
        if (speakerData.metadata && Object.keys(speakerData.metadata).length > 0) {
          formData.append('metadata', JSON.stringify(speakerData.metadata));
        }

        requestData = formData;
      } else {
        // No image file, send as JSON
        const { _imageFile, ...cleanData } = speakerData;
        requestData = {
          ...cleanData,
          social_media_links: Array.isArray(cleanData.social_media_links)
            ? cleanData.social_media_links
            : []
        };
      }

      console.log('Update request data:', requestData); // Debug log

      await tenantApi.updateSpeaker(Number(speakerData.id), requestData, token || undefined);
      toast.success('Speaker updated successfully');
      setEditingSpeaker(null);
      fetchSpeakers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update speaker');
      console.error(error);
    }
  };

  const handleDeleteSpeaker = async (id: string) => {
    if (!confirm('Are you sure you want to delete this speaker?')) return;

    try {
      const token = AuthService.getToken();
      await tenantApi.deleteSpeaker(Number(id), token || undefined);
      toast.success('Speaker deleted successfully');
      fetchSpeakers();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete speaker');
      console.error(error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Speakers Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          {showForm ? 'Cancel' : 'Add New Speaker'}
        </button>
      </div>

      {(showForm || editingSpeaker) && (
        <div className="mb-6">
          <SpeakerForm
            speaker={editingSpeaker}
            onSubmit={editingSpeaker ? handleUpdateSpeaker : handleCreateSpeaker}
            onCancel={() => {
              setShowForm(false);
              setEditingSpeaker(null);
            }}
          />
        </div>
      )}

      <SpeakersList
        speakers={speakers}
        isLoading={isLoading}
        onEdit={setEditingSpeaker}
        onDelete={handleDeleteSpeaker}
      />
    </div>
  );
}