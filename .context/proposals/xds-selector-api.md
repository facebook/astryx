# XDSSelector API Proposal

## Status

Approved

## Decision

Use `items` prop with optional render function.

## API

### Basic

```tsx
<XDSSelector
  items={['Apple', 'Banana', 'Orange']}
  value={value}
  onChange={setValue}
/>
```

### With Objects

```tsx
<XDSSelector
  items={[
    {value: 'apple', label: 'Apple'},
    {value: 'banana', label: 'Banana', disabled: true},
  ]}
  value={value}
  onChange={setValue}
/>
```

### Custom Rendering

```tsx
<XDSSelector items={users} value={value} onChange={setValue}>
  {user => <XDSSelectorItem icon={user.avatar}>{user.name}</XDSSelectorItem>}
</XDSSelector>
```

### Dividers & Groups

```tsx
<XDSSelector
  items={[
    {value: 'apple', label: 'Apple'},
    {type: 'divider'},
    {
      type: 'section',
      title: 'Citrus',
      items: [{value: 'orange', label: 'Orange'}],
    },
  ]}
/>
```

## Types

```typescript
type XDSSelectorItem = {
  value: string;
  label?: string;
  disabled?: boolean;
  icon?: XDSIconType;
};

type XDSSelectorOption =
  | string
  | XDSSelectorItem
  | {type: 'divider'}
  | {type: 'section'; title?: string; items: XDSSelectorItem[]};

interface XDSSelectorProps<T extends XDSSelectorOption> {
  // Data
  items: T[];

  // Value
  value?: string;
  onChange?: (value: string) => void;

  // Display
  placeholder?: string;
  children?: (item: Extract<T, XDSSelectorItem>) => React.ReactNode;

  // State
  isDisabled?: boolean;
}
```

## Future: Async/Searchable

Deferred for later. Will use `searchSource` pattern:

```typescript
interface SearchSource<T> {
  bootstrap(): Promise<T[]>;
  search(query: string): Promise<T[]>;
}
```

## Rationale

1. **No two-pass render** — data known upfront
2. **RSC compatible** — server can return items via React Flight
3. **Async-friendly** — `searchSource` encapsulates fetch logic
4. **Still compositional** — render function uses JSX
5. **LLM-friendly** — simple data structure, one component
