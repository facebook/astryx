// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs layout`: the layout namespace. A root of the docs tree
 * that groups the outside-in layout guides: scaffold, structure,
 * headers-and-panels, spacing, and responsive.
 *
 * The flat layout topic this replaces was a 22 KB monolith. Each child guide
 * now answers one question and is findable by search on its own.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'layout',
  title: 'Layout',
  summary:
    'Build an app layout outside-in: scaffold the regions, structure the content, tune the spacing, then adapt across widths.',
  keywords: [
    'layout',
    'scaffold',
    'structure',
    'spacing',
    'responsive',
    'AppShell',
    'SideNav',
    'TopNav',
  ],
  slots: {
    guides: {title: 'Guides', accepts: {kinds: ['generic']}},
  },
};
