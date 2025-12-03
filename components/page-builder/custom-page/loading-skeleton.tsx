"use client";

import { Loader2 } from "lucide-react";

/**
 * Loading Skeleton Component
 * Displays while page is loading
 */
export function PageLoadingSkeleton() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading page...</p>
      </div>
    </div>
  );
}
