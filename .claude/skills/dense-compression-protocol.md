# XDS Translation Protocol

Apply this protocol to create a dense (compressed) translation for an XDS component `.doc.mjs` file.

## Task

Read the `docs` export. Produce a `TranslationDoc` object that contains only the compressed prose fields. The CLI merges this onto `docs` at read time, so you only need to provide the fields that change.

## TranslationDoc Shape

```js
/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'compressed component description',
  features: ['compressed feature 1', 'compressed feature 2'],
  notes: ['compressed note 1', 'compressed note 2'],
  accessibility: ['compressed a11y item 1'],
  keyboard: 'compressed keyboard string',
  propDescriptions: {
    label: 'compressed desc',
    variant: 'compressed desc',
  },
  // Only for multi-component docs (docs.components)
  components: [
    {
      name: 'XDSDialogHeader',
      description: 'compressed sub-component desc',
      propDescriptions: {
        title: 'compressed desc',
      },
    },
  ],
};
```

## What to Compress

Every string value in the TranslationDoc gets compressed:

- Drop articles: a, the, an
- Drop filler: is used for, provides, supports, displays, whether, when set to
- Fragments only: "Shows a loading spinner and disables interaction" -> "shows spinner+disables"
- Shorthand: w/ w/o + -> ;

## What to Include

- `description` always
- `features` if docs.features exists (same count, same order)
- `notes` if docs.notes exists (same count, same order)
- `accessibility` if docs.accessibility exists (same count, same order)
- `keyboard` if docs.keyboard exists
- `propDescriptions` one entry per prop that has a description in docs.props
- `components` if docs.components exists, one entry per sub-component

## What NEVER Changes

Prop names, types, defaults live in `docs`, not in the translation.
Example code and labels live in `docs`, not in the translation.
Sub-component names copied exactly from docs.components[n].name.

## Counts Must Match

- features array length must equal docs.features length
- notes array length must equal docs.notes length
- accessibility array length must equal docs.accessibility length
- components array length must equal docs.components length (if present)
