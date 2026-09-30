// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/themes`: add a source theme to an
 * integration package, generate its palette, and let apps copy and build it.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'themes',
  placement: {parent: 'namespace:building-blocks', slot: 'types', order: 30},
  title: 'Themes',
  category: 'guide',
  keywords: ['integration theme', 'ship a theme'],
  description:
    'Ship an editable source theme with a generated palette that apps copy into their code and build.',
  sections: [
    {
      id: 'add-a-theme',
      title: 'Add a theme',
      content: [
        {
          type: 'prose',
          text: 'Run `integration add theme` with a lowercase kebab-case slug. It writes the theme source and its descriptor into a folder named after the slug.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx integration add theme ocean',
        },
        {
          type: 'code',
          lang: 'text',
          code: `theme contribution added

[ok] ocean

Declare theme root ./themes in astryx.integration.mjs.

- themes/ocean/oceanTheme.ts
- themes/ocean/oceanTheme.doc.mjs
- package.json
- astryx.integration.mjs`,
        },
        {
          type: 'prose',
          text: "`oceanTheme.ts` exports `oceanTheme`, a `defineTheme` source. `oceanTheme.doc.mjs` describes it with `type: 'theme'`, `name`, `displayName`, `description`, and `maintained`; `theme list` shows its `name`, `description`, and `maintained`. Every field is in {@link generic:authoring}.",
        },
        {
          type: 'prose',
          text: 'The whole `themes/ocean/` folder is what ships and what an app copies, so a theme needs no `exports` entry. When package.json has a `files` list, add puts `themes` and `astryx.integration.mjs` in it. It also declares the optional `@astryxdesign/cli` peer that reads themes; see {@link generic:versioning}.',
        },
      ],
    },
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
    {
      id: 'use-the-palette',
      title: 'Use the palette in the theme',
      content: [
        {
          type: 'prose',
          text: 'Import the palette in `oceanTheme.ts` and point theme tokens at its stops. Each token takes a `[light, dark]` pair.',
        },
        {
          type: 'code',
          lang: 'ts',
          code: `// themes/ocean/oceanTheme.ts
import {defineTheme} from '@astryxdesign/core/theme';
import {palette} from './tokens/ocean.palette';

const {light, dark} = palette.ocean;

export const oceanTheme = defineTheme({
  name: 'ocean',
  tokens: {
    '--color-accent': [light['45'], dark['70']],
  },
});`,
        },
        {
          type: 'prose',
          text: 'Local imports must stay inside the theme folder. One that leaves it, such as `../../shared/colors`, fails with `invalid_theme`, and the theme disappears from `theme list`. `npx astryx theme template` writes a file that explains every `defineTheme` field.',
        },
        {
          type: 'prose',
          text: 'The theme imports `@astryxdesign/core/theme`, so declare Core as a peer dependency, with the range of Core versions you test the theme against. `integration add theme` already declared the optional `@astryxdesign/cli` peer that reads themes:',
        },
        {
          type: 'code',
          lang: 'json',
          code: `"peerDependencies": {
  "@astryxdesign/core": "^0.7.0",
  "@astryxdesign/cli": ">=0.7.0"
},
"peerDependenciesMeta": {
  "@astryxdesign/cli": {"optional": true}
}`,
        },
      ],
    },
    {
      id: 'use-a-theme-in-an-app',
      title: 'Use the theme in an app',
      content: [
        {
          type: 'prose',
          text: 'An app lists your theme, copies its folder into its own source, and builds it. The copy belongs to the app, which can edit it.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx theme list
npx astryx theme add ocean --package @acme/astryx-widgets
npx astryx theme build src/themes/ocean/oceanTheme.ts`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `[ok] Added Ocean theme from @acme/astryx-widgets to src/themes/ocean/

- src/themes/ocean/oceanTheme.ts
- src/themes/ocean/oceanTheme.doc.mjs
- src/themes/ocean/palette.config.json
- src/themes/ocean/tokens/ocean.palette.receipt.json
- src/themes/ocean/tokens/ocean.palette.ts`,
        },
        {
          type: 'prose',
          text: '`theme list` shows `ocean (maintained, @acme/astryx-widgets)`. When two packages ship the slug `ocean`, `theme add ocean` fails until the app passes `--package`. `theme build` writes `ocean.css`, `ocean.js`, and `ocean.d.ts` beside the source.',
        },
      ],
    },
    {
      id: 'themes-on-older-clis',
      title: 'Fix missing themes on older CLIs',
      content: [
        {
          type: 'prose',
          text: 'A stable `@astryxdesign/cli` before 0.7.0 cannot list or add your themes. On such a CLI, the themes are missing:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A CLI from before the `themes` field ignores it with an `unknown_manifest_key` warning and loads the rest of the manifest.',
            'Some stable 0.6 CLIs, such as 0.6.3, read `themes` in an older layout. They report `invalid_theme`, and they also hide your doc topics.',
          ],
        },
        {
          type: 'prose',
          text: 'The fix is the same in both cases: the app upgrades `@astryxdesign/cli`. Your optional `@astryxdesign/cli` peer makes npm warn an app that installs your package next to an older CLI, and `integration verify` fails without it. See {@link generic:versioning}.',
        },
      ],
    },
  ],
};
