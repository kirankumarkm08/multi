'use client';

import React, { useEffect } from 'react';
import { event_participants } from '@/types/event-participants';
import { Calendar, Tag, Edit, Trash2, Plus, Clock, MapPin } from "lucide-react";


interface SpeakersListProps {
  speakers: event_participants[];
  isLoading: boolean;
  onEdit: (speaker: event_participants) => void;
  onDelete: (id: string) => void;
}

export default function SpeakersList({ speakers, isLoading, onEdit, onDelete }: SpeakersListProps) {
  const normalizeImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.replace(/([^:]\/)\/+/g, "$1"); // Remove double slashes except after protocol
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }


  useEffect(() => {
    speakers.forEach(i => {
      console.log(i.profile_image);
    });
  }, [speakers]);
  
  if (speakers.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No speakers found. Add your first speaker to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Image
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Position
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Featured
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Sort Order
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Social Links
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase  tracking-wider">
                participant type
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {speakers.map((speaker) => (
              <tr key={speaker.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                <td className="px-6 py-4 whitespace-nowrap">
                  {(speaker.profile_image) ? (
                    <img
                      src={normalizeImageUrl(speaker.profile_image as string)}
                      alt={speaker.name}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
                      <span className="text-gray-500 dark:text-gray-400 text-xl">
                        {speaker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {speaker.name}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {speaker.position}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    speaker.status === 'active'
                      ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100'
                      : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                  }`}>
                    {speaker.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {speaker.is_featured ? (
                    <span className="text-yellow-500">⭐</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {speaker.sort_order || 0}
                </td>
              
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-1">
                    {speaker.social_media_links?.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                        title={link.platform}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                        </svg>
                      </a>
                    ))}
                    {(!speaker.social_media_links || speaker.social_media_links.length === 0) && (
                      <span className="text-gray-400 text-sm">None</span>
                    )}
                  </div>
                </td>
                <td className='px-6 py-4 whitespace-nowrap text-center'>
                  {speaker.participant_type}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={() => onEdit(speaker)}
                    className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-3"
                  >
                    <Edit />
                     
                  </button>
                  <button
                    onClick={() => speaker.id && onDelete(speaker.id)}
                    className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}