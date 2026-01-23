# Testing Workflow

This document provides guidance on the incremental testing workflow for multi-file testing scenarios.

## Core Principle: One File at a Time

**NEVER generate all test files at once.** Complex components require careful, incremental testing.

```
┌─────────────────────────────────────────────────────────────┐
│                    INCREMENTAL WORKFLOW                     │
├─────────────────────────────────────────────────────────────┤
│  1. Analyze directory structure                             │
│  2. Order files by complexity (simple → complex)            │
│  3. For EACH file:                                          │
│     a. Write test file                                      │
│     b. Run test: npm test <file>.spec.tsx                   │
│     c. If FAIL → Fix before continuing                      │
│     d. If PASS → Mark complete, proceed to next             │
│  4. Integration tests LAST                                  │
└─────────────────────────────────────────────────────────────┘
```

## Step 1: Analyze and Plan

Before writing any tests, analyze the directory:

```bash
# List all files in directory
ls -la src/components/feature/

# Example output:
# types.ts
# utils.ts
# use-feature.ts
# sub-component.tsx
# main-component.tsx
# index.tsx
```

### Create a Testing Plan

```markdown
## Testing Plan: src/components/feature/

### Files to Test (ordered by complexity):

1. [ ] `types.ts` - Type definitions (may not need tests)
2. [ ] `utils.ts` - Utility functions (🟢 Simple)
3. [ ] `use-feature.ts` - Custom hook (🟢 Simple)
4. [ ] `sub-component.tsx` - Presentational (🟡 Medium)
5. [ ] `main-component.tsx` - Stateful (🟡 Medium)
6. [ ] `index.tsx` - Integration (🔴 Complex - LAST)

### Dependencies:
- External: @/service/api (mock)
- Internal: None identified

### Estimated Complexity: Medium
```

## Step 2: Order by Complexity

### Complexity Levels

| Level | Indicators | Examples |
|-------|-----------|----------|
| 🟢 Simple | No state, no effects, pure functions | Utils, types, simple hooks |
| 🟡 Medium | State, effects, event handlers | Form components, list items |
| 🔴 Complex | API calls, routing, many dependencies | Pages, container components |

### Processing Order

```
1. 🟢 Types/Constants (may skip if no logic)
2. 🟢 Utility functions
3. 🟢 Custom hooks
4. 🟡 Presentational components
5. 🟡 Stateful components
6. 🔴 Container/Page components
7. 🔴 Index files (integration)
```

## Step 3: Write and Verify Each Test

### Template for Each File

```markdown
### Testing: utils.ts

**Status**: 🔄 In Progress

**File Analysis**:
- Functions: `formatDate`, `parseQuery`, `validateEmail`
- Dependencies: None
- Complexity: 🟢 Simple

**Test Coverage Targets**:
- [ ] formatDate - all formats
- [ ] parseQuery - valid/invalid inputs
- [ ] validateEmail - valid/invalid emails

**Test File**: `utils.spec.ts`
```

### After Each Test

```bash
# Run the specific test
npm test src/components/feature/utils.spec.ts

# Check output
# ✅ PASS → Update status, proceed
# ❌ FAIL → Fix before continuing
```

### Update Plan After Each Test

```markdown
### Testing Plan: src/components/feature/

1. [x] `utils.ts` - ✅ PASS (15 tests)
2. [x] `use-feature.ts` - ✅ PASS (8 tests)
3. [ ] `sub-component.tsx` - 🔄 IN PROGRESS
4. [ ] `main-component.tsx` - ⏳ PENDING
5. [ ] `index.tsx` - ⏳ PENDING
```

## Step 4: Handle Failures

### When a Test Fails

1. **Don't skip** - Fix before proceeding
2. **Analyze the failure** - Is it test issue or code issue?
3. **Common fixes**:
   - Missing mock
   - Incorrect query
   - Timing issue (need waitFor)
   - State not reset between tests

### Debugging Steps

