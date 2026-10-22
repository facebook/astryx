// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs find-a-component`: a job-to-component map, plus how to search and read the catalog.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'find-a-component',
  title: 'Find a component',
  summary: 'Pick the right component for a job and read its props.',
  keywords: [
    'which component',
    'component for',
    'pick a component',
    'choose a component',
    'find a component',
    'by job',
    'catalog',
    'component list',
    'props',
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
      text: 'Look up the job in {@link generic:by-job}, then read the component with `astryx component <Name> --dense`. No row fits? `astryx search "<what it does>"` ranks components, hooks, templates, and docs together.',
    },
    {
      type: 'prose',
      text: 'Read several at once, or pick one projection of a component, with {@link generic:search-and-read}. A missing component is worth reporting: {@link generic:report-a-gap}.',
    },
  ],
};
