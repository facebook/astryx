# API Guidance

<!-- Referenced from CLAUDE.md for discoverability -->

Consolidated reference for XDS component API conventions. This is a decision doc — it states what the conventions **are**.

For detailed patterns on specific topics, see:

- [Input Props Convention](./input-props-convention.md) — standard props for all input components
- [React Transitions](../explorations/react-transitions.md) — async action patterns with `useOptimistic`

---

## Component Naming

### Anatomy

```
<System><Namespace><Variant><Type><Postfixes>
```

| Segment   | Required | Example           | Notes                                                                          |
| --------- | -------- | ----------------- | ------------------------------------------------------------------------------ |
| System    | ✓        | `XDS`             | Always `XDS` for this design system                                            |
| Namespace |          | `Layout`          | Groups related components (e.g. `XDSLayoutHeader`, `XDSLayoutPanel`)           |
| Variant   |          | `Icon`            | Distinguishes visual/behavioral variants (use sparingly — prefer concise APIs) |
| Type      | ✓        | `Input`, `Button` | The component's role                                                           |
| Postfixes |          | `Item`, `Group`   | Compositional parts                                                            |

**Examples:** `XDSButton`, `XDSTextInput`, `XDSSelector`, `XDSCheckboxInput`, `XDSVStack`

### File Naming

Files match export names (prefixed). This is the LLM-friendly default — no re-export indirection.

```
packages/core/src/Button/
├── XDSButton.tsx          → exports XDSButton
├── XDSButton.test.tsx
├── README.md
└── index.ts               → re-exports from XDSButton.tsx

apps/storybook/stories/
└── Button.stories.tsx     → Storybook stories (separate from core)
```

> **Tip:** A `create-component` CLI command exists to scaffold this structure, though it may need manual adjustments.

### File Structure

Component source lives in `packages/core/src/`, stories live in `apps/storybook/stories/`:

| File                                          | Purpose                      |
| --------------------------------------------- | ---------------------------- |
| `packages/core/src/<Name>/XDS<Name>.tsx`      | Component implementation     |
| `packages/core/src/<Name>/XDS<Name>.test.tsx` | Colocated unit tests         |
| `packages/core/src/<Name>/index.ts`           | Public exports               |
| `packages/core/src/<Name>/README.md`          | Component documentation      |
| `packages/core/src/<Name>/types.ts`           | Shared types (if needed)     |
| `packages/core/src/<Name>/utils.ts`           | Internal helpers (if needed) |
| `packages/core/src/<Name>/hooks.ts`           | Internal hooks (if needed)   |
| `apps/storybook/stories/<Name>.stories.tsx`   | Storybook stories            |

### File Header

Every component file includes a structured header for traceability:

```tsx
/**
 * @file XDSButton.tsx
 * @input Uses React forwardRef, ButtonHTMLAttributes, ReactNode
 * @output Exports XDSButton component, XDSButtonProps, XDSButtonVariant types
 * @position Core implementation; consumed by index.ts, tested by XDSButton.test.tsx
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Button/README.md
 * - /packages/core/src/Button/XDSButton.test.tsx
 * - /packages/core/src/Button/index.ts
 * - /apps/storybook/stories/Button.stories.tsx
 */
```

---

## Prop Naming

### Booleans

Always prefix with `is` or `has`.

| Prefix | Meaning            | Examples                                                               |
| ------ | ------------------ | ---------------------------------------------------------------------- |
| `is`   | State or condition | `isDisabled`, `isRequired`, `isOptional`, `isLabelHidden`, `isLoading` |
| `has`  | Feature toggle     | `hasAutoFocus`, `hasClear`, `hasSeconds`                               |

### Callbacks

Pattern: `on{Verb}{Scope?}`

Scope is optional — use it when a component has multiple parts that could apply to the same verb, to disambiguate. When there's only one thing the verb could apply to, omit the scope.

| Type           | Pattern           | Examples                                         |
| -------------- | ----------------- | ------------------------------------------------ |
| Sync handler   | `on{Verb}`        | `onClick`, `onChange`, `onBlur`, `onToggle`      |
| Scoped handler | `on{Verb}{Scope}` | `onSidebarCollapsedChange`, `onVisibilityChange` |
| Async action   | `on{Verb}Action`  | `onClickAction`, `onChangeAction`                |