```typescript
// Add debug output
screen.debug()  // Print current DOM

// Check what's available
screen.logTestingPlaygroundURL()  // Get playground URL

// Verify element exists
console.log(screen.queryByText('Expected'))  // null if not found
```

## Step 5: Integration Tests Last

### Why Last?

- Integration tests depend on unit tests passing
- Easier to identify issues when units are tested
- Integration tests are most complex

### Integration Test Pattern

```typescript
// index.spec.tsx - Tests the full component integration
import { render, screen } from '@testing-library/react'
import Feature from './index'

describe('Feature Integration', () => {
  // Mock only external dependencies
  vi.mock('@/service/api')
  
  // Use real internal components
  // import SubComponent from './sub-component'  // NOT mocked
  
  it('should render complete feature', async () => {
    render(<Feature />)
    
    // Test user flows, not implementation details
    await userEvent.click(screen.getByRole('button', { name: /start/i }))
    expect(await screen.findByText(/success/i)).toBeInTheDocument()
  })
})
```

## Progress Tracking Format

Use this format to track multi-file testing:

```markdown
# Test Progress: ComponentName

## Summary
- Total Files: 6
- Completed: 3/6
- Current: sub-component.tsx
- Blockers: None

## Detailed Status

| File | Status | Tests | Coverage | Notes |
|------|--------|-------|----------|-------|
| types.ts | ⏭️ Skip | - | N/A | Type-only |
| utils.ts | ✅ Done | 15 | 100% | |
| use-feature.ts | ✅ Done | 8 | 100% | |
| sub-component.tsx | 🔄 WIP | 5/12 | 60% | Working on edge cases |
| main-component.tsx | ⏳ Pending | - | - | |
| index.tsx | ⏳ Pending | - | - | Integration |

## Next Actions
1. Complete sub-component.tsx edge cases
2. Run full test suite
3. Proceed to main-component.tsx
```

## When to Refactor First

### Refactor Before Testing If:

- **Complexity > 50**: Component is too complex
- **Lines > 500**: File is too large
- **Many responsibilities**: Component does too much
- **Tight coupling**: Hard to test in isolation

### Refactoring Steps

1. Extract utility functions → Test utils
2. Extract custom hooks → Test hooks
3. Extract sub-components → Test components
4. Test remaining orchestration

```markdown
## Refactoring Plan: ComplexComponent

### Current Issues:
- 600+ lines
- 10+ useState calls
- Mixed concerns (data fetching, UI, validation)

### Extraction Plan:
1. [ ] Extract `useComplexData` hook
2. [ ] Extract `ValidationSection` component
3. [ ] Extract `FormSection` component
4. [ ] Test each extracted piece
5. [ ] Test remaining orchestration
```

## Common Workflow Mistakes

### ❌ Writing All Tests at Once

```markdown
# Bad: Generated 6 test files without verification
- component.spec.tsx
- utils.spec.tsx
- hook.spec.tsx
- index.spec.tsx
- ...

Result: Multiple failures, hard to debug
```

### ✅ One at a Time with Verification

```markdown
# Good: Incremental with verification
1. Write utils.spec.tsx → Run → ✅ Pass
2. Write hook.spec.tsx → Run → ✅ Pass
3. Write component.spec.tsx → Run → ❌ Fail → Fix → ✅ Pass
4. Continue...
```

### ❌ Starting with Integration Tests

```markdown
# Bad: Testing index.tsx first
- Many dependencies to mock
- Hard to identify failure source
- Tests are brittle
```

### ✅ Unit Tests First, Integration Last

```markdown
# Good: Bottom-up approach
1. Test utilities (no dependencies)
2. Test hooks (mock external only)
3. Test components (mock services only)
4. Test integration (real internal components)
```

## Checklist Before Proceeding

Before moving to the next file:

- [ ] All tests pass for current file
- [ ] Coverage targets met (>95%)
- [ ] Edge cases covered
- [ ] No console errors/warnings
- [ ] Tests are independent (no order dependency)
- [ ] Mocks properly reset
