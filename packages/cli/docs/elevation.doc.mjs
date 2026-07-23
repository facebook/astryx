// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'elevation',
  title: 'Elevation',
  category: 'foundations',
  description:
    'Shadow tokens for visual elevation and inset state rings.',
  tokenCategory: 'shadow',

  sections: [
    {
      title: 'Overview',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Elevation tokens create depth through box-shadow. Three levels (low, med, high) establish a visual hierarchy for floating elements. Inset shadows provide focus and selection rings for interactive components.',
        },
      ],
    },
    {
      title: 'Elevation Scale',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Each level adds stronger offset and spread. Shadow color adapts to dark mode automatically via light-dark().',
        },
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Shadow Tokens',
        },
      ],
    },
    {
      title: 'The elevation prop',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'Configurable surfaces expose a single `elevation` prop instead of asking consumers to hand-write a box-shadow. It takes the graded enum `none | low | med | high`, narrowed per component to the steps that surface needs: Card, ClickableCard, SelectableCard, Button, IconButton, ButtonGroup, Thumbnail, and Banner expose the full scale, while ChatComposer exposes only `none | low`. `none` is a flat literal (`box-shadow: none`); the other levels map to the `--shadow-*` tokens above, so a surface stays theme-agnostic.',
        },
        {
          type: 'prose',
          text: 'Prop defaults preserve current appearance: every surface defaults to `none` except ChatComposer, which defaults to `low` to keep its raised look. Set `elevation="none"` to flatten it. Thumbnail keeps its existing hover-only shadow at the `none` default.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Raising a surface with the elevation prop',
          code: `// Flat by default — raise only when the surface needs to float.
<Card elevation="low">Raised card</Card>

// A floating action button.
<IconButton icon={<Icon icon="add" />} label="New" variant="primary" elevation="med" />

// Flatten the composer (defaults to 'low').
<ChatComposer elevation="none" onSubmit={handleSubmit} />`,
        },
        {
          type: 'prose',
          text: 'Always float — no prop: intrinsic overlays (Dialog, Popover, Tooltip, Toast, HoverCard, DropdownMenu, and the components that compose them) bake their elevation in and never expose the prop. Flow content (inputs, Text, layout) is never elevated; input fields use inset rings, which are a separate concept from elevation.',
        },
      ],
    },
    {
      title: 'Usage',
  category: 'foundations',
      content: [
        {
          type: 'prose',
          text: 'When building a custom surface, read elevation from the token scale rather than a hand-rolled shadow — the same tokens the elevation prop resolves to.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Applying elevation',
          code: `import {shadowVars} from '@astryxdesign/core';

const styles = stylex.create({
  dropdown: {
    boxShadow: shadowVars['--shadow-med'],
  },
  dialog: {
    boxShadow: shadowVars['--shadow-high'],
  },
  inputFocused: {
    boxShadow: shadowVars['--shadow-inset-selected'],
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
            'Reach for the `elevation` prop on a configurable surface before writing any custom shadow.',
            'Match elevation to interaction context: low for tooltips, med for dropdowns, high for dialogs.',
            'Use inset shadows for input focus/selection states; they compose better than outlines.',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Hand-write a `box-shadow` in app code — set the `elevation` prop or read `shadowVars` instead.',
            'Stack multiple elevation levels on the same element.',
            'Use elevation shadows for decorative borders. Use --color-border tokens instead.',
          ],
        },
      ],
    },
  ],
};
