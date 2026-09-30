// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components/describe-the-component/component-doc-overview`:
 * keep component metadata accurate and inspect what consumers receive.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'component-doc-overview',
  placement: {
    parent: 'namespace:describe-the-component',
    slot: 'guides',
    order: 10,
  },
  title: 'Component doc overview',
  category: 'guide',
  description:
    'Treat the component doc as a public contract, keep it synchronized with source, and inspect the result consumers receive.',
  sections: [
    {
      id: 'treat-the-doc-as-public-api',
      title: 'Treat the doc as public API',
      content: [
        {
          type: 'prose',
          text: 'A component\'s `.doc.mjs` is part of the integration\'s public contract, not optional commentary. Astryx uses it for CLI output and search. People and agents use it to decide whether the component fits and how to use it. Its accuracy directly affects whether the integration is discovered and used correctly.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Change the source and its `.doc.mjs` together.',
            'Update the doc whenever the public name, import, behavior, props, defaults, examples, or accessibility requirements change.',
            '`integration verify` checks the doc shape and packed import, but it cannot prove that the prose still matches the component.',
          ],
        },
      ],
    },
    {
      id: 'fill-in-the-shared-fields',
      title: 'Fill in the shared fields',
      content: [
        {
          type: 'prose',
          text: 'Every component doc has one stable identity and enough usage guidance for a reader to choose it correctly. The next guides add the shape-specific fields for one component, a family, or a subcomponent.',
        },
        {
          type: 'reference',
          target: 'schema:component-doc',
          projection: {
            fields: [
              'type',
              'name',
              'displayName',
              'import',
              'keywords',
              'usage',
              'examples',
            ],
          },
          presentation: 'full',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Start with the normal component doc in {@link generic:single-component}.',
            'Adapt it with `components` when one family owns several public exports ({@link generic:component-family}).',
            'Move one family member into a sibling doc with `subComponentOf` when it needs independent documentation ({@link generic:subcomponent}).',
          ],
        },
      ],
    },
    {
      id: 'read-the-doc-back',
      title: 'Read the doc back',
      content: [
        {
          type: 'prose',
          text: 'After every source or doc change, read the component back. This output is what people and agents receive.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx component AcmeCarousel',
        },
      ],
    },
  ],
};
