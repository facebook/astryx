// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/generate-a-palette`:
 * turn a palette request into light and dark color ramps.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'generate-a-palette',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 20},
  title: 'Generate a palette',
  category: 'guide',
  description:
    'Turn a palette request into light and dark color ramps inside the theme folder.',
  sections: [
    {
      id: 'generate-a-palette',
      title: 'Generate a palette',
      content: [
        {
          type: 'prose',
          text: 'Write a palette request, and `theme palette generate` turns it into light and dark color ramps. Keep the request and the output inside the theme folder.',
        },
        {
          type: 'prose',
          text: 'The smallest request names one color family and its seed color. Save it as `themes/ocean/palette.config.json`:',
        },
        {
          type: 'code',
          lang: 'json',
          code: '{"families": [{"id": "ocean", "seed": "#0074e2"}]}',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `# Print the palette without writing files
npx astryx theme palette generate themes/ocean/palette.config.json
# Write the palette and its receipt
npx astryx theme palette generate themes/ocean/palette.config.json \\
  --out themes/ocean/tokens/ocean.palette.ts`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `[ok] Wrote themes/ocean/tokens/ocean.palette.ts

[ok] Wrote themes/ocean/tokens/ocean.palette.receipt.json`,
        },
        {
          type: 'prose',
          text: '`ocean.palette.ts` exports `black`, `white`, and `palette`, which holds 21 stops from `0` to `100` for `light` and `dark`. The receipt records how to make the same palette again. A second run leaves both files alone unless you pass `--overwrite`.',
        },
        {
          type: 'prose',
          text: '`--preview <file>.html` also writes a page for reviewing the colors; write it outside `themes/` so apps do not copy it. Other request options are in {@link command:theme palette generate}.',
        },
      ],
    },
  ],
};
