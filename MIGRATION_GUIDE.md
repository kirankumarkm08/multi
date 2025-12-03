# BuilderCanvas Migration & Integration Guide

## 📋 Overview

This guide shows how to migrate from the monolithic `BuilderCanvas` to the new modular architecture and use the refactored components in your landing page and custom page builders.

---

## 🚀 Quick Start

### Step 1: Import from New Modules

```typescript
// Before: Everything from one file
import { BuilderCanvas } from "@/components/page-builder/builder-canvas";

// After: Import modular pieces
import { BuilderCanvas } from "@/components/page-builder/builder-canvas-refactored";
import {
  PageSettingsSidebar,
  FormField,
  SelectField,
  WithBuilderErrorBoundary,
} from "@/components/page-builder/components";
import {
  usePageBuilder,
  useBuilderDataLoader,
  useBuilderInteraction,
} from "@/hooks";
import {
  layoutJsonToSections,
  sectionsToLayoutJson,
  createRow,
} from "@/lib/page-builder/layout-service";
```

---

## 🔧 Migration Paths

### Path 1: Landing Page (Quickest)

**Current:** `app/(tenant)/admin/page-builder/layout/page.tsx`

**Current Usage:**

```tsx
<BuilderCanvas
  pageId={pageId}
  pageType="landing"
  initialPageData={initialPageData}
  externalPageSettings={pageSettings}
  onPageSettingsChange={handleSettingsChange}
/>
```

**After Migration:** No changes needed! The refactored BuilderCanvas is a drop-in replacement.

### Path 2: Custom Page (Moderate)

**Current:** `app/(tenant)/admin/page-builder/custom/page.tsx`

**Before (469 lines with duplication):**

```tsx
export default function CustomPageBuilder() {
  const [page, setPage] = useState(...);
  const [isLoading, setIsLoading] = useState(false);
  const [pageId, setPageId] = useState();
  const [initialPageData, setInitialPageData] = useState();

  // ~ 150 lines of complex logic

  return (
    <div className="min-h-screen">
      <Header page={page} />
      <div className="container">
        <Sidebar page={page} onSettingsChange={...} />
        <Builder
          pageId={pageId}
          initialPageData={initialPageData}
          page={page}
          onPageSettingsChange={...}
        />
      </div>
    </div>
  );
}
```

**After (Simplified with reusable components):**

```tsx
"use client";

import {
  WithBuilderErrorBoundary,
  PageSettingsSidebar,
} from "@/components/page-builder/components";
import { BuilderCanvas } from "@/components/page-builder/builder-canvas-refactored";
import { usePageBuilder } from "@/hooks/use-page-builder";

export default function CustomPageBuilder() {
  const [pageState, pageActions] = usePageBuilder({
    pageType: "custom",
  });

  const [pageSettings, setPageSettings] = useState({
    title: pageState.pageData.title,
    slug: (pageState.pageData as any).slug,
    status: (pageState.pageData as any).status,
  });

  return (
    <WithBuilderErrorBoundary>
      <div className="min-h-screen">
        <div className="container mx-auto p-6">
          <div className="flex gap-6">
            {/* Settings Sidebar */}
            <PageSettingsSidebar
              title="Custom Page Settings"
              pageData={pageSettings as any}
              onSettingsChange={(updates) =>
                setPageSettings((prev) => ({ ...prev, ...updates }))
              }
              showAdvanced
              showStatusInfo
            />

            {/* Builder Canvas */}
            <div className="flex-1">
              <BuilderCanvas
                pageId={pageState.pageData.id as number}
                pageType="custom"
                initialPageData={pageState.pageData}
                externalPageSettings={pageSettings}
                onPageSettingsChange={(updates) =>
                  (pageState.pageData = updates)
                }
              />
            </div>
          </div>
        </div>
      </div>
    </WithBuilderErrorBoundary>
  );
}
```

---

## 📚 Component Usage Examples

### Using Layout Service

