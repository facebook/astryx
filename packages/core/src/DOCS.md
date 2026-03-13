# Component Documentation Guide

## Overview

Every component directory has a `{Name}.doc.mjs` file with structured documentation. The XDS CLI reads these files to generate agent-friendly docs, skill files, and reference material.

## Exports

| Export      | Type           | Purpose                        | Required?                      |
| ----------- | -------------- | ------------------------------ | ------------------------------ |
| `docs`      | `ComponentDoc` | English docs (source of truth) | Yes                            |
| `docsZh`    | `ComponentDoc` | Chinese Simplified translation | Optional, falls back to `docs` |
| `docsDense` | `string`       | Compressed tweet-format string | Optional, falls back to `docs` |

**English first.** When adding a new component, write the `docs` export. That's it. Both `--zh` and `--dense` fall back to English if their exports don't exist. The Chinese and dense variants are generated from English by AI and can be added later.

## Writing `docs` (English)

This is the canonical source. See `docs-types.d.ts` for the full type definition.

```js
/** @type {import('../docs-types').ComponentDoc} */
export const docs = {
  name: 'Button',
  description:
    'XDSButton component with multiple variants, sizes, and isLoading state.',
  features: [
    "Variants: 'primary', 'secondary', 'ghost', 'destructive'",
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
  accessibility: ['Uses native <button> element with proper ARIA attributes.'],
  keyboard: 'Enter/Space activates; Tab moves focus.',
  notes: ['Prefer XDSButton over <div onClick> for accessibility.'],
  theming: {
    targets: [{className: 'xds-button', visualProps: ['variant', 'size']}],
  },
};
```

Rules:

- `name` = directory name without XDS prefix (e.g. `'Button'`, not `'XDSButton'`)
- `props` = every public prop, no limit
- `examples` = 2-5 realistic JSX examples
- `features` = short bullet strings
- `accessibility` and `keyboard` = a11y behavior
- `notes` = technical implementation details

## Generating `docsZh` (Chinese)

Same object shape as `docs`. Translate prose, keep code unchanged.

**Translate:** description, prop descriptions, features, notes, accessibility, example labels
**Keep unchanged:** name, prop names, types, defaults, example code, import paths

Generated from `docs` by AI. Placeholder is fine: `export const docsZh = {...docs};`

## Generating `docsDense` (Compressed)

A raw template literal string in tweet format. NOT a ComponentDoc object. When `--dense` is passed, the CLI prints this directly.

Generated from `docs` by applying the dense compression protocol (see `.context/decisions/dense-compression-protocol.md`). Placeholder is fine: ``export const docsDense = `TODO: apply dense protocol`;``

### Why dense?

LLM tokens cost money. Dense format compresses docs by 40-60% with zero information loss. Research findings:

- Chinese Simplified: 72% MORE tokens on Claude's tokenizer (bad for compression)
- Vowel stripping, Unicode symbols: worse than plain English
- Tweet format (short English fragments): 40-60% reduction, 100% fidelity

### Dense Format

```
import{XDSName}from'@xds/core/Path' //6 word max desc
P prop:type='default' desc | prop:type desc
C SubComponent //desc
P sub-props...
A a11y item1|item2
X <exact JSX/> | <more JSX/>
K Key=action;Key=action
N note1|note2|note3
```

## Adding a New Component's Docs

1. Create `packages/core/src/MyComponent/MyComponent.doc.mjs`
2. Write the `docs` export (English, required)
3. Optionally add `docsZh` (Chinese) and `docsDense` (compressed)
4. Both `--zh` and `--dense` fall back to English if missing
5. The CLI discovers doc files automatically

## CLI Flags

```bash
npx xds component Button              # English docs
npx xds component Button --compact    # Token-optimized English
npx xds component Button --brief      # Minimal summary
npx xds --zh component Button         # Chinese (falls back to English)
npx xds --dense component Button      # Dense tweet format (falls back to English)
```
