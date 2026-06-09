# XDS Code Style Guide

## File Organization

### Component folder structure

```
ComponentName/
├── index.ts              # Public API exports
├── XDSComponentName.tsx  # Component: types, render, sub-components, styles
├── types.ts              # Shared/composition types (NOT prop types)
├── hooks/                # Public API hooks (own files)
│   ├── useHookName.ts
│   └── useHookName.test.ts
├── hooks.ts              # Internal component hooks (when extracted)
├── utils.ts              # Pure utility functions
├── XDSComponentName.test.tsx  # Component tests
└── utils.test.ts         # Utility tests (when utils are complex)
```

### Within a component file

Order within a `.tsx` file:

1. **Imports**
2. **Types/interfaces** (prop types live here for easy introspection)
3. **Component function** — render logic is the main content
4. **Sub-components** (private, not exported)
5. **Styles** (StyleX at the bottom)

The principle: **behavior before presentation**. When you open a component file, you understand what it does (the render) before how it looks (styles at the bottom of the same file).

### Where types go

- **Prop types** → in the component file, near the top after imports
- **Shared/composition types** → `types.ts` (used across multiple files in the folder)
- **Public hook return types** → in the hook's own file

### Hooks: internal vs public

| Type | Location | Example |
|------|----------|---------|
| Internal hooks (used only by this component) | `hooks.ts` or inline | State management helpers |
| Public API hooks (exported for consumers) | Own file in `hooks/` folder | `useCalendarDays.ts` |

Public hooks get their own file because they need their own docs, types, and tests.

### When to extract

| Extract to...    | When...                                                        |
|------------------|----------------------------------------------------------------|
| `types.ts`       | Types are shared across multiple files in the same folder      |
| `hooks.ts`       | Internal hook logic is complex (>30 lines) or reused           |
| `hooks/`         | Hook is part of the public API                                 |
| `utils.ts`       | Pure functions with no React dependency                        |

Keep it simple: if a hook is 10 lines and only used once, inline it.

## Testing

### What to test

- **Component tests** (`XDSComponent.test.tsx`): User-facing behavior. Render, interact, assert.
- **Hook tests** (`useHookName.test.ts`): Complex hooks with branching logic or non-trivial computations.
- **Util tests** (`utils.test.ts`): Pure functions with meaningful logic.

### When to add separate hook/util tests

If it's sufficiently complex — meaning it has branching logic, edge cases, or would be hard to test exhaustively through the component alone.

## Comments

- **Short and useful.** Write for the next person maintaining this.
- **No narration.** Don't describe what the code obviously does.
- **Explain why, not what.** If the code is non-obvious, explain the reasoning.
- **Keep SYNC comments.** They reduce drift between related files.
- **No LLM verbosity.** One line is fine for simple functions.

Good:
```ts
// Ensure start <= end for consistent range representation
const [start, end] = plainDateIsBefore(date, startPd)
  ? [iso, rangeSelectionStart]
  : [rangeSelectionStart, iso];
```

Bad:
```ts
// This function takes the selected date and the range selection start date,
// then compares them to determine which one comes first chronologically.
// If the newly selected date is before the range start, we swap them to
// maintain the invariant that start always precedes end in our DateRange type.
const [start, end] = plainDateIsBefore(date, startPd)
  ? [iso, rangeSelectionStart]
  : [rangeSelectionStart, iso];
```

Good (SYNC comment):
```ts
/**
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Calendar/Calendar.doc.mjs
 * - /packages/core/src/Calendar/XDSCalendar.test.tsx
 */
```

## Naming

- **Component files:** `XDSComponentName.tsx`
- **Hook files:** `useHookName.ts`
- **Types files:** `types.ts`
- **Util files:** `utils.ts`
- **Boolean props:** Prefix with `is` or `has` (`isDisabled`, `hasWeekNumbers`)

## Enforcement

### Automated (eslint-plugin-xds)

- `boolean-prop-naming` — boolean props must use `is`/`has` prefix
- `copyright-header` — all files need the copyright header
- `docblock-example-format` — `@example` blocks must use fenced code
- `no-hardcoded-anchor` — use design tokens, not hardcoded values

### Planned

- Comment verbosity lint rule (flag overly verbose comments)
- File order lint rule (flag styles defined above component render)

### Manual (code review)

- File organization follows the folder structure above
- Complex logic is extracted and tested
- Comments are concise and useful
- SYNC comments are present and up to date
