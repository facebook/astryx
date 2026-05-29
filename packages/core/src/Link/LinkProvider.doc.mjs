// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('../docs-types').ComponentDoc} */

export const docs = {
  name: 'LinkProvider',
  displayName: 'Link Provider',
  group: 'Utilities',
  isHiddenFromOverview: true,
  keywords: ['link', 'provider', 'router', 'nextjs', 'client-side-routing'],
  usage: {
    description: 'Wraps your app to replace the default <a> tag with a framework-specific link component (e.g. Next.js Link) for client-side routing across all XDS components.',
  },
  props: [
    {name: 'component', type: 'XDSLinkComponentType', required: true, description: 'Link component to use for all link elements in the subtree (e.g. Next.js Link).'},
    {name: 'children', type: 'ReactNode', required: true, description: 'Content to render with the link provider.'},
  ],
};