**When to add scope:** If a component has multiple things that could toggle, change, or collapse, add scope to clarify which one. For example, `XDSAppShell` has `onSidebarCollapsedChange` because the shell could have multiple collapsible areas. But `XDSPopover` uses `onToggle` because there's only one thing toggling.

### Enums / String Unions

Use `camelCase` values:

```ts
variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
size?: 'sm' | 'md' | 'lg';
```

### Common Enum Values

Enum values should align with CSS token names where applicable:

| Prop      | Values                 | Matches Token                         |
| --------- | ---------------------- | ------------------------------------- |
| `size`    | `'sm' \| 'md' \| 'lg'` | `--size-sm`, `--size-md`, `--size-lg` |
| `padding` | `'sm' \| 'md' \| 'lg'` | `--spacing-*` tokens                  |
| `margin`  | `'sm' \| 'md' \| 'lg'` | `--spacing-*` tokens                  |
| `variant` | component-specific     | —                                     |

### Directional Props

Use `start`/`end` instead of `left`/`right` for RTL support:

| ✅ Do        | ❌ Don't       |
| ------------ | -------------- |
| `startIcon`  | `leftIcon`     |
| `paddingEnd` | `paddingRight` |
| `endContent` | `rightContent` |

### HTML Attribute Collisions

Prefix with `html` when wrapping native attributes to avoid collisions:

```ts
htmlName?: string;   // maps to <input name="...">
htmlFor?: string;    // maps to <label htmlFor="...">
```

---

## Required vs Optional Props

| Prop Category                  | Required? | Rationale                                                                                                                                     |
| ------------------------------ | --------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `label` (interactive elements) | ✓         | Accessibility — buttons and inputs need labels. Not required for display components (e.g. `XDSText`, `XDSLink` where content _is_ the label). |
| `value` / `onChange`           | ✓         | Controlled components need both                                                                                                               |
| `children`                     | ✓         | When the component has no meaningful output without content (e.g. `XDSButton` needs a label or children)                                      |
| Visual variants                | Optional  | Safe defaults exist (`variant='secondary'`, `size='md'`)                                                                                      |
| Boolean flags                  | Optional  | Default to `false`                                                                                                                            |
| Event handlers                 | Optional  | Not all uses need them                                                                                                                        |

**Principle:** Make behavioral/structural props required. Make presentation props optional with sensible defaults.

---

## Composition vs Config

| Use Composition When                        | Use Config (Props) When                   |
| ------------------------------------------- | ----------------------------------------- |
| Content is arbitrary/user-defined           | Options are finite and well-known         |
| Children need access to parent context      | Prop controls a single visual attribute   |
| Flexibility is needed for unknown use cases | Consistency matters more than flexibility |

**Examples:**

- **Config:** `variant`, `size`, `isDisabled` — finite, well-known values
- **Composition:** `children`, `icon` as ReactNode, render functions for custom items

```tsx
// Config: finite variants
<XDSButton variant="primary" size="md" label="Save" />

// Composition: custom content via render function
<XDSSelector items={items} value={v} onChange={setV} label="Pick">
  {(item) => <CustomItem icon={item.icon} label={item.label} />}
</XDSSelector>
```

---

## Styling

### Rules

1. **No `className` or `style` props.** Components `Omit` these from HTML attributes.
2. **Use `xstyle` for overrides** — accepts `StyleXStyles` only (compile-time validated).
3. **Constrained over freeform:** Higher-level components (Button, TextInput) expose specific props (`variant`, `size`). Primitive/layout components (Stack, Box) accept `xstyle`.

### `xstyle` Pattern

```tsx
import type {StyleXStyles} from '@stylexjs/stylex';

interface Props {
  xstyle?: StyleXStyles;
}

// Apply xstyle last so consumer styles override defaults
<div {...stylex.props(styles.base, xstyle)} />;
```

### Theme Overrides

Components read from `ThemeContext` for theme-level variant overrides. Theme styles are applied after base styles but before consumer `xstyle`:

