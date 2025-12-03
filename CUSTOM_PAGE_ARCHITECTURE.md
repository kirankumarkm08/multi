# Custom Page Builder - Architecture Diagram

## 🏗️ Component Hierarchy

```
CustomPageBuilder (Main Orchestrator - 52 lines)
│
├─ useCustomPageBuilder Hook (125 lines)
│  ├─ state: page, pageId, initialPageData, isLoading, isDeleting
│  └─ functions: loadPage, loadPageFromUrl, deletePage, handleSettingsChange
│
├─ PageLoadingSkeleton (conditional render)
│  └─ Shows while isLoading = true
│
└─ WithBuilderErrorBoundary (error handling wrapper)
   │
   ├─ PageHeader Component (34 lines)
   │  ├─ Props: page, isDeleting, onDelete
   │  ├─ Displays: title, status, delete button
   │  └─ Events: onClick → onDelete → deletePage()
   │
   └─ Main Content Layout (flex-row)
      │
      ├─ PageSidebar Component (45 lines)
      │  ├─ Props: page, onSettingsChange
      │  ├─ Wraps: PageSettingsSidebar
      │  ├─ Maps: custom fields → sidebar fields
      │  └─ Events: onChange → onSettingsChange → handleSettingsChange()
      │
      └─ PageBuilderContent Component (40 lines)
         ├─ Props: pageId, initialPageData, page, onPageSettingsChange
         ├─ Wraps: BuilderCanvas
         └─ Events: onPageSettingsChange → updates propagated back
```

---

## 🔄 Data Flow

### Initial Load

```
User visits /custom-page-builder
    ↓
CustomPageBuilder mounts
    ↓
useEffect calls loadPageFromUrl(token)
    ↓
Hook parses URL for page ID
    ↓
loadPage(id) called
    ↓
API fetch: GET /tenant/pages/:id
    ↓
parseJsonField (helpers) parses settings/metadata
    ↓
buildPageData (helpers) creates PageData structure
    ↓
convertApiResponseToPageData (helpers) converts to UI state
    ↓
setPage, setPageId, setInitialPageData updated
    ↓
isLoading = false
    ↓
Component renders with data
    ↓
PageHeader, PageSidebar, PageBuilderContent displayed
```

### Settings Update

```
User changes page title in sidebar
    ↓
PageSidebar onChange fires
    ↓
onSettingsChange called with { title: 'New Title' }
    ↓
PageSidebar maps field: { title: 'New Title' }
    ↓
handleSettingsChange called from hook
    ↓
setPage({ ...prev, title: 'New Title' })
    ↓
page state updated
    ↓
Components re-render with new title
    ↓
PageHeader displays new title
    ↓
PageSidebar input shows new title
```

### Page Deletion

```
User clicks Delete button
    ↓
Confirmation dialog appears
    ↓
User confirms deletion
    ↓
deletePage() from hook called
    ↓
isDeleting = true
    ↓
API call: DELETE /tenant/pages/:id
    ↓
Success: page cleared, URL updated
    ↓
isDeleting = false
    ↓
Toast success message shown
```

---

## 📦 State Management

```typescript
Hook State:
{
  page: {
    id, name, slug, title, description,
    metaKeyword, metaDescription,
    status, show_in_nav,
    settings: { headerStyle, footerStyle, ... }
  },
  pageId: number | undefined,
  initialPageData: PageData | null,
  isLoading: boolean,
  isDeleting: boolean
}
```

---

## 🎯 Prop Drilling

```
CustomPageBuilder
│
├─ page ─────────────────────────┬─────────────────────┐
│                                 │                     │
│                          PageHeader            PageSidebar
│                          (reads title,     (reads all fields,
│                           name, status)     modifies any)
│
├─ onSettingsChange ─────────────┬─────────────────────┐
│   (handleSettingsChange)        │                     │
│                          PageHeader            PageSidebar
│                          (passes to         (receives, calls
│                           deletePage)        on change)
│
└─ pageId, initialPageData ──────────────────────────────┐
   (state)                                               │
                                              PageBuilderContent
                                              (receives both)
```

---

## 📊 File Dependencies

