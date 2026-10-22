// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs style-components`: CSS setup, per-component styling, and styling-library interop.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'style-components',
  title: 'Style components',
  summary: 'Set up CSS and customize a component, with any styling library.',
  keywords: [
    'css setup',
    'xstyle',
    'className',
    'override',
    'customize',
    'Panda',
    'Chakra',
    'MUI',
    'Emotion',
    'styled-components',
    'CSS Modules',
    'interop',
  ],
  slots: {
    guides: {
      title: 'Guides',
      accepts: {
        kinds: ['generic', 'namespace'],
      },
    },
  },
  blocks: [
    {
      type: 'prose',
      text: 'First wire the stylesheets for your path (plain CSS, Tailwind, or StyleX): {@link generic:css-setup}. Then change how one component looks with `xstyle`, `className`, or compound parts: {@link generic:styling-basics} and {@link generic:styling-advanced}.',
    },
    {
      type: 'prose',
      text: 'Using another styling library? Tailwind, Panda, Chakra, MUI, CSS-in-JS, and non-CSS renderers each read the same tokens; their guides follow below.',
    },
  ],
};
