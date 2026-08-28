// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */

export const docs = {
  name: 'color',
  title: 'Color',
  category: 'foundations',
  description:
    'Semantic color tokens for surfaces, text, icons, borders, and status indicators.',
  tokenCategory: 'color',

  sections: [
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Colors are semantic: tokens describe purpose, not appearance. Every color adapts automatically between light and dark modes via CSS light-dark(). Themes override the resolved values, so your code never references raw hex colors.',
        },
        {
          type: 'prose',
          text: 'Theme packages may expose approved tonal palettes as authoring metadata. Agents and application code should still choose semantic tokens first. Palette stops are a controlled fallback for theme definitions, custom visualizations, and gaps where no semantic role fits—not permission to choose arbitrary colors.',
        },
      ],
    },
    {
      title: 'Surface Colors',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Layered surface hierarchy: body → surface → card → popover. Each level sits visually above the previous one.',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Color Tokens',
        },
      ],
    },
    {
      title: 'Usage',
  category: 'foundations',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Applying color tokens',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars} from '@astryxdesign/core/theme/tokens.stylex';

const styles = stylex.create({
  container: {
    backgroundColor: colorVars['--color-background-surface'],
    color: colorVars['--color-text-primary'],
    borderColor: colorVars['--color-border'],
  },
  accent: {
    color: colorVars['--color-text-accent'],
  },
});`,
        },
      ],
    },
    {
      title: 'Best Practices',
  category: 'foundations',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Use semantic tokens (--color-text-primary) instead of raw hex values.',
            'When authoring a theme and no semantic token fits, use an exact stop from its approved palette and record the family, tone, and contrast relationship.',
            'Rely on the surface hierarchy (body → surface → card → popover) for layering.',
            'Use status colors (success, error, warning) only for their semantic meaning.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            "Hardcode hex values, since they won't adapt to dark mode or custom themes.",
            'Invent or approximate a color when the active theme exposes an approved palette stop for that role.',
            'Mix accent colors with status colors in the same context.',
            'Use --color-on-accent on non-accent backgrounds.',
          ],
        },
      ],
    },
  ],
};
