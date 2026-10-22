// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs fix-a-problem`: what a message means, and how to report a gap.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'fix-a-problem',
  title: 'Fix a problem',
  summary: "Find the message and fix it; report what's missing.",
  keywords: ['problem', 'fix', 'broken', 'bug'],
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
      text: 'Most messages name their fix. Global-install messages are explained one by one in {@link generic:global-mode-messages}; integration messages are in {@link generic:troubleshooting}.',
    },
    {
      type: 'prose',
      text: 'Something Astryx lacks? File it with `astryx gap-report` ({@link generic:report-a-gap}).',
    },
  ],
};
