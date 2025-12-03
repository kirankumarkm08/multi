"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Eye,
  Trash2,
  ArrowLeft,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";

interface CustomPage {
  id: number;
  title: string;
  slug: string;
  status: "draft" | "published" | "archived";
  created_at: string;
  updated_at: string;
}

export default function CustomPagesList() {
  const { token } = useAuth();
  const [pages, setPages] = useState<CustomPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    loadPages();
  }, [token]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('/tenant/pages?page_type=custom');
      setPages(Array.isArray(data.data) ? data.data : data || []);
    } catch (error) {
      console.error("Failed to load custom pages:", error);
      setPages([]);
    } finally {
      setLoading(false);
    }
  };

  const deletePage = async (pageId: number) => {
    if (!confirm("Are you sure you want to delete this custom page?")) return;

    setDeleting(pageId);
    try {
      await apiFetch(`/tenant/pages/${pageId}`, { method: "DELETE" });
      setPages(pages.filter(page => page.id !== pageId));
    } catch (error: any) {
      console.error("Failed to delete page:", error);
      alert(error?.message || "Failed to delete page");
    } finally {
      setDeleting(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published": return "default";
      case "draft": return "outline";
      case "archived": return "destructive";
      default: return "outline";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading custom pages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen ">
      <div className="border-b">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin/page-builder">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Page Builder
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Custom Pages</h1>
            </div>
            <Link href="/admin/page-builder/custom">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create New Page
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-6">
        {pages.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="text-muted-foreground">
                <Plus className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No custom pages yet</h3>
                <p className="mb-4">Get started by creating your first custom page.</p>
                <Link href="/admin/page-builder/custom/new">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {pages.map((page) => (
              <Card key={page.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold">{page.title}</h3>
                        <Badge variant={getStatusColor(page.status)}>
                          {page.status.charAt(0).toUpperCase() + page.status.slice(1)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">
                        Slug: /{page.slug}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(page.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/page-builder/custom?id=${page.id}`}>
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                      <Link href={`/preview/custom/${page.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                      </Link>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => deletePage(page.id)}
                        disabled={deleting === page.id}
                      >
                        {deleting === page.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}