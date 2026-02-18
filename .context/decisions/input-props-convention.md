# Input Component Props Convention

This document defines the standard props that all XDS input components should implement for consistency.

## Core Field Props

All input components that represent a form field should include these props:

| Prop            | Type      | Default | Required | Description                                                        |
| --------------- | --------- | ------- | -------- | ------------------------------------------------------------------ |
| `label`         | `string`  | -       | ✓        | Accessible label text (always rendered for screen readers)         |
| `isLabelHidden` | `boolean` | `false` |          | Visually hide the label while keeping it accessible                |
| `description`   | `string`  | -       |          | Helper text displayed between label and input                      |
| `isOptional`    | `boolean` | `false` |          | Shows "(Optional)" indicator. Mutually exclusive with `isRequired` |
| `isRequired`    | `boolean` | `false` |          | Marks field as required. Mutually exclusive with `isOptional`      |
| `isDisabled`    | `boolean` | `false` |          | Disables the input                                                 |

## Value Props

| Prop       | Type                      | Description                                                                     |
| ---------- | ------------------------- | ------------------------------------------------------------------------------- |
| `value`    | varies                    | The controlled value of the input                                               |
| `onChange` | `(value, event?) => void` | Sync handler, always fires first. Not mutually exclusive with `onChangeAction`. |

### onChange Signature Convention

`onChange` always fires first (sync). For event-based inputs, call `event.preventDefault()` to block `onChangeAction` from firing.

- **Text-based inputs** (TextInput, TextArea): Include the event for access to the DOM element

  ```ts
  onChange: (value: string, e: ChangeEvent<HTMLInputElement>) => void
  ```

- **Parsed value inputs** (DateInput, TimeInput): Event is omitted since value is parsed/transformed (no preventDefault support)

  ```ts
  onChange: (value: ISODateString | undefined) => void
  onChange: (value: ISOTimeString | undefined) => void
  ```

- **Boolean inputs** (CheckboxInput, Switch): Include the event
  ```ts
  onChange: (checked: boolean, e: ChangeEvent<HTMLInputElement>) => void
  ```

## Async Action Props (React 19 Transitions)

For components that need to support async operations on value changes, use the action pattern:

| Prop             | Type                                 | Default | Description                                                |
| ---------------- | ------------------------------------ | ------- | ---------------------------------------------------------- |
| `onChangeAction` | `(value, event?) => void \| Promise` | -       | Async action, fires after onChange. Wrapped in transition. |
| `isLoading`      | `boolean`                            | `false` | Manual loading state for external async operations         |

### Action Props Convention

- **onChange always fires first**: `onChange` is the sync handler and always fires. It is NOT replaced by `onChangeAction`.
- **onChangeAction fires after onChange**: For event-based inputs, `onChange` can call `event.preventDefault()` to block `onChangeAction` from firing. For non-event inputs (Selector, DateInput, TimeInput), both always fire.
- **Same signature as onChange**: `onChangeAction` receives the same arguments as `onChange` for that component.
- **Optimistic updates via `useOptimistic`**: Components use React 19's `useOptimistic` to immediately reflect the new value while the action runs. If the action fails, React automatically rolls back.
- **Busy state derived from optimistic mismatch**: `isBusy = isLoading || (optimisticValue !== value)` — no separate `isPending` needed for inputs.
- **Visual feedback only**: `isBusy` is used for visual feedback (reduced opacity, `aria-busy`) but does NOT disable the input to prevent focus loss.

### Implementation Pattern

**For components with native events** (TextInput, TextArea, CheckboxInput, Switch):

```tsx
const [optimisticValue, setOptimisticValue] = useOptimistic(value);
const isBusy = isLoading || optimisticValue !== value;

const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
  const newValue = e.target.value; // or e.target.checked for boolean inputs
  onChange?.(newValue, e); // Always fires first
  if (onChangeAction && !e.defaultPrevented) {
    startTransition(async () => {
      setOptimisticValue(newValue);
      await onChangeAction(newValue, e);
    });
  }
};
```

**For components without native events** (Selector, DateInput, TimeInput):

```tsx
const handleValueChange = (newValue: ValueType) => {
  onChange?.(newValue); // Always fires first
  if (onChangeAction) {
    startTransition(async () => {
      setOptimisticValue(newValue);
      await onChangeAction(newValue);
    });
  }
};
```

