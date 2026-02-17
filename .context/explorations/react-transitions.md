# React Transitions in XDS

_Exploration, February 2026_

## Context

React Transitions (`startTransition`, `useTransition`) enable non-urgent, non-blocking updates that keep UI responsive. This exploration examines how XDS components integrate these patterns.

**Key distinction:** This is about React's concurrent rendering features, not CSS animations. See `animation-system.md` for visual animations.

---

## React Version Support

**Target:** React 19.x

XDS requires React 19+ (`react: ">=19.0.0"`). This enables:

1. **`useOptimistic`** — Immediate optimistic UI updates with automatic rollback
2. **Async `startTransition`** — Native async function support in transitions
3. **`useTransition`** — Pending state tracking for button actions

---

## React Transitions Overview

### APIs

| API                              | Purpose                                      | Returns                                 | Used In          |
| -------------------------------- | -------------------------------------------- | --------------------------------------- | ---------------- |
| `startTransition(fn)`            | Mark state updates as non-urgent             | void                                    | Input components |
| `useTransition()`                | Get pending state + transition function      | `[isPending, startTransition]`          | Button           |
| `useOptimistic(state, updateFn)` | Immediate temporary state with auto-rollback | `[optimisticState, setOptimisticState]` | Input components |

### When to Use Transitions

**Always use for:**

- Network requests (data fetching, form submissions)
- Heavy computations or filtering large lists
- Navigation between views/routes
- Search/filter operations

**Never use for:**

- Focus changes or immediate visual feedback
- Animations requiring immediate updates
- Critical error states

---

## XDS Integration Patterns

### Pattern 1: Button with Action (and Link Variant)

Buttons that trigger async operations should show a busy state. Buttons can also be links (`href`).

**React 18 implementation** (uses `.then()` since async functions in `startTransition` require React 19):

```tsx
interface XDSButtonProps {
  label: string;
  onClick?: () => void; // Immediate, urgent (focus, UI feedback)
  onClickAction?: () => Promise<void>; // Non-urgent async work (network request)
  href?: string; // Renders as <a> instead of <button>
  isBusy?: boolean; // External busy state control
}

const XDSButton = ({
  label,
  onClick,
  onClickAction,
  href,
  isBusy: externalBusy,
  children,
  ...props
}) => {
  const [isPending, startTransition] = useTransition();
  const isBusy = externalBusy || isPending;

  const handleClick = (e: React.MouseEvent) => {
    // For links with actions, prevent navigation until action completes
    if (href && onClickAction) {
      e.preventDefault();
    }

    onClick?.(); // Immediate

    if (onClickAction) {
      startTransition(() => {
        onClickAction().then(() => {
          // For links, navigate after action completes
          if (href) {
            window.location.href = href;
          }
        });
      });
    }
  };

  const Component = href ? 'a' : 'button';

  return (
    <Component
      href={href}
      disabled={!href && isBusy} // Only disable buttons, not links
      aria-disabled={isBusy}
      aria-busy={isBusy}
      onClick={handleClick}
      {...props}>
      {isBusy ? (
        <>
          <Spinner aria-hidden />
          <span className="visually-hidden">Loading</span>
          <span aria-hidden>{children}</span>
        </>
      ) : (
        children
      )}
    </Component>
  );
};
```

**Usage:**

```tsx
// Regular button with async action
<XDSButton
  label="Save"
  onClickAction={async () => {
    await saveData();
    showToast('Saved!');
  }}
>
  Save
</XDSButton>

// Link button with async action (e.g., analytics before navigation)
<XDSButton
  label="View Details"
  href="/details/123"
  onClickAction={async () => {
    await trackEvent('view_details');
  }}
>
  View Details
</XDSButton>

// External busy state control
<XDSButton
  label="Submit"
  isBusy={formState.isSubmitting}
  onClick={handleSubmit}
>
  Submit
</XDSButton>
```

**Busy State UI:**

- Show spinner inside button
- Keep button text visible but with reduced opacity (prevents layout shift)
- Set `aria-busy="true"` for screen readers
- Disable interaction (`disabled` for buttons, `aria-disabled` for links)

### Pattern 2: Inputs with Optimistic Updates

Input components use `useOptimistic` to immediately reflect the new value while the async action runs. If the action fails, React automatically rolls back to the previous value.

```tsx
interface XDSTextInputProps {
  value: string;
  onChange?: (value: string) => void;
  onChangeAction?: (value: string) => Promise<void>;
  isLoading?: boolean;
}

const XDSTextInput = ({
  value,
  onChange,
  onChangeAction,
  isLoading = false,
  ...props
}) => {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  // isBusy derived from optimistic mismatch + external isLoading
  const isBusy = isLoading || optimisticValue !== value;

  const handleChange = (newValue: string) => {
    if (onChangeAction) {
      startTransition(() => {
        setOptimisticValue(newValue); // Immediate UI feedback
        onChangeAction(newValue); // Async action, auto-rollback on failure
      });
    } else if (onChange) {
      onChange(newValue);
    }
  };

  return (
    <input
      value={optimisticValue} // Shows optimistic value immediately
      onChange={e => handleChange(e.target.value)}
      aria-busy={isBusy || undefined}
      {...props}
    />
  );
};
```

