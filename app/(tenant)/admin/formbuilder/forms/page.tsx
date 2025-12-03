"use client"

import React, { useEffect, useState } from "react"
import { formBuilderService } from "@/services/formbuilder.service"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, Loader2 } from "lucide-react"
import {toast} from "sonner"
import { useRouter } from "next/navigation"

export default function FormListPage() {
  const [forms, setForms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
   const route=useRouter()

  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const res = await formBuilderService.getForms()
         console.log("res",res)
        if (res) {
          setForms(res)
        }
      } catch (error) {
        console.error("Error fetching forms:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFormData()
  }, [])

  const handleEdit = (id: number) => {
    route.push(`/admin/formbuilder/forms/edit/${id}`)
    console.log("Edit form:", id)
  }

  const handleDelete = async (id: number) => {
    try {
      await formBuilderService.deleteForm(id)
      toast.success("🗑️ Form deleted successfully!")
  
      // Wait a short moment before reload (for toast visibility)
      setTimeout(() => {
        window.location.reload()
      }, 800)
    } catch (error: any) {
      console.error("Error deleting form:", error)
      toast.error(`❌ Failed to delete form: ${error.message || "Unknown error"}`)
    }
  }

  const handleView = (id: string) => {
    console.log("View form:", id)
    route.push(`/admin/formbuilder/submissions/${id}`)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">📋 All Forms</h1>

        {forms.length === 0 ? (
          <div className="text-center border border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-10">
            <p className="text-gray-500 dark:text-gray-400">No forms found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {forms.map((form) => (
              <Card
                key={form.id}
                className="relative border dark:border-gray-700 hover:shadow-lg transition-all duration-200"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-start">
                    <span className="font-semibold text-lg truncate">{form.name}</span>
                    <Badge
                      variant={
                        form.status === "published"
                          ? "default"
                          : form.status === "draft"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {form.status}
                    </Badge>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                
                  
                  <p>
                    <strong>Created At:</strong>{" "}
                    {new Date(form.created_at).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>

                  {/* Action buttons */}
                  <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleView(form.id)}
                      className="flex items-center gap-1"
                    >
                     <Eye className="h-4 w-4" /> View Submissions  ({form.total_submissions  })
                    </Button>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(form.id)}
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4 text-blue-600" /> Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(form.id)}
                        className="flex items-center gap-1"
                      >
                        <Trash2 className="h-4 w-4" /> 
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
  )
}
