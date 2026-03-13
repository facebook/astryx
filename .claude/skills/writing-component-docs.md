# Component Documentation Guide

## Overview

Every component directory has a `{Name}.doc.mjs` file with structured documentation. The XDS CLI reads these files to generate agent-friendly docs, skill files, and reference material.

## Exports

| Export      | Type             | Purpose                          | Required?                       |
| ----------- | ---------------- | -------------------------------- | ------------------------------- |
| `docs`      | `ComponentDoc`   | English docs (source of truth)   | Yes                             |
| `docsZh`    | `TranslationDoc` | Chinese Simplified prose overlay | Optional, falls back to English |
| `docsDense` | `TranslationDoc` | Compressed prose overlay         | Optional, falls back to English |

**English first.** When adding a new component, write the `docs` export. That's it. Both `--lang zh` and `--lang dense` fall back to English if their exports don't exist. Translations are generated from English by AI and can be added later.

## Architecture

`docs` contains everything: props, examples, types, defaults, and English prose. Translations only override the prose. The CLI merges them at read time.

```
docs (English, full)     <- source of truth
  + docsZh (prose only)  <- merged onto docs when --lang zh
  + docsDense (prose only) <- merged onto docs when --lang dense
```

This means:

- Examples are defined once in `docs`, shared across all languages
- Prop names, types, defaults are defined once in `docs`
- Adding a new example only requires editing `docs`
- Translations only need to be updated when prose changes

## Writing `docs` (English)

See `docs-types.ts` for the full type definition.

```js
/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Button',
  description:
    'XDSButton component with multiple variants, sizes, and isLoading state.',
  features: [
    'Variants: primary, secondary, ghost, destructive',
    'Sizes: sm (28px), md (32px), lg (36px)',
  ],
  props: [
    {
      name: 'label',
      type: 'string',
      description: 'Accessible label.',
      required: true,
    },
    {
      name: 'variant',
      type: "'primary' | 'secondary' | 'ghost' | 'destructive'",
      description: 'Visual style.',
      default: "'secondary'",
    },
  ],
  examples: [
    {label: 'Basic', code: '<XDSButton label="Save" variant="primary" />'},
  ],
  accessibility: ['Uses native <button> with proper ARIA attributes.'],
  keyboard: 'Enter/Space activates; Tab moves focus.',
  notes: ['Prefer XDSButton over <div onClick> for accessibility.'],
};
```

## Writing Translations (docsZh / docsDense)

Translations use the `TranslationDoc` type. Only prose fields, no structure.

```js
// -------------------------------------------------------
// Auto-generated translations below. Do not edit manually.
// Regenerate with the dense compression protocol.
// See .context/decisions/dense-compression-protocol.md
// -------------------------------------------------------

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'multi-variant btn w/ loading state',
  features: [
    '4 variants: primary secondary ghost destructive',
    'sizes: sm 28px, md 32px, lg 36px',
  ],
  propDescriptions: {
    label: 'a11y label; aria-label for icon-only',
    variant: 'visual style',
  },
  accessibility: ['native <button> w/ proper ARIA attrs'],
  keyboard: 'Enter/Space=activate; Tab=move focus',
  notes: ['prefer over div onClick for a11y'],
};
```

The CLI merges this onto `docs`: compressed descriptions replace English ones, but props, examples, types, and defaults all come from `docs`.

## Adding a New Component's Docs

1. Create `packages/core/src/MyComponent/MyComponent.doc.mjs`
2. Write the `docs` export (English, required)
3. Optionally add `docsZh` and `docsDense` (both fall back to English if missing)
4. The CLI discovers doc files automatically, no registration needed

## CLI Flags

```bash
npx xds component metadata Button             # description, features, notes, a11y
npx xds component metadata Button --detail brief  # just the description
npx xds component props Button                # full props table
npx xds component props Button --detail brief # name: type per line
npx xds component examples Button             # list example titles
npx xds component example Button 3            # one example's code
npx xds component list                        # all components by category
npx xds component search "date"               # find by name or description
npx xds --lang zh component metadata Button   # Chinese prose
npx xds --lang dense component props Button   # Compressed prose
```

`--lang` controls which prose translation is used. `--detail brief` gives condensed output. They compose independently.
