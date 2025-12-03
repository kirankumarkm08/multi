# BuilderCanvas Refactoring Guide

## 📚 Overview

The `BuilderCanvas` component has been refactored for better maintainability, reusability, and debuggability. The new architecture separates concerns using composable hooks and smaller components.

## 🏗️ New Architecture

### Core Layers

```
BuilderCanvas (Orchestrator)
├── usePageBuilder (State & Page Operations)
├── useBuilderDataLoader (Blocks & Forms Loading)
├── useBuilderInteraction (Drag & Drop, Modals)
└── Components
    ├── BuilderHeaderComponent
    ├── SectionRenderer
    ├── ModuleLibrary
    ├── BlocksPopup
    └── StatusMessages
```

## 🎣 Hooks

### 1. `usePageBuilder`

**Location:** `hooks/use-page-builder.ts`

**Responsibilities:**

- Page data state management
- Page loading (from API or initialPageData)
- Page saving
- Section management
- Selection state

**Returns:** `[PageBuilderState, PageBuilderActions]`

**Usage:**

```typescript
const [state, actions] = usePageBuilder({
  pageId: 123,
  pageType: "custom",
  initialPageData: undefined,
  onSaveSuccess: (payload) => console.log("Saved"),
  onSaveError: (error) => console.error(error),
});

// State
console.log(state.pageData);
console.log(state.sections);
console.log(state.isLoading);

// Actions
actions.savePageLayout();
actions.addSection();
actions.deleteSection(sectionId);
```

### 2. `useBuilderDataLoader`

**Location:** `hooks/use-builder-data-loader.ts`

**Responsibilities:**

- Load available blocks
- Load available forms
- Error handling for data loading
- Filter published items only

**Returns:** `[DataLoaderState, DataLoaderActions]`

**Usage:**

```typescript
const [state, actions] = useBuilderDataLoader();

await actions.loadAvailableBlocks();
await actions.loadAvailableForms();

console.log(state.availableBlocks);
console.log(state.availableForms);
console.log(state.loadError);
```

### 3. `useBuilderInteraction`

**Location:** `hooks/use-builder-interaction.ts`

**Responsibilities:**

- Manage drag & drop state
- Handle module library modal
- Handle blocks popup modal
- Process drag start/end events

**Returns:** `[BuilderInteractionState, BuilderInteractionActions]`

**Usage:**

```typescript
const [state, actions] = useBuilderInteraction();

// Module Library
actions.openModuleLibrary(targetColumn);
actions.handleModuleSelect(module, addModuleToColumn);

// Blocks Popup
actions.openBlocksPopup(targetColumn);
actions.handleBlockSelect(block, addModuleToColumn);

// Drag & Drop
actions.handleDragStart(event);
actions.handleDragEnd(event, setSections);
```

## 🧩 Components

### BuilderHeaderComponent

**Location:** `components/page-builder/components/builder-header-component.tsx`

Displays the builder header with:

- Page title
- Page type badge
- Save button with loading state
- Success/error messages

**Props:**

```typescript
interface BuilderHeaderProps {
  pageType: string;
  pageTitle: string;
  isSaving: boolean;
  saveSuccess: boolean;
  saveError: string | null;
  onSave: () => void;
  onAddSection?: () => void;
}
```

### SectionRenderer

**Location:** `components/page-builder/components/section-renderer.tsx`

Renders a single section with all rows and modules. Acts as a wrapper around `SectionArea` with a clean prop interface.

## 🔄 Data Flow

### Loading Page Data

```
BuilderCanvas (mounts)
    ↓
usePageBuilder.loadPageData()
    ├─→ Check initialPageData
    ├─→ If yes, parse and set
    └─→ If no, fetch from API (if pageId exists)
    ↓
setPageData() & setSections()
    ↓
Render with loaded content
```

### Saving Page Data

```
User clicks Save
    ↓
pageBuilderActions.savePageLayout()
    ↓
Create payload from state
    ↓
pagesService.createPage() or updatePage()
    ↓
setSaveSuccess(true) + show toast
    ↓
Notify parent with onSaveSuccess callback
```

### Adding a Module

```
User clicks "Add Module"
    ↓
interactionActions.openModuleLibrary(targetColumn)
    ↓
Set moduleLibraryState with target info
    ↓
ModuleLibrary opens
    ↓
User selects module
    ↓
interactionActions.handleModuleSelect(module)
    ↓
Add module to column via addModuleToColumn
    ↓
Update sections state
```

