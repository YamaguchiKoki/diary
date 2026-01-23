# Mocking Patterns

This document provides detailed guidance on mocking in Vitest + React Testing Library tests.

## Mocking Principles

### What to Mock

✅ **DO mock:**
- API services and HTTP calls
- External libraries with side effects
- Browser APIs (localStorage, navigator, etc.)
- Timers and dates
- Complex context providers (when testing consumer)

❌ **DO NOT mock:**
- Child components in the same directory
- Base UI components
- Simple utility functions
- The component under test

## Vitest Mock APIs

### Basic Mocking

```typescript
import { vi } from 'vitest'

// Mock a module
vi.mock('@/service/api')

// Mock with implementation
vi.mock('@/service/api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' }),
}))

// Mock default export
vi.mock('./utils', () => ({
  default: vi.fn(),
}))
```

### Inline Mocks

```typescript
// Create a mock function
const mockFn = vi.fn()

// With return value
const mockFn = vi.fn().mockReturnValue('value')

// With resolved value (async)
const mockFn = vi.fn().mockResolvedValue({ data: 'test' })

// With rejected value (async error)
const mockFn = vi.fn().mockRejectedValue(new Error('Failed'))

// With implementation
const mockFn = vi.fn((x) => x * 2)
```

### Spying

```typescript
// Spy on object method
const spy = vi.spyOn(object, 'method')

// Spy and mock implementation
vi.spyOn(console, 'error').mockImplementation(() => {})

// Spy on module export
import * as utils from './utils'
vi.spyOn(utils, 'helper').mockReturnValue('mocked')
```

### Resetting Mocks

```typescript
beforeEach(() => {
  vi.clearAllMocks()    // Clear call history, keep implementation
  // or
  vi.resetAllMocks()    // Clear history + reset to vi.fn()
  // or
  vi.restoreAllMocks()  // Restore original implementations
})
```

## Common Mock Patterns

### Mocking Next.js Router

```typescript
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => '/test-path',
  useSearchParams: () => new URLSearchParams('?query=test'),
  useParams: () => ({ id: '123' }),
}))
```

### Mocking React Router

```typescript
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useParams: () => ({ id: '123' }),
    useLocation: () => ({ pathname: '/test', search: '', hash: '' }),
  }
})
```

### Mocking API Services

```typescript
// Mock module
vi.mock('@/service/api')

// In test
import { fetchUsers, createUser } from '@/service/api'

describe('UserList', () => {
  beforeEach(() => {
    vi.mocked(fetchUsers).mockResolvedValue([
      { id: '1', name: 'John' },
      { id: '2', name: 'Jane' },
    ])
  })

  it('should display users', async () => {
    render(<UserList />)
    
    await waitFor(() => {
      expect(screen.getByText('John')).toBeInTheDocument()
    })
  })

  it('should handle API error', async () => {
    vi.mocked(fetchUsers).mockRejectedValue(new Error('Network error'))
    
    render(<UserList />)
    
    await waitFor(() => {
      expect(screen.getByText(/error/i)).toBeInTheDocument()
    })
  })
})
```

### Mocking HTTP with MSW

```typescript
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'

const server = setupServer(
  http.get('/api/users', () => {
    return HttpResponse.json([
      { id: '1', name: 'John' },
    ])
  }),
  
  http.post('/api/users', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: '2', ...body }, { status: 201 })
  })
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

// Override for specific test
it('should handle error', async () => {
  server.use(
    http.get('/api/users', () => {
      return HttpResponse.json({ error: 'Not found' }, { status: 404 })
    })
  )
  
  // Test error handling...
})
```

### Mocking i18n

```typescript
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
  Trans: ({ children }: { children: React.ReactNode }) => children,
}))
```

### Mocking Browser APIs

```typescript
// localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// matchMedia
Object.defineProperty(window, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// IntersectionObserver
const mockIntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
window.IntersectionObserver = mockIntersectionObserver

// ResizeObserver
window.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))
```

## State Management Mocking

### Mocking Zustand Stores

```typescript
import { create } from 'zustand'

// Option 1: Mock the entire store
vi.mock('@/store/user-store', () => ({
  useUserStore: vi.fn(() => ({
    user: { id: '1', name: 'Test User' },
    setUser: vi.fn(),
    logout: vi.fn(),
  })),
}))

// Option 2: Use real store with initial state
import { useUserStore } from '@/store/user-store'

beforeEach(() => {
  useUserStore.setState({
    user: { id: '1', name: 'Test User' },
  })
})

afterEach(() => {
  useUserStore.setState({
    user: null,
  })
})
```

### Mocking Redux

```typescript
import { configureStore } from '@reduxjs/toolkit'
import { Provider } from 'react-redux'
import userReducer from '@/store/user-slice'

const createTestStore = (preloadedState = {}) => {
  return configureStore({
    reducer: {
      user: userReducer,
    },
    preloadedState,
  })
}

const renderWithStore = (
  ui: React.ReactElement,
  { preloadedState = {}, ...options } = {}
) => {
  const store = createTestStore(preloadedState)
  
  return render(
    <Provider store={store}>{ui}</Provider>,
    options
  )
}

// Usage
it('should display user name', () => {
  renderWithStore(<UserProfile />, {
    preloadedState: {
      user: { name: 'John', email: 'john@example.com' },
    },
  })
  
  expect(screen.getByText('John')).toBeInTheDocument()
})
```

### Mocking React Query

```typescript
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
    },
  })
}

const renderWithQueryClient = (ui: React.ReactElement) => {
  const queryClient = createTestQueryClient()
  
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  )
}
```

## Timer Mocking

```typescript
describe('Timer tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should debounce input', async () => {
    const onChange = vi.fn()
    render(<DebouncedInput onChange={onChange} delay={500} />)
    
    await userEvent.type(screen.getByRole('textbox'), 'test')
    
    // onChange not called yet (debounced)
    expect(onChange).not.toHaveBeenCalled()
    
    // Advance timers
    vi.advanceTimersByTime(500)
    
    expect(onChange).toHaveBeenCalledWith('test')
  })

  it('should show toast for 3 seconds', () => {
    render(<Toast message="Success" duration={3000} />)
    
    expect(screen.getByText('Success')).toBeInTheDocument()
    
    vi.advanceTimersByTime(3000)
    
    expect(screen.queryByText('Success')).not.toBeInTheDocument()
  })
})
```

## Date Mocking

```typescript
describe('Date-dependent tests', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T10:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should display formatted date', () => {
    render(<DateDisplay />)
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
  })

  it('should show "today" for current date', () => {
    render(<RelativeDate date={new Date()} />)
    expect(screen.getByText('Today')).toBeInTheDocument()
  })
})
```

## Mock Checklist

Before writing mocks:
- [ ] Is this mock necessary? Can I use the real implementation?
- [ ] Am I mocking external dependencies only?
- [ ] Am I NOT mocking the component under test?

When using mocks:
- [ ] Mocks reset in beforeEach?
- [ ] Mock return values match actual API shape?
- [ ] Error cases covered with mockRejectedValue?
- [ ] Using vi.mocked() for TypeScript type safety?
