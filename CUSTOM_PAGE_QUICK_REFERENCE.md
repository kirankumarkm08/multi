# Custom Page Builder - Quick Reference

## 📁 File Locations

```
components/page-builder/custom-page/
  ├── header.tsx ..................... PageHeader component
  ├── sidebar.tsx .................... PageSidebar component
  ├── builder-content.tsx ............ PageBuilderContent component
  ├── loading-skeleton.tsx ........... PageLoadingSkeleton component
  └── index.ts ....................... Component exports

hooks/
  └── use-custom-page-builder.ts ..... State management hook

app/(tenant)/admin/page-builder/custom/
  └── page-new.tsx ................... Main orchestrator (refactored)
```

---

## 🎯 Quick Imports

### Import All Components

```tsx
import {
  PageHeader,
  PageSidebar,
  PageBuilderContent,
  PageLoadingSkeleton,
} from "@/components/page-builder/custom-page";
```

### Import Hook

```tsx
import { useCustomPageBuilder } from "@/hooks/use-custom-page-builder";
```

### Import Types

```tsx
import { CustomPageData } from "@/types/custom-page";
```

### Import Helpers

```tsx
import {
  parseJsonField,
  buildPageData,
  convertApiResponseToPageData,
} from "@/lib/page-builder/custom-page-helpers";
```

### Import Constants

```tsx
import {
  PAGE_STATUS_OPTIONS,
  NAVIGATION_OPTIONS,
  PAGE_BUILDER_ERRORS,
  DEFAULT_CUSTOM_PAGE_DATA,
} from "@/constants/page-builder";
```

---

## 🔧 Usage Examples

### Use Complete Page Component

```tsx
"use client";

import { useAuth } from "@/context/AuthContext";
import { useCustomPageBuilder } from "@/hooks/use-custom-page-builder";
import {
  PageHeader,
  PageSidebar,
  PageBuilderContent,
  PageLoadingSkeleton,
} from "@/components/page-builder/custom-page";
import { WithBuilderErrorBoundary } from "@/components/page-builder/components/builder-error-boundary";
import { useEffect } from "react";

export default function MyPageBuilder() {
  const { token } = useAuth();
  const {
    page,
    pageId,
    initialPageData,
    isLoading,
    isDeleting,
    handleSettingsChange,
    deletePage,
    loadPageFromUrl,
  } = useCustomPageBuilder();

  useEffect(() => {
    loadPageFromUrl(token || "");
  }, [token, loadPageFromUrl]);

  if (isLoading) return <PageLoadingSkeleton />;

  return (
    <WithBuilderErrorBoundary>
      <div className="min-h-screen flex flex-col">
        <PageHeader page={page} isDeleting={isDeleting} onDelete={deletePage} />
        <div className="container flex gap-6 flex-1 p-6">
          <PageSidebar page={page} onSettingsChange={handleSettingsChange} />
          <PageBuilderContent
            pageId={pageId}
            initialPageData={initialPageData}
            page={page}
            onPageSettingsChange={handleSettingsChange}
          />
        </div>
      </div>
    </WithBuilderErrorBoundary>
  );
}
```

### Use Hook Standalone

```tsx
import { useCustomPageBuilder } from "@/hooks/use-custom-page-builder";

export function MyCustomComponent() {
  const { page, handleSettingsChange } = useCustomPageBuilder();

  return (
    <div>
      <h1>{page.title}</h1>
      <button onClick={() => handleSettingsChange({ title: "New Title" })}>
        Update Title
      </button>
    </div>
  );
}
```

### Use Individual Components

```tsx
import { PageHeader } from "@/components/page-builder/custom-page";
import { CustomPageData } from "@/types/custom-page";

const page: CustomPageData = {
  /* ... */
};

<PageHeader
  page={page}
  isDeleting={false}
  onDelete={() => console.log("Delete")}
/>;
```

---

## 📊 Hook Return Type

```typescript
interface UseCustomPageBuilderReturn {
  page: CustomPageData; // Current page data
  pageId?: number; // Page ID from URL
  initialPageData: any; // Full page data with layout
  isLoading: boolean; // Loading state
  isDeleting: boolean; // Deleting state
  handleSettingsChange: (updates: Partial<CustomPageData>) => void;
  deletePage: () => Promise<void>;
  loadPageFromUrl: (token: string) => void;
}
```

---

## 📝 Component Props

### PageHeader

```typescript
interface PageHeaderProps {
  page: CustomPageData;
  isDeleting: boolean;
  onDelete: () => void;
}
```

### PageSidebar

```typescript
interface PageSidebarProps {
  page: CustomPageData;
  onSettingsChange: (updates: Partial<CustomPageData>) => void;
}
```

### PageBuilderContent

```typescript
interface PageBuilderContentProps {
  pageId?: number;
  initialPageData: any;
  page: CustomPageData;
  onPageSettingsChange: (updates: Partial<CustomPageData>) => void;
}
```

### PageLoadingSkeleton

```typescript
// No props required
<PageLoadingSkeleton />
```

---

## 🎨 Component Features

### PageHeader

- ✅ Displays page name and status
- ✅ Shows delete button when page has ID
- ✅ Animated delete loading state
- ✅ Sticky positioning
- ✅ Dark mode support

### PageSidebar

- ✅ Wraps PageSettingsSidebar
- ✅ Manages custom page field mapping
- ✅ Sticky positioning
- ✅ Responsive width

### PageBuilderContent

- ✅ Renders BuilderCanvas
- ✅ Manages external page settings
- ✅ Flexible width
- ✅ Handles settings callbacks

### PageLoadingSkeleton

- ✅ Centered layout
- ✅ Animated spinner
- ✅ Loading message
- ✅ Full screen height

---

## 🔄 Data Flow

```
User Action (UI)
    ↓
Component Event (onChange, onDelete, etc.)
    ↓
handleSettingsChange or deletePage (from hook)
    ↓
State Update (setPage)
    ↓
Re-render Component with new state
    ↓
Display updated UI
```

---

## ⚡ Common Tasks

### Load a specific page

```tsx
const { loadPageFromUrl } = useCustomPageBuilder();
useEffect(() => {
  loadPageFromUrl(token);
}, [token]);
```

### Update page title

```tsx
const { handleSettingsChange } = useCustomPageBuilder();
handleSettingsChange({ title: "New Title" });
```

### Delete page

```tsx
const { deletePage } = useCustomPageBuilder();
await deletePage();
```

### Check if loading

```tsx
const { isLoading } = useCustomPageBuilder();
if (isLoading) return <PageLoadingSkeleton />;
```

---

## 🧪 Testing

### Test Hook

```tsx
import { renderHook, waitFor } from "@testing-library/react";
import { useCustomPageBuilder } from "@/hooks/use-custom-page-builder";

test("loads page data", async () => {
  const { result } = renderHook(() => useCustomPageBuilder());

  act(() => {
    result.current.loadPageFromUrl("token");
  });

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Test Component

```tsx
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/page-builder/custom-page";

test("renders page name", () => {
  const page = { name: "Test Page", status: "draft" };
  render(<PageHeader page={page} isDeleting={false} onDelete={jest.fn()} />);
  expect(screen.getByText("Test Page")).toBeInTheDocument();
});
```

---

## 📚 Related Files

- `types/custom-page.ts` - Type definitions
- `constants/page-builder.ts` - Constants and defaults
- `lib/page-builder/custom-page-helpers.ts` - Utility functions
- `CUSTOM_PAGE_REFACTORING.md` - Full refactoring documentation

---

**Last Updated:** November 13, 2025  
**Status:** ✅ Complete
