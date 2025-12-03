"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Edit,
  Trash2,
  Globe,
  Plus,
  Loader2,
  ExternalLink,
  Eye,
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api-config";
import { useAuth } from "@/context/AuthContext";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MuiButton from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { Page } from "@/types/page";
import Loading from "@/components/common/Loading";
import Error from "@/components/common/Error";

export default function PagesPage() {
  const { token } = useAuth();
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<
    "error" | "success" | "warning" | "info"
  >("error");
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    pageId: string | null;
    pageName: string;
  }>({
    open: false,
    pageId: null,
    pageName: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = useCallback(
    (
      message: string,
      severity: "error" | "success" | "warning" | "info" = "error"
    ) => {
      setSnackbarMessage(message);
      setSnackbarSeverity(severity);
      setOpenSnackbar(true);
    },
    []
  );

  const handleCloseSnackbar = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenSnackbar(false);
  };

  useEffect(() => {
    async function fetchPages() {
      if (!token) return;
      setLoading(true);
      try {
        const response = await apiFetch("/tenant/pages");
        const pagesData = Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
          ? response.data
          : [];
        setPages(pagesData);
        setError(null);
      } catch (err: any) {
        console.error("Failed to fetch pages:", err);
        const errorMessage = err.message || "Failed to fetch pages";
        setError(errorMessage);
        showToast(errorMessage, "error");
        setPages([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPages();
  }, [token, showToast]);

  const getEditHref = (page: Page) => {
    const rawType = (
      page.page_type ||
      page.type ||
      (page as any)?.form_type ||
      "custom"
    ).toLowerCase();

    switch (rawType) {
      case "landing":
        return `/admin/page-builder/layout`;
      case "login":
        return `/admin/page-builder/login?id=${page.id}`;
      case "contact":
      case "contact_us":
        return `/admin/page-builder/contact?id=${page.id}`;
      case "register":
      case "registration":
        return `/admin/page-builder/registration/edit?id=${page.id}`;
      case "custom":
        return `/admin/page-builder/custom?id=${page.id}`;
      default:
        return `/admin/page-builder/custom?id=${page.id}`;
    }
  };

  const openDeleteDialog = (pageId: string, pageName: string) => {
    setDeleteDialog({ open: true, pageId, pageName });
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteDialog({ open: false, pageId: null, pageName: "" });
    }
  };

  const confirmDelete = async () => {
    if (!deleteDialog.pageId) return;

    setIsDeleting(true);
    try {
      await apiFetch(`/tenant/pages/${deleteDialog.pageId}`, {
        method: "DELETE",
      });

      setPages((prev) =>
        prev.filter((page) => page.id !== deleteDialog.pageId)
      );
      showToast(
        `Page "${deleteDialog.pageName}" deleted successfully`,
        "success"
      );
      closeDeleteDialog();
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message || err.message || "Failed to delete page";
      showToast(errorMessage, "error");
    } finally {
      setIsDeleting(false);
    }
  };

  const getPageTypeColor = (type: string) => {
    const normalizedType = type.toLowerCase();
    switch (normalizedType) {
      case "register":
      case "registration":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "login":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "contact":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "custom":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "landing":
        return "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200";
      case "standard":
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200";
    }
  };

  const getDisplayType = (page: Page) => {
    return page.page_type || page.type || "custom";
  };

  const getLastUpdated = (page: Page) => {
    const dateStr = page.updated_at || page.updatedAt;
    if (!dateStr) return "Never";
    try {
      return new Date(dateStr).toLocaleDateString();
    } catch {
      return "Invalid Date";
    }
  };

  if (!token) {
    return (
      <div className="text-red-600 dark:text-red-400 font-bold p-8 text-center">
        API key missing or invalid. Access denied.
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Top Header */}
      <div className="border-b bg-white dark:bg-gray-800 dark:border-gray-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Pages Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all your website pages
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/page-builder/custom/">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Custom Page
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto p-6">
        {pages.length === 0 ? (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardContent className="text-center py-12">
              <Globe className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                No pages found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Start building your website by creating your first page.
              </p>
              <div className="flex items-center space-x-2 justify-center">
                <Link href="/admin/page-builder/custom/">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Custom Page
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-gray-100">
                All Pages ({pages.length})
              </CardTitle>
              <CardDescription className="text-gray-600 dark:text-gray-400">
                Manage and edit your website pages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-200 dark:border-gray-700">
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Page Name
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Type
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      URL Slug
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Status
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Last Updated
                    </TableHead>
                    <TableHead className="text-gray-700 dark:text-gray-300">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pages.map((page) => (
                    <TableRow
                      key={page.id}
                      className="border-gray-200 dark:border-gray-700"
                    >
                      <TableCell>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-gray-100">
                            {page.title || page.name || "Untitled"}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-xs">
                            {/* {page.settings?.description || "No description"} */}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={getPageTypeColor(getDisplayType(page))}
                        >
                          {getDisplayType(page)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <code className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-sm text-gray-800 dark:text-gray-200">
                            {page.slug || "no-slug"}
                          </code>
                          {page.status === "published" && page.slug && (
                            <Link href={`/${page.slug}`} target="_blank">
                              <ExternalLink className="h-3 w-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300" />
                            </Link>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            page.status === "published"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : page.status === "draft"
                              ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }
                        >
                          {page.status || "draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {getLastUpdated(page)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          <Link href={getEditHref(page)}>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Edit content"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {page.page_type === "landing" ? (
                            ""
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                openDeleteDialog(
                                  page.id,
                                  page.title || page.name || "Untitled"
                                )
                              }
                              disabled={isDeleting}
                              title="Delete page"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog
        open={deleteDialog.open}
        onClose={closeDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{
          sx: {
            bgcolor: "background.paper",
            color: "text.primary",
          },
        }}
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the page "{deleteDialog.pageName}"?
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <MuiButton
            onClick={closeDeleteDialog}
            disabled={isDeleting}
            color="primary"
          >
            Cancel
          </MuiButton>
          <MuiButton
            onClick={confirmDelete}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : null}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </MuiButton>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
        sx={{
          top: "24px",
          right: "24px",
        }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          variant="filled"
          sx={{
            width: "100%",
            minWidth: "300px",
            boxShadow: 3,
          }}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}
