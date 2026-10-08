// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/templates`: guides for adding,
 * documenting, packaging, and testing templates in an integration package.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'templates',
  placement: {parent: 'namespace:building-blocks', slot: 'guides', order: 20},
  title: 'Templates',
  summary:
    'Templates are ready-made UI pages or page sections built with Astryx. Apps copy them into their code and adapt them to their product.',
  keywords: [
    'integration template',
    'template quality',
    'template grading',
    'template assets',
    'template package',
    'replace a core template',
  ],
  slots: {
    build: {
      title: 'Build',
      accepts: {kinds: ['generic', 'namespace']},
    },
    quality: {
      title: 'Quality',
      accepts: {kinds: ['namespace']},
    },
  },
};
