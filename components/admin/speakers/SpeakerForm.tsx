"use client"

import type React from "react"
import { useState, useRef } from "react"
import type { event_participants } from "@/types/event-participants"
import { Upload, X, Plus, User, Settings, Star, ExternalLink, Twitter, Linkedin, Facebook, Instagram, Youtube, Globe } from "lucide-react"

interface SpeakerFormProps {
  speaker?: event_participants | null
  onSubmit: (speaker: event_participants) => void
  onCancel: () => void
}

const SOCIAL_PLATFORMS = [
  { value: "twitter", label: "Twitter", Icon: Twitter },
  { value: "linkedin", label: "LinkedIn", Icon: Linkedin },
  { value: "facebook", label: "Facebook", Icon: Facebook },
  { value: "instagram", label: "Instagram", Icon: Instagram },
  { value: "youtube", label: "YouTube", Icon: Youtube },
  { value: "website", label: "Website", Icon: Globe },
]

export default function SpeakerForm({ speaker, onSubmit, onCancel }: SpeakerFormProps) {
  const [formData, setFormData] = useState<event_participants>({
    id: speaker?.id,
    name: speaker?.name || "",
    position: speaker?.position || "",
    bio: speaker?.bio || "",
    profile_image: speaker?.profile_image || "",
    status: speaker?.status || "active",
    participant_type: speaker?.participant_type || "speaker",
    social_media_links: speaker?.social_media_links || [],
    is_featured: speaker?.is_featured || false,
    sort_order: speaker?.sort_order || 0,
    custom_fields: speaker?.custom_fields || {},
    metadata: speaker?.metadata || {},
  })

  const [imagePreview, setImagePreview] = useState<string>(speaker?.profile_image || "")
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [newSocialLink, setNewSocialLink] = useState({ platform: "twitter", url: "" })
  const [dragActive, setDragActive] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name || formData.name.length > 100) {
      newErrors.name = "Name is required and must be less than 100 characters"
    }

    if (!formData.position || formData.position.length > 255) {
      newErrors.position = "Position is required and must be less than 255 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (file: File) => {
    if (file) {
      // Validate file type
      const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
      if (!validTypes.includes(file.type)) {
        setErrors({ ...errors, image: "Please select a valid image file (JPEG, PNG, GIF, WebP)" })
        return
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({ ...errors, image: "Image size must be less than 10MB" })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Store the file separately
      setImageFile(file)
      
      // Clear any previous image errors
      if (errors.image) {
        setErrors({ ...errors, image: "" })
      }
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageChange(e.dataTransfer.files[0])
    }
  }

  const handleRemoveImage = () => {
    setImagePreview("")
    setImageFile(null)
    setFormData({ ...formData, profile_image: "" })
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleAddSocialLink = () => {
    if (newSocialLink.url) {
      const updatedLinks = [...(formData.social_media_links || []), { ...newSocialLink }]
      setFormData({ ...formData, social_media_links: updatedLinks })
      setNewSocialLink({ platform: "twitter", url: "" })
    }
  }

  const handleRemoveSocialLink = (index: number) => {
    const updatedLinks = formData.social_media_links?.filter((_, i) => i !== index)
    setFormData({ ...formData, social_media_links: updatedLinks })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      const submitData = {
        ...formData,
        _imageFile: imageFile // Pass the file separately
      };

      onSubmit(submitData);
    }
  }

  const getPlatformInfo = (platform: string) => {
    return SOCIAL_PLATFORMS.find((p) => p.value === platform) || { value: platform, label: platform, Icon: ExternalLink }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} encType="multipart/form-data" className="rounded-xl shadow-lg border border-border overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 px-8 py-6 border-b border-border">
          <h2 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <User className="w-8 h-8 text-primary" />
            {speaker ? "Edit Participant" : "Add New Participant"}
          </h2>
          <p className="text-muted-foreground mt-2">
            {speaker ? "Update participant information" : "Create a new event participant profile"}
          </p>
        </div>

        <div className="p-8 space-y-8">
          {/* Personal Information Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <User className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => {
                    setFormData({ ...formData, name: e.target.value })
                    if (errors.name) setErrors({ ...errors, name: "" })
                  }}
                  maxLength={100}
                  required
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.name ? "border-destructive" : "border-border"
                  }`}
                  placeholder="Enter full name"
                />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">
                  Position/Title <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => {
                    setFormData({ ...formData, position: e.target.value })
                    if (errors.position) setErrors({ ...errors, position: "" })
                  }}
                  maxLength={255}
                  required
                  className={`w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors ${
                    errors.position ? "border-destructive" : "border-border"
                  }`}
                  placeholder="e.g., Senior Developer, CEO"
                />
                {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-foreground">Biography</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring transition-colors resize-none"
                placeholder="Tell us about this participant's background and expertise..."
              />
            </div>
          </section>

          {/* Image Upload Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <Upload className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Profile Image</h3>
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-start">
              {imagePreview ? (
                <div className="relative group">
                  <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-border shadow-lg">
                    <img
                      src={imagePreview || "/placeholder.svg"}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
              
              <div className="flex-1">
                <div
                  className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragActive
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  }`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleImageChange(e.target.files[0])}
                    className="hidden"
                  />
                  <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-foreground font-medium mb-2">Drop an image here, or click to browse</p>
                  <p className="text-sm text-muted-foreground">Supports JPG, PNG, GIF, WebP up to 10MB</p>
                </div>
                {errors.image && <p className="text-sm text-destructive mt-2">{errors.image}</p>}
              </div>
            </div>
          </section>

          {/* Configuration Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <Settings className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Configuration</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Participant Type</label>
                <select
                  value={formData.participant_type || "speaker"}
                  onChange={(e) =>
                    setFormData({ ...formData, participant_type: e.target.value as "speaker" | "special_guest" })
                  }
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="speaker">Speaker</option>
                  <option value="special_guest">Special Guest</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-foreground">Sort Order</label>
                <input
                  type="number"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: Number.parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="featured"
                checked={formData.is_featured}
                onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                className="w-5 h-5 text-primary border-border rounded focus:ring-2 focus:ring-ring"
              />
              <label
                htmlFor="featured"
                className="flex items-center gap-2 text-sm font-medium text-foreground cursor-pointer"
              >
                <Star className="w-4 h-4 text-primary" />
                Featured Participant
              </label>
            </div>
          </section>

          {/* Social Media Section */}
          <section className="space-y-6">
            <div className="flex items-center gap-3 pb-3 border-b border-border">
              <ExternalLink className="w-5 h-5 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Social Media Links</h3>
            </div>

            <div className="space-y-4">
              {formData.social_media_links?.map((link, index) => {
                const platformInfo = getPlatformInfo(link.platform)
                const PlatformIcon = platformInfo.Icon
                return (
                  <div key={index} className="flex items-center gap-3 p-4 rounded-lg border border-border">
                    <PlatformIcon className="w-5 h-5 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground capitalize">{platformInfo.label}</p>
                      <p className="text-sm text-muted-foreground truncate">{link.url}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveSocialLink(index)}
                      className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}

              <div className="flex gap-3 p-4 border border-border rounded-lg">
                <select
                  value={newSocialLink.platform}
                  onChange={(e) => setNewSocialLink({ ...newSocialLink, platform: e.target.value })}
                  className="px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {SOCIAL_PLATFORMS.map((platform) => (
                    <option key={platform.value} value={platform.value}>
                      {platform.label}
                    </option>
                  ))}
                </select>
                <input
                  type="url"
                  value={newSocialLink.url}
                  onChange={(e) => setNewSocialLink({ ...newSocialLink, url: e.target.value })}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                  type="button"
                  onClick={handleAddSocialLink}
                  disabled={!newSocialLink.url}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-border flex justify-end gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-foreground border border-border rounded-lg hover:bg-muted/50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
          >
            {speaker ? "Update Participant" : "Create Participant"}
          </button>
        </div>
      </form>
    </div>
  )
}