```
page-new.tsx (MAIN)
│
├─ useCustomPageBuilder (hook)
│  │
│  ├─ @/types/custom-page (types)
│  │
│  ├─ @/constants/page-builder (constants)
│  │  └─ Errors, success messages, defaults
│  │
│  ├─ @/lib/api-config (API)
│  │
│  └─ @/lib/page-builder/custom-page-helpers (utils)
│     ├─ parseJsonField()
│     ├─ buildPageData()
│     └─ convertApiResponseToPageData()
│
├─ PageHeader (component)
│  ├─ @/types/custom-page
│  └─ lucide-react (icons)
│
├─ PageSidebar (component)
│  ├─ @/types/custom-page
│  ├─ @/components/page-builder/components/page-settings-sidebar
│  └─ PageSettingsSidebar (existing component)
│
├─ PageBuilderContent (component)
│  ├─ @/types/custom-page
│  └─ @/components/page-builder/builder-canvas-refactored
│
├─ PageLoadingSkeleton (component)
│  └─ lucide-react (icons)
│
└─ WithBuilderErrorBoundary (wrapper)
   └─ @/components/page-builder/components/builder-error-boundary
```

---

## 🔀 Component Communication

```
                    CustomPageBuilder
                    (State Owner)
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
    PageHeader        PageSidebar    PageBuilderContent
        │                 │                 │
    Receives:          Receives:       Receives:
    - page              - page          - pageId
    - isDeleting        - page          - initialPageData
    - onDelete()        - onChange()    - page
                                        - onPageSettingsChange()
        │                 │                 │
        └─────────→ Calls ←─────────────────┘
                │
        handleSettingsChange()
                │
        Updates page state
                │
        Re-render all components
```

---

## 🎯 Responsibilities

```
CustomPageBuilder (52 lines)
└─ Orchestration only
   ├─ Compose components
   ├─ Pass props
   └─ Handle lifecycle (useEffect)

useCustomPageBuilder Hook (125 lines)
├─ State management
├─ API calls
├─ Data transformation
└─ Business logic

PageHeader (34 lines)
├─ Render title & status
├─ Render delete button
└─ Call delete callback

PageSidebar (45 lines)
├─ Render settings form
├─ Map field names
└─ Call update callback

PageBuilderContent (40 lines)
├─ Render canvas
├─ Map props
└─ Call settings callback

PageLoadingSkeleton (14 lines)
├─ Render loading UI
└─ Show spinner

Helpers (120 lines)
├─ parseJsonField()
├─ buildPageData()
└─ convertApiResponseToPageData()
```

---

## 🔐 Type Safety

```typescript
// Complete type chain
CustomPageData
    ↓
PageHeaderProps extends { page: CustomPageData, ... }
PageSidebarProps extends { page: CustomPageData, ... }
PageBuilderContentProps extends { page: CustomPageData, ... }
    ↓
All props fully typed ✅
All returns fully typed ✅
Hook return type extends UseCustomPageBuilderReturn ✅
```

---

## 🚀 Component Lifecycle

```
Component Mount
    ↓
useCustomPageBuilder initialized
    ↓
useEffect dependency: [token, loadPageFromUrl]
    ↓
loadPageFromUrl(token) called
    ↓
Parse URL for page ID
    ↓
If ID exists:
  ├─ setPageId(id)
  └─ loadPage(id)
    ├─ setIsLoading(true)
    ├─ API fetch
    ├─ Parse response
    ├─ setPage, setInitialPageData
    └─ setIsLoading(false)
    ↓
Render phase 1: if loading → <PageLoadingSkeleton />
    ↓
Render phase 2: if not loading → Full UI
    ↓
User interactions
    ├─ Change settings → handleSettingsChange
    ├─ Delete page → deletePage
    └─ Canvas actions → onPageSettingsChange
    ↓
State updates
    ├─ setPage (local)
    ├─ API updates (remote)
    └─ Re-render
    ↓
Component Unmount
    └─ Cleanup (none needed currently)
```

---

## 🎨 Render Conditions

```
                CustomPageBuilder
                        │
                        ├─ isLoading? YES
                        │  └─ Return PageLoadingSkeleton
                        │
                        └─ isLoading? NO
                           └─ Return Full UI
                              │
                              ├─ PageHeader
                              ├─ PageSidebar
                              └─ PageBuilderContent
```

---

## 🧪 Testing Strategy

```
Hook Testing
├─ Test loadPage() with mock API
├─ Test loadPageFromUrl() URL parsing
├─ Test handleSettingsChange() state update
└─ Test deletePage() confirmation & API

Component Testing
├─ PageHeader receives props correctly
├─ PageSidebar fires onChange
├─ PageBuilderContent passes through
├─ PageLoadingSkeleton renders when needed
└─ Error boundary catches errors

Integration Testing
├─ Full flow: load → edit → save
├─ Delete confirmation flow
├─ Loading state transitions
└─ Error state handling
```

---

**Status:** ✅ Architecture Complete and Documented  
**Complexity:** Low (single responsibility per file)  
**Maintainability:** High (clear structure)  
**Testability:** High (separated concerns)