```typescript
import {
  layoutJsonToSections,
  sectionsToLayoutJson,
  createRow,
  addRowToSection,
  updateColumnWidths,
} from "@/lib/page-builder/layout-service";

// Convert JSON to sections
const sections = layoutJsonToSections(pageLayout.layout_json);

// Add a new row to a section
const updatedSections = addRowToSection(sections, sectionId, 2);

// Update column widths
const resizedSections = updateColumnWidths(
  updatedSections,
  sectionId,
  rowId,
  [60, 40]
);

// Convert back to JSON
const newLayoutJson = sectionsToLayoutJson(updatedSections);
```

### Using Form Components

```typescript
import {
  FormField,
  TextAreaField,
  SelectField,
} from "@/components/page-builder/components";

function MyPageSettings() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("draft");

  return (
    <div className="space-y-4">
      <FormField
        label="Page Title"
        id="title"
        value={title}
        onChange={setTitle}
        placeholder="Enter title"
        required
      />

      <TextAreaField
        label="Description"
        id="description"
        value={description}
        onChange={setDescription}
        rows={3}
        maxLength={500}
      />

      <SelectField
        label="Status"
        value={status}
        onValueChange={setStatus}
        options={[
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
        ]}
      />
    </div>
  );
}
```

### Using Settings Sidebar

```typescript
import { PageSettingsSidebar } from "@/components/page-builder/components";

function MyBuilder() {
  const [pageData, setPageData] = useState({
    title: "My Page",
    slug: "my-page",
    status: "draft",
    meta_description: "...",
    meta_keywords: "...",
  });

  return (
    <div className="flex gap-6">
      <PageSettingsSidebar
        title="Page Settings"
        pageData={pageData}
        onSettingsChange={(updates) =>
          setPageData((prev) => ({ ...prev, ...updates }))
        }
        showAdvanced
        customFields={
          <div className="space-y-4">{/* Your custom fields */}</div>
        }
      />
      {/* Main content */}
    </div>
  );
}
```

### Using Error Boundary

```typescript
import { WithBuilderErrorBoundary } from "@/components/page-builder/components";

function MyPageBuilder() {
  return (
    <WithBuilderErrorBoundary
      onError={(error, errorInfo) => {
        console.error("Builder error:", error);
        // Send to error tracking service
      }}
    >
      <BuilderCanvas {...props} />
    </WithBuilderErrorBoundary>
  );
}
```

---

## 🎯 Using Hooks Independently

### Use Case: Custom Page with Different UI

```typescript
import {
  usePageBuilder,
  useBuilderDataLoader,
  useBuilderInteraction,
} from "@/hooks";

export function CustomPageBuilderUI() {
  // Get page state and actions
  const [pageState, pageActions] = usePageBuilder({
    pageType: "custom",
  });

  // Get data loading state
  const [dataState, dataActions] = useBuilderDataLoader();

  // Get interaction state
  const [interactionState, interactionActions] = useBuilderInteraction();

  return (
    <div>
      {/* Left Panel: Settings */}
      <div className="w-80">
        <h2>Settings</h2>
        <input
          value={pageState.pageData.title}
          onChange={(e) =>
            pageActions.updatePageData({ title: e.target.value })
          }
        />
        <button onClick={pageActions.savePageLayout}>Save</button>
      </div>

      {/* Right Panel: Canvas */}
      <div className="flex-1">
        <h2>Canvas</h2>
        {pageState.sections.map((section) => (
          <div key={section.id}>
            <h3>{section.name}</h3>
            <button onClick={() => pageActions.deleteSection(section.id)}>
              Delete
            </button>
          </div>
        ))}
        <button onClick={pageActions.addSection}>Add Section</button>
      </div>

      {/* Modal: Add Module */}
      {interactionState.moduleLibraryState.isOpen && (
        <ModuleLibrary
          isOpen
          onClose={interactionActions.closeModuleLibrary}
          onSelectModule={(module) => {
            // Handle module selection
          }}
        />
      )}
    </div>
  );
}
```

---

## 📊 File Structure After Migration

