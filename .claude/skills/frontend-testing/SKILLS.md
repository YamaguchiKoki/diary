---
name: frontend-testing
description: Generate Vitest + React Testing Library tests for React components, hooks, and utilities. Triggers on testing, spec files, coverage, Vitest, RTL, unit tests, integration tests, or write/review test requests.
---

# Frontend Testing Skill

This skill enables Claude to generate high-quality, comprehensive frontend tests following established conventions and best practices.

## Reference Documents

For detailed patterns, see:
- `reference/mocking.md` - Mock patterns, store testing, and best practices
- `reference/async-testing.md` - Async operations and API calls
- `reference/workflow.md` - Incremental testing workflow for multi-file testing

## Templates

Use these templates as starting points:
- `assets/component-test.template.tsx` - React component test template
- `assets/hook-test.template.tsx` - Custom hook test template
- `assets/utility-test.template.tsx` - Utility function test template

When generating tests, read the appropriate template first and follow its structure.

## When to Apply This Skill

Apply this skill when the user:

- Asks to **write tests** for a component, hook, or utility
- Asks to **review existing tests** for completeness
- Mentions **Vitest**, **React Testing Library**, **RTL**, or **spec files**
- Requests **test coverage** improvement
- Mentions **testing**, **unit tests**, or **integration tests** for frontend code
- Wants to understand **testing patterns**

**Do NOT apply** when:

- User is asking about backend/API tests (Python/pytest, etc.)
- User is asking about E2E tests (Playwright/Cypress)
- User is only asking conceptual questions without code context

## Quick Reference

### Tech Stack

| Tool | Purpose |
|------|---------|
| Vitest | Test runner |
| React Testing Library | Component testing |
| jsdom | Test environment |
| MSW or nock | HTTP mocking |
| TypeScript | Type safety |

### Key Commands

```bash
# Run all tests
npm test
# or
pnpm test

# Watch mode
npm test -- --watch

# Run specific file
npm test path/to/file.spec.tsx

# Generate coverage report
npm test -- --coverage
```

### File Naming

- Test files: `ComponentName.spec.tsx` (same directory as component)
- Or: `ComponentName.test.tsx`
- Integration tests: `__tests__/` directory

## Test Structure Template

```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import Component from './index'

// ✅ Import real project components (DO NOT mock these)
// import { ChildComponent } from './child-component'

// ✅ Mock external dependencies only
vi.mock('@/service/api')
vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => '/test',
}))

// Shared state for mocks (if needed)
let mockSharedState = false

describe('ComponentName', () => {
  beforeEach(() => {
    vi.clearAllMocks()  // ✅ Reset mocks BEFORE each test
    mockSharedState = false  // ✅ Reset shared state
  })

  // Rendering tests (REQUIRED)
  describe('Rendering', () => {
    it('should render without crashing', () => {
      // Arrange
      const props = { title: 'Test' }
      
      // Act
      render(<Component {...props} />)
      
      // Assert
      expect(screen.getByText('Test')).toBeInTheDocument()
    })
  })

  // Props tests (REQUIRED)
  describe('Props', () => {
    it('should apply custom className', () => {
      render(<Component className="custom" />)
      expect(screen.getByRole('button')).toHaveClass('custom')
    })
  })

  // User Interactions
  describe('User Interactions', () => {
    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Component onClick={handleClick} />)
      
      fireEvent.click(screen.getByRole('button'))
      
      expect(handleClick).toHaveBeenCalledTimes(1)
    })
  })

  // Edge Cases (REQUIRED)
  describe('Edge Cases', () => {
    it('should handle null data', () => {
      render(<Component data={null} />)
      expect(screen.getByText(/no data/i)).toBeInTheDocument()
    })

    it('should handle empty array', () => {
      render(<Component items={[]} />)
      expect(screen.getByText(/empty/i)).toBeInTheDocument()
    })
  })
})
```

## Testing Workflow (CRITICAL)

### ⚠️ Incremental Approach Required

**NEVER generate all test files at once.** For complex components or multi-file directories:

1. **Analyze & Plan**: List all files, order by complexity (simple → complex)
2. **Process ONE at a time**: Write test → Run test → Fix if needed → Next
3. **Verify before proceeding**: Do NOT continue to next file until current passes

```
For each file:
  ┌────────────────────────────────────────┐
  │ 1. Write test                          │
  │ 2. Run: npm test <file>.spec.tsx       │
  │ 3. PASS? → Mark complete, next file    │
  │    FAIL? → Fix first, then continue    │
  └────────────────────────────────────────┘
```

### Complexity-Based Order

Process in this order for multi-file testing:

1. 🟢 Utility functions (simplest)
2. 🟢 Custom hooks
3. 🟡 Simple components (presentational)
4. 🟡 Medium components (state, effects)
5. 🔴 Complex components (API, routing)
6. 🔴 Integration tests (index files - last)

### When to Refactor First

- **Complexity > 50**: Break into smaller pieces before testing
- **500+ lines**: Consider splitting before testing
- **Many dependencies**: Extract logic into hooks first

## Core Principles

### 1. AAA Pattern (Arrange-Act-Assert)

Every test should clearly separate:

- **Arrange**: Setup test data and render component
- **Act**: Perform user actions
- **Assert**: Verify expected outcomes

### 2. Black-Box Testing

