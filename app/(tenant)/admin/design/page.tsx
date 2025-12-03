"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Palette, Type, Layout } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
// import { useTheme } from '@/context/ThemeContext'

interface DesignSettings {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  logo: {
    url: string;
    alt: string;
  };
  banner: {
    url: string;
    alt: string;
  };
  layout: {
    maxWidth: string;
    spacing: string;
  };
}

const colorPresets = [
  {
    name: "Blue",
    primary: "#3b82f6",
    secondary: "#1e40af",
    accent: "#60a5fa",
    background: "#ffffff",
    text: "#1f2937",
  },
  {
    name: "Green",
    primary: "#10b981",
    secondary: "#047857",
    accent: "#34d399",
    background: "#ffffff",
    text: "#1f2937",
  },
  {
    name: "Purple",
    primary: "#8b5cf6",
    secondary: "#7c3aed",
    accent: "#a78bfa",
    background: "#ffffff",
    text: "#1f2937",
  },
  {
    name: "Red",
    primary: "#ef4444",
    secondary: "#dc2626",
    accent: "#f87171",
    background: "#ffffff",
    text: "#1f2937",
  },
  {
    name: "Orange",
    primary: "#f97316",
    secondary: "#ea580c",
    accent: "#fb923c",
    background: "#ffffff",
    text: "#1f2937",
  },
  {
    name: "Dark Mode",
    primary: "#60a5fa",
    secondary: "#3b82f6",
    accent: "#93c5fd",
    background: "#1f2937",
    text: "#f3f4f6",
  },
  {
    name: "Midnight",
    primary: "#818cf8",
    secondary: "#6366f1",
    accent: "#a5b4fc",
    background: "#0f172a",
    text: "#e2e8f0",
  },
  {
    name: "Forest",
    primary: "#34d399",
    secondary: "#10b981",
    accent: "#6ee7b7",
    background: "#064e3b",
    text: "#ecfdf5",
  },
  {
    name: "Ocean",
    primary: "#06b6d4",
    secondary: "#0891b2",
    accent: "#22d3ee",
    background: "#164e63",
    text: "#f0fdfa",
  },
  {
    name: "Sunset",
    primary: "#fb923c",
    secondary: "#f97316",
    accent: "#fed7aa",
    background: "#431407",
    text: "#fef3c7",
  },
];

const fontOptions = [
  { name: "Inter", value: "Inter, sans-serif" },
  { name: "Roboto", value: "Roboto, sans-serif" },
  { name: "Open Sans", value: "Open Sans, sans-serif" },
  { name: "Lato", value: "Lato, sans-serif" },
  { name: "Montserrat", value: "Montserrat, sans-serif" },
  { name: "Poppins", value: "Poppins, sans-serif" },
];