```
components/page-builder/
├── builder-canvas.tsx (original - deprecated)
├── builder-canvas-refactored.tsx (new - use this)
├── components/
│   ├── form-fields.tsx (reusable inputs)
│   ├── page-settings-sidebar.tsx (settings panel)
│   ├── builder-header-component.tsx (header)
│   ├── section-renderer.tsx (section rendering)
│   ├── builder-error-boundary.tsx (error handling)
│   └── index.ts (exports)
├── section-area.tsx
├── module-library.tsx
└── ...

hooks/
├── use-page-builder.ts (page state & operations)
├── use-builder-data-loader.ts (data loading)
├── use-builder-interaction.ts (interactions)
└── ...

lib/page-builder/
├── layout-service.ts (layout operations)
├── helpers.ts
├── constants.ts
└── ...

app/(tenant)/admin/page-builder/
├── layout/
│   └── page.tsx (landing page - no changes needed)
└── custom/
    └── page.tsx (custom page - use new components)
```

---

## ✅ Migration Checklist

### Phase 1: Setup (Day 1)

- [ ] Review `BUILDER_CANVAS_REFACTORING.md`
- [ ] Review `REFACTORING_SUMMARY.md`
- [ ] Install/update dependencies (none added)
- [ ] Verify no import errors

### Phase 2: Test Landing Page (Day 2)

- [ ] Switch landing page to use refactored builder (if testing)
- [ ] Test all builder features (add section, add module, save)
- [ ] Test page settings updates
- [ ] Verify save works correctly

### Phase 3: Update Custom Page (Day 3-4)

- [ ] Refactor custom page builder to use new components
- [ ] Replace duplicate form fields with reusable components
- [ ] Add error boundary
- [ ] Test all CRUD operations

### Phase 4: Cleanup (Day 5)

- [ ] Remove duplicate code
- [ ] Add unit tests for hooks (optional)
- [ ] Add Storybook stories (optional)
- [ ] Deploy and monitor

---

## 🔄 Incremental Migration Strategy

If you want to migrate gradually without breaking existing code:

### Step 1: Keep Old Builder as Fallback

```typescript
// config/features.ts
export const USE_NEW_BUILDER =
  process.env.NEXT_PUBLIC_USE_NEW_BUILDER === "true";

// app/(tenant)/admin/page-builder/layout/page.tsx
import { BuilderCanvas as OldBuilder } from "@/components/page-builder/builder-canvas";
import { BuilderCanvas as NewBuilder } from "@/components/page-builder/builder-canvas-refactored";

const Builder = USE_NEW_BUILDER ? NewBuilder : OldBuilder;
```

### Step 2: Use Feature Flag

```typescript
// .env.local
NEXT_PUBLIC_USE_NEW_BUILDER = false; // true to enable new builder
```

### Step 3: Test with New Builder First

```typescript
// Test new builder with landing page first
// Once stable, move to custom pages
```

---

## 🐛 Troubleshooting

### Issue: "usePageBuilder returns undefined"

**Solution:** Ensure it's in a client component (`"use client"` at top)

### Issue: Layout not updating after save

**Solution:** Check that `setSections` is being called properly in `usePageBuilder`

### Issue: Forms not showing values

**Solution:** Verify `pageData` is being passed and state is initialized

### Issue: Type errors with Section/Row/Column

**Solution:** Import types from `@/types` not from individual hooks

---

## 📈 Benefits After Migration

| Aspect               | Before            | After                     |
| -------------------- | ----------------- | ------------------------- |
| **Code Reuse**       | 0% (copy-paste)   | 100% (components & hooks) |
| **Testing**          | Hard (monolithic) | Easy (isolated hooks)     |
| **Debugging**        | Difficult         | Straightforward           |
| **Extension**        | Modify huge files | Add new hook/component    |
| **Maintenance**      | High effort       | Low effort                |
| **Code Duplication** | Significant       | None                      |

---

## 📞 Support

For questions or issues:

1. Check `BUILDER_CANVAS_REFACTORING.md` for architectural details
2. Check individual hook files for JSDoc documentation
3. Review component prop interfaces for usage
4. Look at integration examples in this guide

---

**Last Updated:** November 13, 2025
**Status:** Ready for gradual migration
