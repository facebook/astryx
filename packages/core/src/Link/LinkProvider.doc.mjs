// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'LinkProvider',
  displayName: 'Link Provider',
  group: 'Utilities',
  category: 'Utility',
  isHiddenFromOverview: true,
  keywords: ['link', 'provider', 'router', 'nextjs', 'client-side-routing'],
  usage: {
    description: 'Wraps your app to replace the default <a> tag with a framework-specific link component (e.g. Next.js Link) for client-side routing across all Astryx components.',
  },
  props: [
    {name: 'component', type: 'LinkComponentType', required: true, description: 'Link component to use for all link elements in the subtree (e.g. Next.js Link).'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render with the link provider.'},
  ],
};

/** @type {import('../docs-types').TranslationDoc} */
export const docsDense = {
  description: 'Wraps app to replace default <a> tag w/ framework-specific link component (e.g. Next.js Link) for client-side routing across all Astryx components.',
  usage: {
    description: 'Wraps app to replace default <a> tag w/ framework-specific link component (e.g. Next.js Link) for client-side routing across all Astryx components.',
  },
  propDescriptions: {
    component: 'link component for all link elements in subtree (e.g. Next.js Link)',
  },
};
