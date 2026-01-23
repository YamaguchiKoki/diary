# Hook Extraction Patterns

This document provides detailed guidance on extracting custom hooks from complex React components.

## When to Extract Hooks

Extract a custom hook when you identify:

1. **Coupled state groups** - Multiple `useState` hooks that are always used together
2. **Complex effects** - `useEffect` with multiple dependencies or cleanup logic
3. **Business logic** - Data transformations, validations, or calculations
4. **Reusable patterns** - Logic that appears in multiple components

## Extraction Process

### Step 1: Identify State Groups

Look for state variables that are logically related:

```typescript
// ❌ These belong together - extract to hook
const [config, setConfig] = useState<Config>(...)
const [params, setParams] = useState<FormValue>({})
const [modeType, setModeType] = useState<ModeType>(...)

// These are config-related state that should be in useConfig()
```

### Step 2: Identify Related Effects

Find effects that modify the grouped state:

```typescript
// ❌ These effects belong with the state above
useEffect(() => {
  if (hasFetchedDetail && !modeType) {
    const mode = currModel?.properties.mode
    if (mode) {
      const newConfig = produce(config, (draft) => {
        draft.mode = mode
      })
      setConfig(newConfig)
    }
  }
}, [modelList, hasFetchedDetail, modeType, currModel])
```

### Step 3: Create the Hook

```typescript
// hooks/use-config.ts
import { produce } from 'immer'
import { useEffect, useState } from 'react'

interface UseConfigParams {
  initialConfig?: Partial<Config>
  currModel?: { properties?: { mode?: ModeType } }
  hasFetchedDetail: boolean
}

interface UseConfigReturn {
  config: Config
  setConfig: (config: Config) => void
  params: FormValue
  setParams: (params: FormValue) => void
  modeType: ModeType
}

export const useConfig = ({
  initialConfig,
  currModel,
  hasFetchedDetail,
}: UseConfigParams): UseConfigReturn => {
  const [config, setConfig] = useState<Config>({
    provider: 'default-provider',
    modelId: 'default-model',
    mode: ModeType.unset,
    ...initialConfig,
  })
  
  const [params, setParams] = useState<FormValue>({})
  
  const modeType = config.mode

  // Fill old data missing model mode
  useEffect(() => {
    if (hasFetchedDetail && !modeType) {
      const mode = currModel?.properties?.mode
      if (mode) {
        setConfig(produce(config, (draft) => {
          draft.mode = mode
        }))
      }
    }
  }, [hasFetchedDetail, modeType, currModel])

  return {
    config,
    setConfig,
    params,
    setParams,
    modeType,
  }
}
```

### Step 4: Update Component

```typescript
// Before: 50+ lines of state management
const Settings: FC = () => {
  const [config, setConfig] = useState<Config>(...)
  // ... lots of related state and effects
}

// After: Clean component
const Settings: FC = () => {
  const {
    config,
    setConfig,
    params,
    setParams,
    modeType,
  } = useConfig({
    currModel,
    hasFetchedDetail,
  })
  
  // Component now focuses on UI
}
```

## Naming Conventions

### Hook Names

- Use `use` prefix: `useConfig`, `useDataset`
- Be specific: `useAdvancedPromptConfig` not `usePrompt`
- Include domain: `useWorkflowVariables`, `useServerStatus`

### File Names

- Kebab-case: `use-config.ts`
- Place in `hooks/` subdirectory when multiple hooks exist
- Place alongside component for single-use hooks

### Return Type Names

- Suffix with `Return`: `UseConfigReturn`
- Suffix params with `Params`: `UseConfigParams`

## Common Hook Patterns

### 1. Data Fetching Hook (React Query)

```typescript
// Pattern: Use @tanstack/react-query for data fetching
import { useQuery, useQueryClient } from '@tanstack/react-query'

const NAMESPACE = 'appConfig'

// Query keys for cache management
export const appConfigQueryKeys = {
  detail: (appId: string) => [NAMESPACE, 'detail', appId] as const,
  list: () => [NAMESPACE, 'list'] as const,
}

// Main data hook
export const useAppConfig = (appId: string) => {
  return useQuery({
    enabled: !!appId,
    queryKey: appConfigQueryKeys.detail(appId),
    queryFn: () => fetchAppConfig(appId),
    select: data => data?.config || null,
  })
}

// Invalidation hook for refreshing data
export const useInvalidateAppConfig = () => {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: [NAMESPACE] })
}

// Usage in component
const Component = () => {
  const { data: config, isLoading, error, refetch } = useAppConfig(appId)
  const invalidateAppConfig = useInvalidateAppConfig()
  
  const handleRefresh = () => {
    invalidateAppConfig() // Invalidates cache and triggers refetch
  }
  
  return <div>...</div>
}
```

### 2. Form State Hook