- Test observable behavior, not implementation details
- Use semantic queries (getByRole, getByLabelText)
- Avoid testing internal state directly
- **Prefer pattern matching over hardcoded strings**:

```typescript
// ❌ Avoid: hardcoded text assertions
expect(screen.getByText('Loading...')).toBeInTheDocument()

// ✅ Better: role-based queries
expect(screen.getByRole('status')).toBeInTheDocument()

// ✅ Better: pattern matching
expect(screen.getByText(/loading/i)).toBeInTheDocument()
```

### 3. Single Behavior Per Test

Each test verifies ONE user-observable behavior:

```typescript
// ✅ Good: One behavior
it('should disable button when loading', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
})

// ❌ Bad: Multiple behaviors
it('should handle loading state', () => {
  render(<Button loading />)
  expect(screen.getByRole('button')).toBeDisabled()
  expect(screen.getByText('Loading...')).toBeInTheDocument()
  expect(screen.getByRole('button')).toHaveClass('loading')
})
```

### 4. Semantic Naming

Use `should <behavior> when <condition>`:

```typescript
it('should show error message when validation fails')
it('should call onSubmit when form is valid')
it('should disable input when isReadOnly is true')
```

## Required Test Scenarios

### Always Required (All Components)

1. **Rendering**: Component renders without crashing
2. **Props**: Required props, optional props, default values
3. **Edge Cases**: null, undefined, empty values, boundary conditions

### Conditional (When Present)

| Feature | Test Focus |
|---------|-----------|
| `useState` | Initial state, transitions, cleanup |
| `useEffect` | Execution, dependencies, cleanup |
| Event handlers | All onClick, onChange, onSubmit, keyboard |
| API calls | Loading, success, error states |
| Routing | Navigation, params, query strings |
| `useCallback`/`useMemo` | Referential equality |
| Context | Provider values, consumer behavior |
| Forms | Validation, submission, error display |

## Query Priority

Use queries in this priority order (most to least preferred):

```typescript
// 1. Accessible by everyone
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByPlaceholderText(/search/i)
screen.getByText(/welcome/i)
screen.getByDisplayValue(/john/i)

// 2. Semantic queries
screen.getByAltText(/profile/i)
screen.getByTitle(/close/i)

// 3. Test IDs (last resort)
screen.getByTestId('custom-element')
```

## Coverage Goals

For each test file generated, aim for:

- ✅ **100%** function coverage
- ✅ **100%** statement coverage
- ✅ **>95%** branch coverage
- ✅ **>95%** line coverage

## Testing Strategy

### Path-Level Testing (Directory Testing)

When assigned to test a directory/path, test **ALL content** within that path:

- Test all components, hooks, utilities in the directory
- Use incremental approach: one file at a time
- Goal: 100% coverage of ALL files in the directory

### Integration Testing First

**Prefer integration testing** when writing tests for a directory:

- ✅ **Import real project components** directly
- ✅ **Only mock**: API services, routing, complex context providers
- ❌ **DO NOT mock** base UI components
- ❌ **DO NOT mock** sibling/child components in the same directory

## Common Patterns

### Testing Hooks

```typescript
import { renderHook, act } from '@testing-library/react'
import { useCounter } from './use-counter'

describe('useCounter', () => {
  it('should increment counter', () => {
    const { result } = renderHook(() => useCounter())
    
    act(() => {
      result.current.increment()
    })
    
    expect(result.current.count).toBe(1)
  })
})
```

### Testing Async Operations

```typescript
it('should fetch and display data', async () => {
  vi.mocked(fetchData).mockResolvedValue({ name: 'Test' })
  
  render(<DataDisplay />)
  
  // Wait for loading to finish
  await waitFor(() => {
    expect(screen.queryByText(/loading/i)).not.toBeInTheDocument()
  })
  
  expect(screen.getByText('Test')).toBeInTheDocument()
})
```

### Testing Error States

```typescript
it('should display error message on API failure', async () => {
  vi.mocked(fetchData).mockRejectedValue(new Error('Network error'))
  
  render(<DataDisplay />)
  
  await waitFor(() => {
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
```

### Testing Forms

```typescript
it('should submit form with valid data', async () => {
  const onSubmit = vi.fn()
  render(<ContactForm onSubmit={onSubmit} />)
  
  await userEvent.type(screen.getByLabelText(/name/i), 'John')
  await userEvent.type(screen.getByLabelText(/email/i), 'john@example.com')
  await userEvent.click(screen.getByRole('button', { name: /submit/i }))
  
  expect(onSubmit).toHaveBeenCalledWith({
    name: 'John',
    email: 'john@example.com',
  })
})
```

### Testing with Context

```typescript
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme="light">
      <UserProvider user={mockUser}>
        {ui}
      </UserProvider>
    </ThemeProvider>
  )
}

it('should use theme from context', () => {
  renderWithProviders(<ThemedButton />)
  expect(screen.getByRole('button')).toHaveClass('light-theme')
})
```

## Quick Checklist

Before submitting tests:
- [ ] All tests follow AAA pattern?
- [ ] Using semantic queries (getByRole preferred)?
- [ ] One assertion focus per test?
- [ ] Edge cases covered (null, empty, error)?
- [ ] Async operations use waitFor/findBy?
- [ ] Mocks reset in beforeEach?
- [ ] No implementation details tested?
- [ ] Tests pass independently (no order dependency)?
