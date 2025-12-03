"use client"

import { useEffect, useState } from "react"
import { event_participants } from "@/types/event-participants"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface DynamicSpeakersProps {
  speakers?: event_participants[]
  layout?: "grid" | "list" | "featured"
  showOnlyFeatured?: boolean
  limit?: number
  showBio?: boolean
  showSocialLinks?: boolean
}

export default function DynamicSpeakers({
  speakers: propSpeakers,
  layout = "grid",
  showOnlyFeatured = false,
  limit,
  showBio = true,
  showSocialLinks = true
}: DynamicSpeakersProps) {
  const [speakers, setSpeakers] = useState<event_participants[]>(propSpeakers || [])
  const [loading, setLoading] = useState(!propSpeakers)
  const [selectedSpeaker, setSelectedSpeaker] = useState<event_participants | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const normalizeImageUrl = (url: string | undefined) => {
    if (!url) return undefined;
    return url.replace(/([^:]\/)\/+/g, "$1"); // Remove double slashes except after protocol
  }

  useEffect(() => {
    speakers.forEach(i => {
      console.log(i.profile_image);
    });
  }, [speakers]);

  const getSocialIcon = (platform: string) => {
    const icons: { [key: string]: string } = {
      twitter: "🐦",
      linkedin: "💼",
      facebook: "👥",
      instagram: "📸",
      website: "🌐",
      github: "💻"
    }
    return icons[platform.toLowerCase()] || "🔗"
  }

  const handleSpeakerClick = (speaker: event_participants) => {
    setSelectedSpeaker(speaker)
    setIsDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading speakers...</p>
          </div>
        </div>
      </div>
    )
  }

  if (layout === "list") {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            {showOnlyFeatured ? "Featured Speakers" : "Our Speakers"}
          </h2>
          <div className="space-y-6">
            {speakers.map((speaker) => (
              <div
                key={speaker.id}
                className="rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                onClick={() => handleSpeakerClick(speaker)}
              >
                <div className="p-6 flex items-start gap-6">
                  {speaker.profile_image ? (
                    <img
                      src={normalizeImageUrl(speaker.profile_image as string)}
                      alt={speaker.name}
                      className="w-24 h-24 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-gray-500 text-2xl font-semibold">
                        {speaker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold text-gray-800">{speaker.name}</h3>
                      {speaker.is_featured && <span className="text-yellow-500">⭐</span>}
                    </div>
                    <p className="text-blue-600 font-medium mb-3">{speaker.position}</p>
                    {showBio && speaker.bio && <p className="text-gray-600 mb-4 leading-relaxed">{speaker.bio}</p>}
                    {showSocialLinks &&
                      speaker.social_media_links &&
                      speaker.social_media_links.length > 0 && (
                        <div className="flex gap-3">
                          {speaker.social_media_links.map((link, index) => (
                            <a
                              key={index}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 transition-colors"
                              title={link.platform}
                            >
                            </a>
                          ))}
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
          {showOnlyFeatured ? "Featured Speakers" : "Our Speakers"}
        </h2>
        <div
          className={`grid gap-8 ${
            layout === "featured"
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
          }`}
        >
          {speakers.map((speaker) => (
            <div
              key={speaker.id}
              className="rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleSpeakerClick(speaker)}
            >
              {speaker.profile_image ? (
                <img
                  src={normalizeImageUrl(speaker.profile_image as string)}
                  alt={speaker.name}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 flex items-center justify-center">
                  <span className="text-gray-500 text-4xl font-semibold">
                    {speaker.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">{speaker.name}</h3>
                  {speaker.is_featured && <span className="text-yellow-500">⭐</span>}
                </div>
                <p className="text-blue-600 font-medium mb-3">{speaker.position}</p>
                {showBio && speaker.bio && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{speaker.bio}</p>
                )}
                {showSocialLinks &&
                  speaker.social_media_links &&
                  speaker.social_media_links.length > 0 && (
                    <div className="flex gap-2 justify-center">
                      {speaker.social_media_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-blue-100 transition-colors"
                          title={link.platform}
                        >
                          <span className="text-sm">{getSocialIcon(link.platform)}</span>
                        </a>
                      ))}
                    </div>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSpeaker && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-4 mb-4">
                  {selectedSpeaker.profile_image ? (
                    <img
                      src={normalizeImageUrl(selectedSpeaker.profile_image as string)}
                      alt={selectedSpeaker.name}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 text-3xl font-semibold">
                        {selectedSpeaker.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="flex-1">
                    <DialogTitle className="text-2xl flex items-center gap-2">
                      {selectedSpeaker.name}
                      {selectedSpeaker.is_featured && <span className="text-yellow-500">⭐</span>}
                    </DialogTitle>
                    <DialogDescription className="text-blue-600 font-medium text-base">
                      {selectedSpeaker.position}
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {selectedSpeaker.bio && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">About</h4>
                    <p className="text-gray-600 leading-relaxed">{selectedSpeaker.bio}</p>
                  </div>
                )}

                {selectedSpeaker.social_media_links && selectedSpeaker.social_media_links.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-3">Connect</h4>
                    <div className="flex flex-wrap gap-3">
                      {selectedSpeaker.social_media_links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors"
                        >
                          <span className="text-lg">{getSocialIcon(link.platform)}</span>
                          <span className="font-medium capitalize">{link.platform}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  )
}