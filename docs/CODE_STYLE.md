# XDS Code Style Guide

## File Organization

### Component folder structure

```
ComponentName/
├── index.ts              # Public API exports
├── XDSComponentName.tsx  # Main component file
├── types.ts              # Component-specific types (when shared across files)
├── styles.ts             # StyleX styles
├── hooks.ts (or hooks/)  # Component-specific hooks
├── utils.ts              # Pure utility functions
├── XDSComponentName.test.tsx  # Component tests
├── hooks.test.ts         # Hook tests (when hooks are complex)
└── utils.test.ts         # Utility tests (when utils are complex)
```

### Within a component file

Order within a `.tsx` file:

1. **Imports**
2. **Types/interfaces** (component props, internal types)
3. **Component function** — render logic is the main content
4. **Sub-components** (private, not exported)

The principle: **behavior before presentation**. When you open a component file, you should immediately understand what it does (the render) before how it looks (the styles, which live in `styles.ts`).

### When to extract

| Extract to...   | When...                                                       |
| --------------- | ------------------------------------------------------------- |
| `types.ts`      | Types are shared across multiple files in the same folder     |
| `hooks.ts`      | Logic uses React hooks and is reusable or complex (>30 lines) |
| `utils.ts`      | Pure functions with no React dependency                       |
| `hooks/` folder | Multiple hooks, each substantial enough for its own file      |

Keep it simple: if a hook is 10 lines and only used once, inline it. Extract when it aids readability or testability.

## Testing

### What to test

- **Component tests** (`XDSComponent.test.tsx`): User-facing behavior. Render, interact, assert.
- **Hook tests** (`hooks.test.ts`): Complex hooks with branching logic, state machines, or non-trivial computations.
- **Util tests** (`utils.test.ts`): Pure functions with meaningful logic (not trivial wrappers).

### When to add separate hook/util tests

If it's sufficiently complex — meaning it has branching logic, edge cases, or would be hard to test exhaustively through the component alone. The `dayCellUtils.test.ts` and `useCalendarDays.test.ts` are good examples: they cover edge cases (month boundaries, variable row counts, constraint combinations) that would be cumbersome to test only via the full component.

## Comments

- **Short and useful.** Write for the next person who has to maintain this.
- **No narration.** Don't describe what the code obviously does (`// increment counter`).
- **Explain why, not what.** If the code is non-obvious, explain the reasoning.
- **No LLM verbosity.** Avoid multi-paragraph docstrings for simple functions. One line is fine.

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

## Naming

- **Component files:** `XDSComponentName.tsx`
- **Hook files:** `useHookName.ts` or `hooks.ts`
- **Types files:** `types.ts`
- **Style files:** `styles.ts`
- **Boolean props:** Prefix with `is` or `has` (`isDisabled`, `hasWeekNumbers`)

## Enforcement

### Automated (eslint-plugin-xds)

These rules are enforced by lint:

- `boolean-prop-naming` — boolean props must use `is`/`has` prefix
- `copyright-header` — all files need the copyright header
- `docblock-example-format` — `@example` blocks must use fenced code
- `no-hardcoded-anchor` — use design tokens, not hardcoded values

### Planned

- Comment length/quality lint rule (flag overly verbose comments)
- File structure lint rule (flag styles defined above component in same file)

### Manual (code review)

- File organization follows the folder structure above
- Complex logic is extracted and tested
- Comments are concise and useful