## 🐛 Debugging Tips

### 1. **State Logging**

```typescript
// In BuilderCanvas or parent
useEffect(() => {
  console.log("Page Builder State:", pageBuilderState);
  console.log("Interaction State:", interactionState);
}, [pageBuilderState, interactionState]);
```

### 2. **Action Monitoring**

Wrap actions with logging:

```typescript
const debugSave = useCallback(async () => {
  console.log("Save started with sections:", pageBuilderState.sections);
  await pageBuilderActions.savePageLayout();
}, [pageBuilderState.sections, pageBuilderActions]);
```

### 3. **Hook Isolation**

Test each hook independently:

```typescript
// Test usePageBuilder hook
function TestPageBuilder() {
  const [state, actions] = usePageBuilder({
    pageId: 123,
  });

  return (
    <div>
      <p>Sections: {state.sections.length}</p>
      <button onClick={() => actions.addSection()}>Add</button>
    </div>
  );
}
```

## 🔧 Extending the Builder

### Adding a New Hook

1. Create hook file in `hooks/`
2. Define state and actions interfaces
3. Implement hook with useCallback for actions
4. Export from hooks
5. Use in BuilderCanvas

### Adding a New Component

1. Create component in `components/page-builder/components/`
2. Define props interface
3. Keep component focused on single responsibility
4. Use hooks for state management
5. Export and use in BuilderCanvas

### Example: Adding Custom Settings Panel

```typescript
// File: components/page-builder/components/settings-panel.tsx
import { BuilderCanvasState } from "@/hooks/use-page-builder";

export function SettingsPanel({
  pageData,
  onUpdate,
}: {
  pageData: any;
  onUpdate: (data: any) => void;
}) {
  return <div className="space-y-4">{/* Settings UI */}</div>;
}
```

## 📊 Performance Considerations

### Memoization

- `useMemo` is used for `sectionIds` and `dragOverlayContent`
- `useCallback` is used for all action handlers
- Prevents unnecessary re-renders of child components

### Lazy Loading

- Forms and blocks are loaded on component mount
- Page data is loaded asynchronously
- Status messages show loading states

### Debouncing

- Save operations are debounced (handled in service)
- Drag events are throttled by dnd-kit

## 🎯 Migration from Old BuilderCanvas

### Old Code

```typescript
export function BuilderCanvas(props) {
  const [sections, setSections] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([]);
  // 640 lines of logic...
}
```

### New Code

```typescript
export function BuilderCanvas(props) {
  const [pageBuilderState, pageBuilderActions] = usePageBuilder(props);
  const [dataLoaderState, dataLoaderActions] = useBuilderDataLoader();
  const [interactionState, interactionActions] = useBuilderInteraction();

  // Render with clean separation of concerns
}
```

## 📝 Best Practices

1. **Use hooks for side effects**: Always handle async operations in hooks
2. **Keep components pure**: No complex logic in render
3. **Prop drilling**: Consider context if passing props too deep
4. **Error boundaries**: Wrap BuilderCanvas in error boundary
5. **Storybook stories**: Create stories for each component for isolated testing

## 🚀 Future Improvements

- [ ] Extract section management into `useSectionManagement` hook
- [ ] Extract module management into `useModuleManagement` hook
- [ ] Create context for builder state (reduce prop drilling)
- [ ] Add undo/redo functionality
- [ ] Add keyboard shortcuts documentation
- [ ] Add unit tests for hooks
- [ ] Add E2E tests for workflows
- [ ] Create builder plugins system

## 📚 Related Files

- **Hooks:** `hooks/use-page-builder.ts`, `hooks/use-builder-data-loader.ts`, `hooks/use-builder-interaction.ts`
- **Components:** `components/page-builder/components/`
- **Services:** `services/pages.service.ts`, `services/blocks.service.ts`
- **Constants:** `lib/page-builder/constants.ts`
- **Types:** `types/index.ts`

## 🆘 Troubleshooting

### Issue: Sections not updating

**Solution:** Check that `setSections` is being called in the correct hook

### Issue: Modal not closing

**Solution:** Verify `closeModuleLibrary()` or `closeBlocksPopup()` is called after selection

### Issue: Save fails silently

**Solution:** Check error state in `pageBuilderState.saveError`

### Issue: Data not loading

**Solution:** Check `pageBuilderState.loadError` and network requests

## 📞 Questions?

Refer to individual hook files for detailed JSDoc comments and type definitions.
