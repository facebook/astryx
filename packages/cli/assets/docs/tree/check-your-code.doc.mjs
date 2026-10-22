// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs check-your-code`: doctor, then a review of the page against the rules.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'check-your-code',
  title: 'Check your code',
  summary: 'Check a page before you ship.',
  keywords: [
    'check',
    'review',
    'lint',
    'audit',
    'quality',
    'before shipping',
    'ship',
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
      text: 'Run `astryx doctor` first: it checks setup and versions ({@link generic:doctor}). Then judge the page itself with the evidence-backed review in {@link generic:agent-review}.',
    },
    {
      type: 'prose',
      text: 'The rules and anti-patterns it applies live in {@link generic:principles}.',
    },
  ],
};
