# Component Splitting Patterns

This document provides detailed guidance on splitting large components into smaller, focused components.

## When to Split Components

Split a component when you identify:

1. **Multiple UI sections** - Distinct visual areas with minimal coupling
2. **Conditional rendering blocks** - Large `{condition && <JSX />}` blocks
3. **Repeated patterns** - Similar UI structures used multiple times
4. **300+ lines** - Component exceeds manageable size
5. **Modal clusters** - Multiple modals rendered in one component

## Splitting Strategies

### Strategy 1: Section-Based Splitting

Identify visual sections and extract each as a component.

```typescript
// ❌ Before: Monolithic component (500+ lines)
const SettingsPage = () => {
  return (
    <div>
      {/* Header Section - 50 lines */}
      <div className="header">
        <h1>{t('settings.title')}</h1>
        <div className="actions">
          {isAdvancedMode && <Badge>Advanced</Badge>}
          <SettingsModal ... />
          <SaveButton ... />
        </div>
      </div>
      
      {/* Config Section - 200 lines */}
      <div className="config">
        <ConfigForm />
      </div>
      
      {/* Preview Section - 150 lines */}
      <div className="preview">
        <Preview ... />
      </div>
      
      {/* Modals Section - 100 lines */}
      {showSelectModal && <SelectModal ... />}
      {showHistoryModal && <HistoryModal ... />}
      {showConfirmModal && <ConfirmModal ... />}
    </div>
  )
}

// ✅ After: Split into focused components
// settings/
//   ├── index.tsx              (orchestration)
//   ├── settings-header.tsx
//   ├── settings-content.tsx
//   ├── settings-preview.tsx
//   └── settings-modals.tsx

// settings-header.tsx
interface SettingsHeaderProps {
  isAdvancedMode: boolean
  onSave: () => void
}

const SettingsHeader: FC<SettingsHeaderProps> = ({
  isAdvancedMode,
  onSave,
}) => {
  const { t } = useTranslation()
  
  return (
    <div className="header">
      <h1>{t('settings.title')}</h1>
      <div className="actions">
        {isAdvancedMode && <Badge>Advanced</Badge>}
        <SettingsModal ... />
        <SaveButton onSave={onSave} />
      </div>
    </div>
  )
}

// index.tsx (orchestration only)
const SettingsPage = () => {
  const { config, setConfig } = useConfig()
  const { activeModal, openModal, closeModal } = useModalState()
  
  return (
    <div>
      <SettingsHeader
        isAdvancedMode={isAdvancedMode}
        onSave={handleSave}
      />
      <SettingsContent
        config={config}
        onConfigChange={setConfig}
      />
      {!isMobile && (
        <SettingsPreview
          config={config}
        />
      )}
      <SettingsModals
        activeModal={activeModal}
        onClose={closeModal}
      />
    </div>
  )
}
```

### Strategy 2: Conditional Block Extraction

Extract large conditional rendering blocks.

```typescript
// ❌ Before: Large conditional blocks
const UserProfile = () => {
  return (
    <div>
      {isExpanded ? (
        <div className="expanded">
          {/* 100 lines of expanded view */}
        </div>
      ) : (
        <div className="collapsed">
          {/* 50 lines of collapsed view */}
        </div>
      )}
    </div>
  )
}

// ✅ After: Separate view components
const ProfileExpanded: FC<ProfileViewProps> = ({ user, onAction }) => {
  return (
    <div className="expanded">
      {/* Clean, focused expanded view */}
    </div>
  )
}

const ProfileCollapsed: FC<ProfileViewProps> = ({ user, onAction }) => {
  return (
    <div className="collapsed">
      {/* Clean, focused collapsed view */}
    </div>
  )
}

const UserProfile = () => {
  return (
    <div>
      {isExpanded
        ? <ProfileExpanded user={user} onAction={handleAction} />
        : <ProfileCollapsed user={user} onAction={handleAction} />
      }
    </div>
  )
}
```

### Strategy 3: Modal Extraction

Extract modals with their trigger logic.

```typescript
// ❌ Before: Multiple modals in one component
const Dashboard = () => {
  const [showEdit, setShowEdit] = useState(false)
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [showExport, setShowExport] = useState(false)
  
  const onEdit = async (data) => { /* 20 lines */ }
  const onDuplicate = async (data) => { /* 20 lines */ }
  const onDelete = async () => { /* 15 lines */ }
  
  return (
    <div>
      {/* Main content */}
      
      {showEdit && <EditModal onConfirm={onEdit} onClose={() => setShowEdit(false)} />}
      {showDuplicate && <DuplicateModal onConfirm={onDuplicate} onClose={() => setShowDuplicate(false)} />}
      {showDelete && <DeleteConfirm onConfirm={onDelete} onClose={() => setShowDelete(false)} />}
      {showExport && <ExportModal ... />}
    </div>
  )
}

// ✅ After: Modal manager component
// dashboard-modals.tsx
type ModalType = 'edit' | 'duplicate' | 'delete' | 'export' | null

interface DashboardModalsProps {
  data: DashboardData
  activeModal: ModalType
  onClose: () => void
  onSuccess: () => void
}

const DashboardModals: FC<DashboardModalsProps> = ({
  data,
  activeModal,
  onClose,
  onSuccess,
}) => {
  const handleEdit = async (formData) => { /* logic */ }
  const handleDuplicate = async (formData) => { /* logic */ }
  const handleDelete = async () => { /* logic */ }

  return (
    <>
      {activeModal === 'edit' && (
        <EditModal
          data={data}
          onConfirm={handleEdit}
          onClose={onClose}
        />
      )}
      {activeModal === 'duplicate' && (
        <DuplicateModal
          data={data}
          onConfirm={handleDuplicate}
          onClose={onClose}
        />
      )}
      {activeModal === 'delete' && (
        <DeleteConfirm
          onConfirm={handleDelete}
          onClose={onClose}
        />
      )}
      {activeModal === 'export' && (
        <ExportModal
          data={data}
          onClose={onClose}
        />
      )}
    </>
  )
}

// Parent component
const Dashboard = () => {
  const { activeModal, openModal, closeModal } = useModalState()
  
  return (
    <div>
      {/* Main content with openModal triggers */}
      <Button onClick={() => openModal('edit')}>Edit</Button>
      
      <DashboardModals
        data={data}
        activeModal={activeModal}
        onClose={closeModal}
        onSuccess={handleSuccess}
      />
    </div>
  )
}
```