```tsx
const themeOverride = themeContext?.theme.components?.button?.variants?.[variant];
// Order: base → theme override → consumer xstyle
{...stylex.props(styles.base, variants[variant], themeOverride)}
```

---

## State Management

### Controlled Components

All input components are controlled — they require `value` and `onChange`/`onChangeAction`.

| Prop             | Type                         | Description                      |
| ---------------- | ---------------------------- | -------------------------------- |
| `value`          | varies                       | Current value (source of truth)  |
| `onChange`       | `(value, event?) => void`    | Sync change handler              |
| `onChangeAction` | `(value, event?) => Promise` | Async action (replaces onChange) |
| `isLoading`      | `boolean`                    | External loading state           |

### Uncontrolled Defaults

When supporting uncontrolled mode, prefix default values with `initial`. For booleans, maintain the `is`/`has` prefix convention:

```ts
initialValue?: string;      // not defaultValue
initialIsOpen?: boolean;    // not defaultOpen (keeps `is` prefix)
initialHasSelection?: boolean;
```

### onChange Signature

The `onChange` signature varies by input type:

| Input Type   | Signature                                    |
| ------------ | -------------------------------------------- |
| Text-based   | `(value: string, e: ChangeEvent) => void`    |
| Boolean      | `(checked: boolean, e: ChangeEvent) => void` |
| Parsed value | `(value: T \| undefined) => void` (no event) |
| Selection    | `(value: string) => void`                    |

**Convention:** Include the event when the raw DOM element is useful. Omit it when the value is parsed/transformed.

---

## Async Actions (React Transitions)

See [React Transitions exploration](../explorations/react-transitions.md) for full implementation details.

### Two Patterns

| Pattern        | Prop             | Hook            | Used By    |
| -------------- | ---------------- | --------------- | ---------- |
| Button actions | `onClickAction`  | `useTransition` | XDSButton  |
| Input actions  | `onChangeAction` | `useOptimistic` | All inputs |

### Input Pattern: `onChangeAction` + `useOptimistic`

```tsx
const [optimisticValue, setOptimisticValue] = useOptimistic(value);
const isBusy = isLoading || optimisticValue !== value;

const handleChange = e => {
  const newValue = e.target.value;
  if (onChangeAction) {
    startTransition(() => {
      setOptimisticValue(newValue); // Immediate UI feedback
      onChangeAction(newValue, e); // Async — auto-rollback on failure
    });
  } else if (onChange) {
    onChange(newValue, e);
  }
};
```

- Render `optimisticValue`, not `value`
- `isBusy` drives visual feedback (opacity, `aria-busy`) — **never** disables the input (prevents focus loss)
- `onChangeAction` has the same signature as `onChange`

### Button Pattern: `onClickAction` + `useTransition`

```tsx
const [isPending, startTransition] = useTransition();
const isBusy = isLoading || isPending;

const handleClick = e => {
  if (onClickAction) {
    startTransition(() => {
      onClickAction(e);
    });
  } else if (onClick) {
    onClick(e);
  }
};
```

- `isBusy` disables the button and shows a spinner
- When combined with `href`, navigation defers until action completes

### Naming

- `onClick` / `onChange` — synchronous, immediate
- `onClickAction` / `onChangeAction` — async, wrapped in transition
- `isLoading` — external loading state (consolidated from `loading`, `isBusy`)

---

## Accessibility

### Required Patterns

| Requirement       | Implementation                                        |
| ----------------- | ----------------------------------------------------- |
| Label             | `label` prop → `<label htmlFor={id}>` or `aria-label` |
| Hidden label      | `isLabelHidden` — visually hidden, still in DOM       |
| Description       | `aria-describedby` linking to description element     |
| Required state    | `aria-required="true"` when `isRequired`              |
| Invalid state     | `aria-invalid="true"` when `status.type === 'error'`  |
| Disabled state    | Native `disabled` attribute (correct semantics)       |
| Busy state        | `aria-busy="true"` during async operations            |
| Icon-only buttons | `label` used as `aria-label` when no visible text     |

### Disabled vs Busy

