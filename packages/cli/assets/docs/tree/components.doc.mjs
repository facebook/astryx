// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components`: guides for adding and
 * documenting components in an integration package.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'components',
  placement: {parent: 'namespace:integrations', slot: 'contribute', order: 10},
  title: 'Components',
  summary:
    'Add components to an integration, document their public contract, and make them work in every app that installs the package.',
  keywords: ['integration component', 'ship a component', 'component docs'],
  slots: {
    build: {
      title: 'Build',
      accepts: {kinds: ['generic', 'namespace']},
    },
    advanced: {
      title: 'Advanced',
      accepts: {kinds: ['generic']},
    },
  },
};
