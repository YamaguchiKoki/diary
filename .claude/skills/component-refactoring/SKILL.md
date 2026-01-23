---
name: react-refactoring
description: Refactor high-complexity React components. Use when components have complexity > 50, lineCount > 300, deeply nested logic, or mixed concerns. Use for code splitting, hook extraction, or complexity reduction. Avoid for simple/well-structured components or third-party wrappers.
---

# React Component Refactoring Skill

## Reference Documents

For detailed patterns, see:
- `reference/complexity-reduction.md` - Patterns for reducing cognitive complexity
- `reference/component-splitting.md` - Strategies for splitting large components
- `reference/hook-extraction.md` - Guidance on extracting custom hooks

Refactor high-complexity React components with proven patterns and workflow.

> **Complexity Threshold**: Components with complexity > 50 or lineCount > 300 should be refactored before adding new features or tests.

## Complexity Score Interpretation

| Score | Level | Action |
|-------|-------|--------|
| 0-25 | 🟢 Simple | Ready for features/testing |
| 26-50 | 🟡 Medium | Consider minor refactoring |
| 51-75 | 🟠 Complex | **Refactor before continuing** |
| 76-100 | 🔴 Very Complex | **Must refactor** |

## Core Refactoring Patterns

### Pattern 1: Extract Custom Hooks

**When**: Component has complex state management, multiple `useState`/`useEffect`, or business logic mixed with UI.

**Convention**: Place hooks in a `hooks/` subdirectory or alongside the component as `use-<feature>.ts`.

```typescript
// ❌ Before: Complex state logic in component
const Settings: FC = () => {
  const [config, setConfig] = useState<Config>(...)
  const [preferences, setPreferences] = useState<Preferences>(...)
  const [validation, setValidation] = useState<ValidationState>({})
  
  // 50+ lines of state management logic...
  
  return <div>...</div>
}

// ✅ After: Extract to custom hook
// hooks/use-settings.ts
export const useSettings = (userId: string) => {
  const [config, setConfig] = useState<Config>(...)
  const [validation, setValidation] = useState<ValidationState>({})
  
  // Related state management logic here
  
  return { config, setConfig, validation, isValid }
}

// Component becomes cleaner
const Settings: FC = () => {
  const { config, setConfig, isValid } = useSettings(userId)
  return <div>...</div>
}
```

### Pattern 2: Extract Sub-Components

**When**: Single component has multiple UI sections, conditional rendering blocks, or repeated patterns.

**Convention**: Place sub-components in subdirectories or as separate files in the same directory.

```typescript
// ❌ Before: Monolithic JSX with multiple sections
const Dashboard = () => {
  return (
    <div>
      {/* 100 lines of header UI */}
      {/* 100 lines of content UI */}
      {/* 100 lines of modals */}
    </div>
  )
}

// ✅ After: Split into focused components
// dashboard/
//   ├── index.tsx           (orchestration only)
//   ├── dashboard-header.tsx
//   ├── dashboard-content.tsx
//   └── dashboard-modals.tsx

const Dashboard = () => {
  const { activeModal, openModal, closeModal } = useDashboardModals()
  
  return (
    <div>
      <DashboardHeader onAction={handleAction} />
      <DashboardContent data={data} />
      <DashboardModals active={activeModal} onClose={closeModal} />
    </div>
  )
}
```

### Pattern 3: Simplify Conditional Logic

**When**: Deep nesting (> 3 levels), complex ternaries, or multiple `if/else` chains.

```typescript
// ❌ Before: Deeply nested conditionals
const Template = useMemo(() => {
  if (type === 'chat') {
    switch (locale) {
      case 'zh':
        return <TemplateChatZh />
      case 'ja':
        return <TemplateChatJa />
      default:
        return <TemplateChatEn />
    }
  }
  if (type === 'advanced') {
    // Another 15 lines...
  }
  // More conditions...
}, [type, locale])

// ✅ After: Use lookup tables + early returns
const TEMPLATE_MAP = {
  chat: {
    zh: TemplateChatZh,
    ja: TemplateChatJa,
    default: TemplateChatEn,
  },
  advanced: {
    zh: TemplateAdvancedZh,
    // ...
  },
}

const Template = useMemo(() => {
  const templates = TEMPLATE_MAP[type]
  if (!templates) return null
  
  const TemplateComponent = templates[locale] || templates.default
  return <TemplateComponent />
}, [type, locale])
```

### Pattern 4: Extract API/Data Logic

**When**: Component directly handles API calls, data transformation, or complex async operations.

**Convention**: Use `@tanstack/react-query` hooks or create custom data hooks.

```typescript
// ❌ Before: API logic in component
const UserCard = () => {
  const [user, setUser] = useState({})
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    (async () => {
      setLoading(true)
      const res = await fetchUser(userId)
      setUser(res)
      setLoading(false)
    })()
  }, [userId])
  
  // More API-related logic...
}

// ✅ After: Extract to data hook using React Query
// hooks/use-user.ts
import { useQuery } from '@tanstack/react-query'

export const useUser = (userId: string) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    enabled: !!userId,
  })
}

// Component becomes cleaner
const UserCard = () => {
  const { data: user, isLoading } = useUser(userId)
  // UI only
}
```

**React Query Best Practices**:
- Use consistent `queryKey` naming
- Use `enabled` option for conditional fetching
- Use `select` for data transformation
- Create `useInvalidate*` hooks for cache invalidation

### Pattern 5: Extract Modal/Dialog Management

**When**: Component manages multiple modals with complex open/close states.