| State        | Interaction        | Focus | `disabled` attr | Visual                                          |
| ------------ | ------------------ | ----- | --------------- | ----------------------------------------------- |
| `isDisabled` | Blocked            | Lost  | ✓               | 50% opacity, `not-allowed` cursor               |
| `isBusy`     | Guarded in handler | Kept  | ✗               | Reduced opacity, spinner (buttons), `aria-busy` |

**Key rule:** Neither inputs nor buttons use native `disabled` for busy state. Busy is visual-only (`aria-busy`, `aria-disabled`, opacity). Buttons guard against re-triggering in the click handler. This prevents focus loss during async operations.

---

## Refs and Imperative Handles

### `forwardRef` Convention

All components use `forwardRef` to expose the root DOM element:

```tsx
export const XDSButton = forwardRef<HTMLButtonElement, XDSButtonProps>(
  (props, ref) => {
    return <button ref={ref} {...props} />;
  },
);

XDSButton.displayName = 'XDSButton';
```

**Always set `displayName`** — required for React DevTools and error messages.

### Ref Types

| Component Type | Ref Target          |
| -------------- | ------------------- |
| Button         | `HTMLButtonElement` |
| Text input     | `HTMLInputElement`  |
| Container      | `HTMLDivElement`    |
| Link button    | `HTMLAnchorElement` |

### Generic Components

Components with generics (e.g., `XDSSelector<T>`) cannot use `forwardRef` directly. Use a regular function component instead:

```tsx
export function XDSSelector<T extends XDSSelectorOption>(
  props: XDSSelectorProps<T>,
) { ... }
```

---

## Variant and Size Types

### Deriving from StyleX

Derive variant/size types from the StyleX object keys:

```tsx
const variants = stylex.create({
  primary: { ... },
  secondary: { ... },
  ghost: { ... },
});

export type XDSButtonVariant = keyof typeof variants;
```

### Standard Sizes

| Size | Height Token       | Use Case                  |
| ---- | ------------------ | ------------------------- |
| `sm` | `--size-sm` (18px) | Compact UIs, tables       |
| `md` | `--size-md` (26px) | Default for most contexts |
| `lg` | `--size-lg`        | Prominent actions         |

---

## Status / Validation

### Status Object

```ts
interface XDSInputStatus {
  type: 'error' | 'warning' | 'success';
  message?: string;
}
```

- `type` controls border color and status icon
- `message` is optional — renders below the input when provided
- Components re-export with component-specific aliases: `XDSTextInputStatus`, `XDSSelectorStatus`, etc.

---

## Test ID Convention

Use the `data-testid` prop for test framework integration:

```tsx
interface Props {
  'data-testid'?: string;
}

// In JSX
<button data-testid={testId} />;
```

Pass through to the primary interactive element (the button, input, or trigger — not a wrapper div).

---

## Module Augmentation for Themes

Components register their variant types with the theme system via module augmentation. This avoids circular dependencies between components and the theme type system:

```tsx
declare module '../theme/types' {
  interface ComponentStyles {
    button?: {
      variants?: Partial<Record<XDSButtonVariant, StyleXStyles>>;
    };
  }
}
```

---

## Export Conventions

### From Component `index.ts`

Export the component, its props type, and any variant/status types:

```ts
export {XDSButton} from './XDSButton';
export type {
  XDSButtonProps,
  XDSButtonVariant,
  XDSButtonSize,
} from './XDSButton';
```

### From Package `src/index.ts`

Re-export all component directories:

```ts
export * from './Button';
export * from './TextInput';
```

### `tsup.config.ts`

Add each component directory as a separate entry point for tree-shaking:

```ts
entry: [
  'src/index.ts',
  'src/Button/index.ts',
  'src/TextInput/index.ts',
],
```

---

## JSDoc Convention

All exported props and components should have JSDoc comments. These serve both human developers and LLM code generation:

````tsx
/**
 * A text input component for collecting user input.
 *
 * @example
 * ```tsx
 * <XDSTextInput label="Name" value={name} onChange={setName} />
 * ```
 */
export const XDSTextInput = forwardRef<HTMLInputElement, XDSTextInputProps>(
````

For props, describe what it does, not how:

```tsx
/**
 * Whether the input is in a loading state.
 * Shows a spinner and disables interaction.
 * @default false
 */
isLoading?: boolean;
```
