// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('@astryxdesign/cli/authoring').ReferenceTranslationDoc} */

export const docsDense = {
  description: 'use + create themes: see use-a-theme and author-a-theme.',
  sections: [
    {
      section: 'Wrap your app in a theme',
      title: 'Quick start',
      content: [
        {type: 'prose', text: "Install a theme, wrap in `<Theme>` (`import {Theme} from '@astryxdesign/core'`). {@link generic:use-a-theme} for full guide."},
      ],
    },
    {
      section: 'Create a custom theme',
      title: 'Custom themes',
      content: [
        {type: 'prose', text: '`defineTheme` + token overrides + component overrides. {@link generic:author-a-theme} for full guide.'},
      ],
    },
    {
      section: 'Dark mode',
      title: 'Dark mode',
      content: [
        {type: 'prose', text: "[light, dark] tuples, mode='system'. {@link generic:use-a-theme} for full guide."},
      ],
    },
    {
      section: 'Integration themes',
      title: 'Integration themes',
      content: [
        {type: 'prose', text: 'Install integration, `astryx theme add`. {@link generic:use-a-theme} for full guide.'},
      ],
    },
  ],
};