```typescript
// ❌ Before: Multiple modal states in component
const Settings = () => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  // 5+ more modal states...
}

// ✅ After: Extract to modal management hook
type ModalType = 'edit' | 'delete' | 'confirm' | 'export' | null

const useModals = () => {
  const [activeModal, setActiveModal] = useState<ModalType>(null)
  
  const openModal = useCallback((type: ModalType) => setActiveModal(type), [])
  const closeModal = useCallback(() => setActiveModal(null), [])
  
  return {
    activeModal,
    openModal,
    closeModal,
    isOpen: (type: ModalType) => activeModal === type,
  }
}
```

### Pattern 6: Extract Form Logic

**When**: Complex form validation, submission handling, or field transformation.

**Convention**: Use form libraries like `react-hook-form` or `@tanstack/react-form`.

```typescript
// ✅ Use form library
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

const ConfigForm = () => {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '' },
  })
  
  return <form onSubmit={form.handleSubmit(onSubmit)}>...</form>
}
```

## Advanced Patterns

### Context Provider Extraction

**When**: Component provides complex context values with multiple states.

```typescript
// ❌ Before: Large context value object
const value = {
  user, settings, preferences, theme,
  isLoading, error, notifications,
  // 20+ more properties...
}
return <AppContext.Provider value={value}>...</AppContext.Provider>

// ✅ After: Split into domain-specific contexts
<UserProvider value={userValue}>
  <SettingsProvider value={settingsValue}>
    <UIProvider value={uiValue}>
      {children}
    </UIProvider>
  </SettingsProvider>
</UserProvider>
```

### Event Handler Extraction

**When**: Component has many inline event handlers or complex handler logic.

```typescript
// ❌ Before: Inline handlers
<Button onClick={() => {
  setLoading(true)
  await api.save(data)
  setLoading(false)
  toast.success('Saved!')
  router.push('/dashboard')
}} />

// ✅ After: Extract to hook
const useFormHandlers = (data: FormData) => {
  const handleSave = useCallback(async () => {
    setLoading(true)
    await api.save(data)
    setLoading(false)
    toast.success('Saved!')
    router.push('/dashboard')
  }, [data])
  
  return { handleSave }
}
```

## Refactoring Workflow

### Step 1: Analyze

Identify complexity indicators:
- Total line count (target < 300)
- Number of useState/useEffect hooks
- Nesting depth of conditionals
- Number of responsibilities

### Step 2: Plan

Create a refactoring plan based on detected issues:

| Issue | Refactoring Action |
|-------|-------------------|
| Multiple `useState` + `useEffect` | Extract custom hook |
| API calls in component | Extract data/service hook |
| Many event handlers | Extract handlers to hook |
| Line count > 300 | Split into sub-components |
| Deep conditional nesting | Use lookup tables |
| Multiple modal states | Extract modal management |

### Step 3: Execute Incrementally

1. **Extract one piece at a time**
2. **Run lint, type-check, and tests after each extraction**
3. **Verify functionality before next step**

```
For each extraction:
  ┌────────────────────────────────────────┐
  │ 1. Extract code                        │
  │ 2. Run: npm run lint                   │
  │ 3. Run: npm run type-check             │
  │ 4. Run: npm run test                   │
  │ 5. Test functionality manually         │
  │ 6. PASS? → Next extraction             │
  │    FAIL? → Fix before continuing       │
  └────────────────────────────────────────┘
```

### Step 4: Verify

After refactoring, verify improvements:
- Line count reduced
- Single responsibility per file
- Clear separation of concerns
- Easier to test individual pieces

## Common Mistakes to Avoid

### ❌ Over-Engineering

```typescript
// ❌ Too many tiny hooks
const useButtonText = () => useState('Click')
const useButtonDisabled = () => useState(false)

// ✅ Cohesive hook with related state
const useButtonState = () => {
  const [text, setText] = useState('Click')
  const [disabled, setDisabled] = useState(false)
  return { text, setText, disabled, setDisabled }
}
```

### ❌ Breaking Existing Patterns

- Follow existing directory structures in your project
- Maintain naming conventions
- Preserve export patterns for compatibility

### ❌ Premature Abstraction

- Only extract when there's clear complexity benefit
- Don't create abstractions for single-use code
- Keep refactored code in the same domain area

### ❌ Losing Colocation

```typescript
// ❌ Extracting to distant locations
src/hooks/use-user-card.ts  // Far from component
src/components/user-card.tsx

// ✅ Keep related code together
src/components/user-card/
  ├── index.tsx
  ├── use-user-card.ts      // Colocated
  └── user-card.types.ts
```

## Directory Structure Recommendations

```
components/
  └── feature-name/
      ├── index.tsx              # Main component (orchestration)
      ├── feature-name.tsx       # Primary UI
      ├── feature-name.types.ts  # Type definitions
      ├── hooks/
      │   ├── use-feature-state.ts
      │   └── use-feature-data.ts
      ├── components/
      │   ├── sub-component-a.tsx
      │   └── sub-component-b.tsx
      └── utils/
          └── helpers.ts
```

## Quick Checklist

Before refactoring:
- [ ] Component > 300 lines?
- [ ] More than 5 useState hooks?
- [ ] More than 3 useEffect hooks?
- [ ] Conditional nesting > 3 levels?
- [ ] Multiple unrelated responsibilities?
- [ ] API calls mixed with UI logic?

After refactoring:
- [ ] Each file < 200 lines?
- [ ] Single responsibility per file?
- [ ] Hooks are reusable?
- [ ] Logic separated from UI?
- [ ] Tests pass?
- [ ] No regression in functionality?