```tsx
// In JSX:
<input
  value={optimisticValue} // Render optimistic value
  disabled={isDisabled} // Never use isBusy here - causes focus loss
  aria-busy={isBusy || undefined}
  {...stylex.props(
    styles.input,
    (isDisabled || isBusy) && styles.inputDisabled, // Visual feedback only
  )}
/>
```

### Button Action Props

For buttons, use `onClickAction` instead:

| Prop            | Type                                 | Description                                            |
| --------------- | ------------------------------------ | ------------------------------------------------------ |
| `onClickAction` | `(e: MouseEvent) => void \| Promise` | Async action replacing onClick. Wrapped in transition. |

When combined with `href`, navigation is deferred until the action completes.

## Optional Common Props

| Prop           | Type               | Default | Applicable To              | Description                        |
| -------------- | ------------------ | ------- | -------------------------- | ---------------------------------- |
| `placeholder`  | `string`           | varies  | Text-based inputs          | Placeholder text when empty        |
| `size`         | `'sm' \| 'md'`     | `'md'`  | Most inputs                | Size variant                       |
| `status`       | `{type, message?}` | -       | Inputs with validation     | Error/warning/success state        |
| `labelTooltip` | `string`           | -       | Inputs needing explanation | Tooltip on info icon next to label |
| `startIcon`    | `XDSIconType`      | -       | Inputs with icon support   | Icon at start of input             |

## Size Variants

Standard sizes across components:

| Size | Input Height | Use Case                         |
| ---- | ------------ | -------------------------------- |
| `sm` | 18px         | Compact UIs, tables, dense forms |
| `md` | 26px         | Default, most forms              |

## Status Object

For inputs that support validation status, use the shared `XDSInputStatus` type from `@xds/core`:

```ts
import type {XDSInputStatus, XDSInputStatusType} from '@xds/core';

// XDSInputStatusType = 'error' | 'warning' | 'success'

interface XDSInputStatus {
  type: XDSInputStatusType;
  message?: string; // Optional message displayed below input
}
```

Each input component re-exports these types with component-specific aliases for convenience:

- `XDSTextInputStatus`, `XDSTextInputStatusType`
- `XDSDateInputStatus`, `XDSDateInputStatusType`
- `XDSTimeInputStatus`, `XDSTimeInputStatusType`

## Current Implementation Status

| Component        | label | isLabelHidden | description | isOptional | isRequired | isDisabled | size | status | placeholder | onChangeAction |
| ---------------- | ----- | ------------- | ----------- | ---------- | ---------- | ---------- | ---- | ------ | ----------- | -------------- |
| XDSTextInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           | ✓              |
| XDSTextArea      | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | -    | ✓      | ✓           | ✓              |
| XDSCheckboxInput | ✓     | ✓             | ✓           | -          | ✓          | ✓          | ✓    | -      | -           | ✓              |
| XDSDateInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           | ✓              |
| XDSTimeInput     | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           | ✓              |
| XDSSwitch        | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | -    | -      | -           | ✓              |
| XDSSelector      | ✓     | ✓             | ✓           | ✓          | ✓          | ✓          | ✓    | ✓      | ✓           | ✓              |

### Gaps to Address

1. **isOptional**: Add to CheckboxInput for consistency
2. **size**: Add to TextArea for consistency
3. **labelTooltip**: Consider adding to all field-based inputs

## Boolean Prop Naming

All boolean props must be prefixed with `is` or `has`:

- `is` prefix: State or condition (`isDisabled`, `isRequired`, `isOptional`, `isLabelHidden`)
- `has` prefix: Feature toggle (`hasSeconds`, `hasClear`, `hasAutoFocus`)

## forwardRef Pattern

All input components should use `forwardRef` to expose the underlying input element:

```tsx
export const XDSInput = forwardRef<HTMLInputElement, Props>((props, ref) => {
  // ...
  return <input ref={ref} ... />;
});

XDSInput.displayName = 'XDSInput';
```

## Accessibility Requirements

1. **Label**: Always associate label with input via `htmlFor`/`id`
2. **Description**: Use `aria-describedby` to link description to input
3. **Required**: Set `aria-required="true"` when `isRequired` is true
4. **Invalid**: Set `aria-invalid="true"` when status type is `'error'`
5. **Disabled**: Use native `disabled` attribute (provides correct semantics)