export default function DesignPage() {
  // const { designSettings, updateDesignSettings } = useTheme();
  const [settings, setSettings] = useState<DesignSettings>({
    colors: {
      primary: "#3b82f6",
      secondary: "#1e40af",
      accent: "#60a5fa",
      background: "#ffffff",
      text: "#1f2937",
    },
    fonts: {
      heading: "Inter, sans-serif",
      body: "Inter, sans-serif",
    },
    logo: {
      url: "",
      alt: "Logo",
    },
    banner: {
      url: "",
      alt: "Banner",
    },
    layout: {
      maxWidth: "1200px",
      spacing: "normal",
    },
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string>("");

  useEffect(() => {
    // if (designSettings) {
    //   setSettings(designSettings)
    // }
    const savedSettings = localStorage.getItem("designSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const handleFaviconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 2MB for favicon)
      if (file.size > 2 * 1024 * 1024) {
        toast.error("Favicon file size must be less than 2MB");
        return;
      }

      // Check file type - only allow PNG, ICO, or SVG
      const allowedTypes = ["image/png", "image/x-icon", "image/svg+xml"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Please upload a PNG, ICO, or SVG file for favicon");
        return;
      }

      setFaviconFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setFaviconPreview(reader.result as string);
      reader.readAsDataURL(file);

      console.log("Favicon file selected:", {
        name: file.name,
        size: file.size,
        type: file.type,
      });
    }
  };

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBannerFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const saveSettings = async () => {
    try {
      setIsUploading(true);

      const formData = new FormData();
      console.log("Starting upload process...");

      // Add logo, favicon, and banner if selected
      if (logoFile) {
        formData.append("logo", logoFile);
      }
      if (faviconFile) {
        // Send favicon in its original format
        formData.append("favicon", faviconFile);
        console.log("Adding favicon to form data:", {
          name: faviconFile.name,
          size: faviconFile.size,
          type: faviconFile.type,
        });
      }

      // Add other settings
      formData.append("primary_color", settings.colors.primary);
      formData.append("secondary_color", settings.colors.secondary);
      formData.append("font_family", settings.fonts.heading);
      formData.append("show_add_to_cart", "0");
      formData.append("show_wallet", "0");

      const token = localStorage.getItem("access_token");

      if (!token) {
        toast.error("Authentication required. Please login again.");
        return;
      }
      console.log("formdata", formData);

      try {
        console.log("Sending request to API...");
        // Upload to API
        const response = await axios.post(
          "https://api.testjkl.in/api/tenant/onboarding/branding",
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        console.log("API Response:", response.data);

        // Force reload favicon by adding timestamp
        const favicon = document.querySelector("link[rel*='icon']");
        if (favicon) {
          const timestamp = new Date().getTime();
          const url = favicon.getAttribute("href")?.split("?")?.[0] || "";
          favicon.setAttribute("href", `${url}?v=${timestamp}`);
        }
      } catch (uploadError: any) {
        console.error("Upload Error Details:", {
          status: uploadError.response?.status,
          data: uploadError.response?.data,
          message: uploadError.message,
        });
        throw uploadError;
      }

      // Update local settings
      localStorage.setItem("designSettings", JSON.stringify(settings));

      toast.success("Design settings saved successfully!");
    } catch (error: any) {
      console.error("Error saving design settings:", error);
      toast.error(
        error.response?.data?.message || "Failed to save design settings"
      );
    } finally {
      setIsUploading(false);
    }
  };

  const applyColorPreset = (preset: (typeof colorPresets)[0]) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        primary: preset.primary,
        secondary: preset.secondary,
        accent: preset.accent,
        background: preset.background,
        text: preset.text,
      },
    }));
  };

  const updateColor = (
    colorKey: keyof DesignSettings["colors"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorKey]: value,
      },
    }));
  };

  const updateFont = (
    fontKey: keyof DesignSettings["fonts"],
    value: string
  ) => {
    setSettings((prev) => ({
      ...prev,
      fonts: {
        ...prev.fonts,
        [fontKey]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen ">
      <div className="border-b ">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold">Design Customization</h1>
                <p className="text-gray-600">
                  Customize your website appearance
                </p>
              </div>
            </div>
            <Button onClick={saveSettings} disabled={isUploading}>
              {isUploading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="colors" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="logo">
                  <Upload className="mr-2 h-4 w-4" />
                  Logo
                </TabsTrigger>
                {/* <TabsTrigger value="colors">
                  <Palette className="mr-2 h-4 w-4" />
                  Colors
                </TabsTrigger> */}
                {/* <TabsTrigger value="fonts">
                  <Type className="mr-2 h-4 w-4" />
                  Fonts
                </TabsTrigger> */}

                {/* <TabsTrigger value="layout">
                  <Layout className="mr-2 h-4 w-4" />
                  Layout
                </TabsTrigger> */}
              </TabsList>

              {/* <TabsContent value="colors" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Color Presets</CardTitle>
                    <CardDescription>Quick color schemes to get started</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-5 gap-3">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() => applyColorPreset(preset)}
                          className="flex flex-col items-center space-y-2 p-3 rounded-lg border-2 hover:border-gray-400 transition-all hover:shadow-md"
                          style={{ 
                            backgroundColor: preset.background,
                            borderColor: preset.text + '20'
                          }}
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ 
                                backgroundColor: preset.primary,
                                borderColor: preset.text + '40'
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ 
                                backgroundColor: preset.secondary,
                                borderColor: preset.text + '40'
                              }}
                            />
                            <div
                              className="w-3 h-3 rounded-full border"
                              style={{ 
                                backgroundColor: preset.accent,
                                borderColor: preset.text + '40'
                              }}
                            />
                          </div>
                          <span 
                            className="text-xs font-medium"
                            style={{ color: preset.text }}
                          >
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Colors</CardTitle>
                    <CardDescription>Fine-tune your color palette</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="primary-color"
                            type="color"
                            value={settings.colors.primary}
                            onChange={(e) => updateColor('primary', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.primary}
                            onChange={(e) => updateColor('primary', e.target.value)}
                            placeholder="#3b82f6"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="secondary-color"
                            type="color"
                            value={settings.colors.secondary}
                            onChange={(e) => updateColor('secondary', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.secondary}
                            onChange={(e) => updateColor('secondary', e.target.value)}
                            placeholder="#1e40af"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="accent-color"
                            type="color"
                            value={settings.colors.accent}
                            onChange={(e) => updateColor('accent', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.accent}
                            onChange={(e) => updateColor('accent', e.target.value)}
                            placeholder="#60a5fa"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="background-color">Background Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="background-color"
                            type="color"
                            value={settings.colors.background}
                            onChange={(e) => updateColor('background', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.background}
                            onChange={(e) => updateColor('background', e.target.value)}
                            placeholder="#ffffff"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="text-color">Text Color</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="text-color"
                            type="color"
                            value={settings.colors.text}
                            onChange={(e) => updateColor('text', e.target.value)}
                            className="w-16 h-10 p-1"
                          />
                          <Input
                            value={settings.colors.text}
                            onChange={(e) => updateColor('text', e.target.value)}
                            placeholder="#1f2937"
                          />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="fonts" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Typography</CardTitle>
                    <CardDescription>Choose fonts for headings and body text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="heading-font">Heading Font</Label>
                      <select
                        id="heading-font"
                        value={settings.fonts.heading}
                        onChange={(e) => updateFont('heading', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="body-font">Body Font</Label>
                      <select
                        id="body-font"
                        value={settings.fonts.body}
                        onChange={(e) => updateFont('body', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        {fontOptions.map((font) => (
                          <option key={font.name} value={font.value}>
                            {font.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}

              <TabsContent value="logo" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Logo & Favicon Upload</CardTitle>
                    <CardDescription>Upload your brand logo</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="logo-upload">Logo</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {logoPreview ? (
                          <div className="space-y-4">
                            <img
                              src={logoPreview}
                              alt="Logo preview"
                              className="mx-auto h-32 w-auto object-contain"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setLogoFile(null);
                                setLogoPreview("");
                              }}
                            >
                              Remove Logo
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop your logo here, or click to browse
                            </p>
                            {/* <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG, SVG up to 5MB
                            </p> */}
                          </>
                        )}
                        <input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleLogoChange}
                          className="hidden"
                        />
                        {!logoPreview && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={() =>
                              document.getElementById("logo-upload")?.click()
                            }
                          >
                            Upload Logo
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="favicon-upload">Favicon</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {faviconPreview ? (
                          <div className="space-y-4">
                            <img
                              src={faviconPreview}
                              alt="Favicon preview"
                              className="mx-auto h-16 w-16 object-contain"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setFaviconFile(null);
                                setFaviconPreview("");
                              }}
                            >
                              Remove Favicon
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop your favicon here, or click to
                              browse
                            </p>
                          </>
                        )}
                        <input
                          id="favicon-upload"
                          type="file"
                          accept=".ico,.png,.svg,image/x-icon,image/png,image/svg+xml"
                          onChange={handleFaviconChange}
                          className="hidden"
                        />
                        {!faviconPreview && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={() =>
                              document.getElementById("favicon-upload")?.click()
                            }
                          >
                            Upload Favicon
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* <div>
                      <Label htmlFor="banner-upload">Banner</Label>
                      <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        {bannerPreview ? (
                          <div className="space-y-4">
                            <img
                              src={bannerPreview}
                              alt="Banner preview"
                              className="mx-auto h-32 w-auto object-contain"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setBannerFile(null);
                                setBannerPreview("");
                              }}
                            >
                              Remove Banner
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="mx-auto h-12 w-12 text-gray-400" />
                            <p className="mt-2 text-sm text-gray-600">
                              Drag and drop your banner here, or click to browse
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              PNG, JPG up to 5MB
                            </p>
                          </>
                        )}
                        <input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleBannerChange}
                          className="hidden"
                        />
                        {!bannerPreview && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="mt-4"
                            onClick={() =>
                              document.getElementById("banner-upload")?.click()
                            }
                          >
                            Select Banner
                          </Button>
                        )}
                      </div>
                    </div> */}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* <TabsContent value="layout" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Layout Settings</CardTitle>
                    <CardDescription>Configure your website layout</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="max-width">Maximum Width</Label>
                      <select
                        id="max-width"
                        value={settings.layout.maxWidth}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          layout: { ...prev.layout, maxWidth: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="1200px">1200px (Default)</option>
                        <option value="1400px">1400px (Wide)</option>
                        <option value="100%">Full Width</option>
                        <option value="1000px">1000px (Narrow)</option>
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="spacing">Spacing</Label>
                      <select
                        id="spacing"
                        value={settings.layout.spacing}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          layout: { ...prev.layout, spacing: e.target.value }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="compact">Compact</option>
                        <option value="normal">Normal</option>
                        <option value="relaxed">Relaxed</option>
                      </select>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent> */}
            </Tabs>
          </div>

          {/* Preview Panel */}
          {/* <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Preview</CardTitle>
                <CardDescription>See how your changes look</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 rounded-lg p-6 space-y-6"
                  style={{ 
                    backgroundColor: settings.colors.background,
                    color: settings.colors.text,
                    fontFamily: settings.fonts.body,
                    borderColor: settings.colors.accent
                  }}
                >
                  {settings.logo.url && (
                    <img 
                      src={settings.logo.url || "/placeholder.svg"} 
                      alt={settings.logo.alt}
                      className="h-10 object-contain"
                    />
                  )}
                  <div className="space-y-3">
                    <h1 
                      className="text-2xl font-bold"
                      style={{ 
                        color: settings.colors.primary,
                        fontFamily: settings.fonts.heading
                      }}
                    >
                      Sample Heading
                    </h1>
                    <h2 
                      className="text-lg font-semibold"
                      style={{ 
                        color: settings.colors.secondary,
                        fontFamily: settings.fonts.heading
                      }}
                    >
                      Secondary Heading
                    </h2>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm" style={{ color: settings.colors.text }}>
                      This is how your body text will appear on your website. The text color and background color work together to create your site's visual identity.
                    </p>
                    <p className="text-xs opacity-75" style={{ color: settings.colors.text }}>
                      Smaller text elements like captions and metadata will appear like this.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      className="px-4 py-2 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: settings.colors.primary }}
                    >
                      Primary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded text-sm font-medium border-2 transition-opacity hover:opacity-90"
                      style={{ 
                        borderColor: settings.colors.secondary,
                        color: settings.colors.secondary,
                        backgroundColor: 'transparent'
                      }}
                    >
                      Secondary Button
                    </button>
                    <button
                      className="px-4 py-2 rounded text-white text-sm font-medium transition-opacity hover:opacity-90"
                      style={{ backgroundColor: settings.colors.accent }}
                    >
                      Accent Button
                    </button>
                  </div>
                  <div 
                    className="p-3 rounded border"
                    style={{ 
                      backgroundColor: settings.colors.primary + '10',
                      borderColor: settings.colors.primary + '30',
                      color: settings.colors.text
                    }}
                  >
                    <p className="text-xs font-medium">Info Box</p>
                    <p className="text-xs mt-1">This shows how content boxes with subtle backgrounds look.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div> */}
        </div>
      </div>
    </div>
  );
}