```typescript
// Pattern: Form state + validation + submission
interface FormValues {
  name: string
  description: string
}

export const useForm = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const validate = useCallback((validators: Record<keyof T, (val: any) => string | null>) => {
    const newErrors: Partial<Record<keyof T, string>> = {}
    for (const [key, validator] of Object.entries(validators)) {
      const error = validator(values[key as keyof T])
      if (error) newErrors[key as keyof T] = error
    }
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [values])

  const handleChange = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }))
  }, [])

  const handleSubmit = useCallback(async (
    onSubmit: (values: T) => Promise<void>,
    validators?: Record<keyof T, (val: any) => string | null>
  ) => {
    if (validators && !validate(validators)) return
    setIsSubmitting(true)
    try {
      await onSubmit(values)
    } finally {
      setIsSubmitting(false)
    }
  }, [values, validate])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return { values, errors, isSubmitting, handleChange, handleSubmit, reset }
}
```

### 3. Modal State Hook

```typescript
// Pattern: Multiple modal management
type ModalType = 'edit' | 'delete' | 'duplicate' | null

export const useModalState = <T extends string>() => {
  const [activeModal, setActiveModal] = useState<T | null>(null)
  const [modalData, setModalData] = useState<any>(null)

  const openModal = useCallback((type: T, data?: any) => {
    setActiveModal(type)
    setModalData(data)
  }, [])

  const closeModal = useCallback(() => {
    setActiveModal(null)
    setModalData(null)
  }, [])

  const isOpen = useCallback((type: T) => activeModal === type, [activeModal])

  return {
    activeModal,
    modalData,
    openModal,
    closeModal,
    isOpen,
  }
}

// Usage
type MyModals = 'edit' | 'delete' | 'export'
const { activeModal, openModal, closeModal, isOpen } = useModalState<MyModals>()
```

### 4. Toggle/Boolean Hook

```typescript
// Pattern: Boolean state with convenience methods
export const useToggle = (initialValue = false) => {
  const [value, setValue] = useState(initialValue)

  const toggle = useCallback(() => setValue(v => !v), [])
  const setTrue = useCallback(() => setValue(true), [])
  const setFalse = useCallback(() => setValue(false), [])

  return [value, { toggle, setTrue, setFalse, set: setValue }] as const
}

// Usage
const [isExpanded, { toggle, setTrue: expand, setFalse: collapse }] = useToggle()
```

### 5. Async Operation Hook

```typescript
// Pattern: Async operation with loading/error states
export const useAsync = <T, Args extends any[]>(
  asyncFn: (...args: Args) => Promise<T>
) => {
  const [state, setState] = useState<{
    loading: boolean
    error: Error | null
    data: T | null
  }>({
    loading: false,
    error: null,
    data: null,
  })

  const execute = useCallback(async (...args: Args) => {
    setState({ loading: true, error: null, data: null })
    try {
      const data = await asyncFn(...args)
      setState({ loading: false, error: null, data })
      return data
    } catch (error) {
      setState({ loading: false, error: error as Error, data: null })
      throw error
    }
  }, [asyncFn])

  return { ...state, execute }
}

// Usage
const { loading, error, data, execute } = useAsync(fetchUserData)
```

### 6. Debounced Value Hook

```typescript
// Pattern: Debounce value changes
export const useDebouncedValue = <T>(value: T, delay: number = 300) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

// Usage
const [searchQuery, setSearchQuery] = useState('')
const debouncedQuery = useDebouncedValue(searchQuery, 500)

useEffect(() => {
  if (debouncedQuery) {
    searchAPI(debouncedQuery)
  }
}, [debouncedQuery])
```

### 7. Previous Value Hook

```typescript
// Pattern: Track previous value
export const usePrevious = <T>(value: T): T | undefined => {
  const ref = useRef<T>()
  
  useEffect(() => {
    ref.current = value
  }, [value])
  
  return ref.current
}

// Usage
const prevCount = usePrevious(count)
if (prevCount !== undefined && count > prevCount) {
  console.log('Count increased!')
}
```

## Testing Extracted Hooks

After extraction, test hooks in isolation:

```typescript
// use-config.spec.ts
import { renderHook, act } from '@testing-library/react'
import { useConfig } from './use-config'

describe('useConfig', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useConfig({
      hasFetchedDetail: false,
    }))

    expect(result.current.config.provider).toBe('default-provider')
    expect(result.current.modeType).toBe(ModeType.unset)
  })

  it('should update config', () => {
    const { result } = renderHook(() => useConfig({
      hasFetchedDetail: true,
    }))

    act(() => {
      result.current.setConfig({
        ...result.current.config,
        modelId: 'new-model',
      })
    })

    expect(result.current.config.modelId).toBe('new-model')
  })
})
```

## Hook Extraction Checklist

Before extraction:
- [ ] Multiple related `useState` calls?
- [ ] Complex `useEffect` logic?
- [ ] Business logic mixed with UI?
- [ ] Same pattern used elsewhere?

After extraction:
- [ ] Hook has single responsibility?
- [ ] Clear input/output interface?
- [ ] Proper TypeScript types?
- [ ] Unit tests added?
- [ ] Component is cleaner?