### Strategy 4: List Item Extraction

Extract repeated item rendering.

```typescript
// ❌ Before: Inline item rendering
const OperationsList = () => {
  return (
    <div>
      {operations.map(op => (
        <div key={op.id} className="operation-item">
          <span className="icon">{op.icon}</span>
          <span className="title">{op.title}</span>
          <span className="description">{op.description}</span>
          <button onClick={() => op.onClick()}>
            {op.actionLabel}
          </button>
          {op.badge && <Badge>{op.badge}</Badge>}
          {/* More complex rendering... */}
        </div>
      ))}
    </div>
  )
}

// ✅ After: Extracted item component
interface OperationItemProps {
  operation: Operation
  onAction: (id: string) => void
}

const OperationItem: FC<OperationItemProps> = ({ operation, onAction }) => {
  return (
    <div className="operation-item">
      <span className="icon">{operation.icon}</span>
      <span className="title">{operation.title}</span>
      <span className="description">{operation.description}</span>
      <button onClick={() => onAction(operation.id)}>
        {operation.actionLabel}
      </button>
      {operation.badge && <Badge>{operation.badge}</Badge>}
    </div>
  )
}

const OperationsList = () => {
  const handleAction = useCallback((id: string) => {
    const op = operations.find(o => o.id === id)
    op?.onClick()
  }, [operations])

  return (
    <div>
      {operations.map(op => (
        <OperationItem
          key={op.id}
          operation={op}
          onAction={handleAction}
        />
      ))}
    </div>
  )
}
```

## Directory Structure Patterns

### Pattern A: Flat Structure (Simple Components)

For components with 2-3 sub-components:

```
component-name/
  ├── index.tsx           # Main component
  ├── sub-component-a.tsx
  ├── sub-component-b.tsx
  └── types.ts            # Shared types
```

### Pattern B: Nested Structure (Complex Components)

For components with many sub-components:

```
component-name/
  ├── index.tsx           # Main orchestration
  ├── types.ts            # Shared types
  ├── hooks/
  │   ├── use-feature-a.ts
  │   └── use-feature-b.ts
  ├── components/
  │   ├── header/
  │   │   └── index.tsx
  │   ├── content/
  │   │   └── index.tsx
  │   └── modals/
  │       └── index.tsx
  └── utils/
      └── helpers.ts
```

### Pattern C: Feature-Based Structure

For feature-rich components:

```
feature-name/
  ├── index.tsx           # Main page/feature component
  ├── base/               # Base/shared components
  │   ├── panel/
  │   ├── card/
  │   └── button/
  ├── config/             # Config section
  │   ├── index.tsx
  │   ├── form/
  │   └── validation/
  ├── preview/            # Preview section
  │   ├── index.tsx
  │   └── renderer/
  └── hooks/              # Shared hooks
      ├── use-config.ts
      └── use-preview.ts
```

## Props Design

### Minimal Props Principle

Pass only what's needed:

```typescript
// ❌ Bad: Passing entire objects when only some fields needed
<ConfigHeader appDetail={appDetail} modelConfig={modelConfig} />

// ✅ Good: Destructure to minimum required
<ConfigHeader
  appName={appDetail.name}
  isAdvancedMode={modelConfig.isAdvanced}
  onSave={handleSave}
/>
```

### Callback Props Pattern

Use callbacks for child-to-parent communication:

```typescript
// Parent
const Parent = () => {
  const [value, setValue] = useState('')
  
  return (
    <Child
      value={value}
      onChange={setValue}
      onSubmit={handleSubmit}
    />
  )
}

// Child
interface ChildProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
}

const Child: FC<ChildProps> = ({ value, onChange, onSubmit }) => {
  return (
    <div>
      <input value={value} onChange={e => onChange(e.target.value)} />
      <button onClick={onSubmit}>Submit</button>
    </div>
  )
}
```

### Render Props for Flexibility

When sub-components need parent context:

```typescript
interface ListProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  renderEmpty?: () => React.ReactNode
}

function List<T>({ items, renderItem, renderEmpty }: ListProps<T>) {
  if (items.length === 0 && renderEmpty) {
    return <>{renderEmpty()}</>
  }
  
  return (
    <div>
      {items.map((item, index) => renderItem(item, index))}
    </div>
  )
}

// Usage
<List
  items={operations}
  renderItem={(op, i) => <OperationItem key={i} operation={op} />}
  renderEmpty={() => <EmptyState message="No operations" />}
/>
```

## Splitting Checklist

Before splitting:
- [ ] Component > 300 lines?
- [ ] Multiple distinct UI sections?
- [ ] Large conditional blocks?
- [ ] Multiple modals?
- [ ] Repeated patterns?

After splitting:
- [ ] Each file < 200 lines?
- [ ] Clear responsibility per component?
- [ ] Minimal props interface?
- [ ] Proper TypeScript types?
- [ ] Tests still pass?
