// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs get-started`: the first of the twelve guides. Install Astryx in a project or on a computer, then render one component.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'get-started',
  title: 'Get started',
  summary:
    'Add Astryx to a project, your computer, or your agent, and render a first component.',
  keywords: [
    'get started',
    'getting started',
    'set up',
    'new project',
    'first component',
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
      text: 'Three ways in: a project ({@link generic:add-to-a-project}), your whole computer ({@link namespace:on-your-computer}), or a coding agent ({@link namespace:work-with-agents}). Most people start with a project. The rules every component follows: {@link generic:principles}.',
    },
    {
      type: 'prose',
      text: 'Next: {@link namespace:build-a-page} turns an idea into a page, and {@link namespace:find-a-component} names the part for each job.',
    },
  ],
};