This same pattern applies to all input components (CheckboxInput, Switch, Selector, DateInput, TimeInput, TextArea). The component renders `optimisticValue` and derives `isBusy` from the mismatch between optimistic and actual values.

### Pattern 3: Boolean Inputs (Checkbox, Switch)

For boolean inputs, the optimistic pattern gives instant visual feedback — the toggle flips immediately while the server syncs:

```tsx
const XDSSwitch = ({
  value,
  onChange,
  onChangeAction,
  isLoading = false,
  ...props
}) => {
  const [optimisticValue, setOptimisticValue] = useOptimistic(value);
  const isBusy = isLoading || optimisticValue !== value;
  const isOn = optimisticValue === true; // Visual state from optimistic value

  const handleChange = e => {
    const newValue = e.target.checked;
    if (onChangeAction) {
      startTransition(() => {
        setOptimisticValue(newValue);
        onChangeAction(newValue, e);
      });
    } else if (onChange) {
      onChange(newValue, e);
    }
  };
  // ...
};
```

---

## Components Updated

| Component        | Action Prop      | External Loading | Optimistic Hook | Notes                                    |
| ---------------- | ---------------- | ---------------- | --------------- | ---------------------------------------- |
| XDSButton        | `onClickAction`  | `isLoading`      | `useTransition` | Shows spinner, supports `href` for links |
| XDSTextInput     | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic value during async            |
| XDSTextArea      | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic value during async            |
| XDSSelector      | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic selection during async        |
| XDSDateInput     | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic date during async             |
| XDSTimeInput     | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic time during async             |
| XDSSwitch        | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic toggle during async           |
| XDSCheckboxInput | `onChangeAction` | `isLoading`      | `useOptimistic` | Optimistic check during async            |

**Loading state logic:**

- **Input components:** `isBusy = isLoading || (optimisticValue !== value)` — combines external `isLoading` prop with optimistic state mismatch
- **Button:** `isBusy = isLoading || isPending` — uses `useTransition` since there's no value to be optimistic about

---

## Naming Convention

**Prop naming:**

- `onClick` / `onChange` - Synchronous, immediate
- `onClickAction` / `onChangeAction` - Async, wrapped in transition

**Why "Action"?**

- React docs call functions inside transitions "actions"
- Clear distinction from sync handlers
- Follows existing internal patterns

---

## Error Handling

| API                            | Error Behavior                      |
| ------------------------------ | ----------------------------------- |
| `startTransition` (standalone) | Swallows errors silently            |
| `useTransition`                | Re-throws to nearest error boundary |

**Recommendation:** Always use `useTransition()` in components for proper error handling.

---

## Pending State UI

Components should show pending state automatically:

```tsx
// Button shows loading spinner
<XDSButton onClickAction={submitForm}>Submit</XDSButton>

// Input shows subtle indicator
<XDSTextInput onChangeAction={validateUsername} />
```

Options:

1. **Disable** - Prevent further interaction (current pattern)
2. **Spinner** - Replace content with loading indicator
3. **Opacity** - Reduce opacity during pending
4. **Subtle indicator** - Small spinner next to input

---

## Open Questions

1. ~~Should `isPending` be exposed to consumers, or handled entirely internally?~~

   **Decision:** Both. Handle internally via `useTransition` AND expose a public prop for consumers using non-transition async patterns.

   **Current state:** XDSButton has redundant props (`loading` and `isBusy` do the same thing). Other components have no external prop.

   **Competitive analysis:**

   | Library           | Prop Name   |
   | ----------------- | ----------- |
   | Mantine           | `loading`   |
   | Blueprint.js      | `loading`   |
   | Semantic UI React | `loading`   |
   | MUI LoadingButton | `loading`   |
   | React Suite       | `loading`   |
   | shadcn/ui         | `loading`   |
   | Chakra UI         | `isLoading` |

   **Result:** `loading` is the dominant pattern (6/7 libraries). Chakra UI is the outlier with `isLoading`.

   **Decision:** Use `isLoading` to maintain XDS `is`/`has` prefix convention for boolean props (consistent with `isDisabled`, `isRequired`, `isOptional`, `hasClear`, etc.). ~~Deprecate `isBusy` and `loading`.~~ ✓ Done — consolidated to `isLoading` on all components.

2. How does this interact with form libraries? (Primary concern: Formentor integration)
3. ~~Should we provide a `useXDSTransition` hook for custom components?~~ No — unnecessary unless it provides functionality beyond `useTransition`
4. What's the right pending state UI for each component type?

---

## Next Steps

1. ~~Prototype `XDSButton` with `onClickAction` prop~~ ✓ Done
2. ~~Add `onChangeAction` to all form inputs~~ ✓ Done
3. Test with real async operations (network requests)
4. ~~Upgrade to React 19 and use `useOptimistic`~~ ✓ Done
5. Document patterns in component READMEs

---

## Related

- `animation-system.md` - CSS/visual animations (different concern)
- React docs: [Transitions](https://react.dev/reference/react/useTransition)
- React docs: [useOptimistic](https://react.dev/reference/react/useOptimistic)
