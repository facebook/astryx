// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/components/see-it-in-an-app`: inspect an
 * integration component from an app that installs the package.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'see-it-in-an-app',
  placement: {parent: 'namespace:components', slot: 'guides', order: 40},
  title: 'See it in an app',
  category: 'guide',
  description:
    'Confirm that an app discovers the component, its package, its public import, and its documentation.',
  sections: [
    {
      id: 'read-the-installed-component',
      title: 'Read the installed component',
      content: [
        {
          type: 'prose',
          text: 'An app that installs your package sees the component beside Core components, with its package name and public import. The app needs no config.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: `npx astryx component AcmeCarousel
npx astryx component --list
npx astryx search carousel`,
        },
        {
          type: 'code',
          lang: 'text',
          code: `package: @acme/astryx-widgets

# AcmeCarousel

Cycles through slides one at a time. Use it for a small set of related cards.

**Import:** \`import {AcmeCarousel} from '@acme/astryx-widgets/components/AcmeCarousel';\``,
        },
        {
          type: 'prose',
          text: '`component --list` shows it as `import: @acme/astryx-widgets/components/AcmeCarousel  [@acme/astryx-widgets]`. The same commands work in your package while you build it.',
        },
      ],
    },
    {
      id: 'test-the-packed-package',
      title: 'Test the packed package',
      content: [
        {
          type: 'prose',
          text: 'Install the packed package in a test app before publishing. Then run the same detail, list, and search commands there. See {@link generic:test-in-an-app}.',
        },
      ],
    },
  ],
};
