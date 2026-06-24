// Copyright (c) Meta Platforms, Inc. and affiliates.

/** @type {import('./src/docs-types').GroupDoc} */

/**
 * @file Group metadata for component categories that are not themselves components.
 *
 * Groups like "Checkbox" and "Layout" are category labels that cluster
 * related components. This file defines the canonical component for each
 * group — the one the docsite links to when a user clicks the group name.
 *
 * Groups whose name matches a component (Avatar, Button, Dialog, etc.)
 * don't need an entry here — the component is the canonical representative.
 *
 * Import: `import {GROUP_DOCS} from '@astryxdesign/core/groups.doc.mjs'`
 * Or dynamically: `const {GROUP_DOCS} = await import('@astryxdesign/core/groups.doc.mjs')`
 */

/** @type {Record<string, import('./src/docs-types').GroupDoc>} */
export const GROUP_DOCS = {
  Chat: {
    name: 'Chat',
    canonical: 'ChatComposer',
    description:
      'Conversational messaging primitives for building chat UIs, AI assistants, and threaded conversations.',
  },
  Checkbox: {
    name: 'Checkbox',
    canonical: 'CheckboxList',
    description:
      'Selection controls for choosing one or more options from a set.',
  },
  Layout: {
    name: 'Layout',
    canonical: 'Stack',
    description:
      'Structural primitives for arranging and spacing content on a page.',
  },
  Radio: {
    name: 'Radio',
    canonical: 'RadioList',
    description:
      'Selection controls for choosing exactly one option from a set.',
  },
  Tabs: {
    name: 'Tabs',
    canonical: 'TabList',
    description:
      'Tabbed navigation for switching between content views without a page reload.',
  },
  Utilities: {
    name: 'Utilities',
    canonical: 'Theme',
    description:
      'Providers and configuration components for theming, routing, and rendering context.',
  },
};
