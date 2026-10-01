// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/components/replace-a-core-component`:
 * intentionally make an integration component the default for a Core identity.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'replace-a-core-component',
  placement: {parent: 'namespace:components', slot: 'guides', order: 50},
  title: 'Replace a Core component',
  category: 'guide',
  description:
    'Use a component replacement only when an integration must intentionally own a Core component identity.',
  sections: [
    {
      id: 'decide-whether-to-replace',
      title: 'Decide whether to replace',
      content: [
        {
          type: 'prose',
          text: 'Most components should not use `replaces`. Give a new component its own name and let apps choose it explicitly. Replace Core only when your component must become the default for one Core identity everywhere the integration is active.',
        },
        {type: 'heading', level: 3, text: 'Use it when'},
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Your component intentionally serves the same role as one specific Core component.',
            'Every app that loads the integration should get your component from unqualified component detail, lists, search, swizzle, and issue routing.',
            'You have tested both the replacement and explicit access to the original Core component.',
          ],
        },
        {type: 'heading', level: 3, text: 'Do not use it when'},
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Your component is an alternative, variant, wrapper, or product-specific extension. Give it a unique name instead.',
            'You only need to resolve an accidental name collision.',
            'You want the replacement in only one screen or workflow. Replacement applies across the app wherever the integration is active.',
          ],
        },
      ],
    },
    {
      id: 'set-the-replacement',
      title: 'Set the replacement',
      content: [
        {
          type: 'code',
          lang: 'javascript',
          label: 'components/AcmeSideNav.doc.mjs',
          code: `/** @type {import('@astryxdesign/cli/authoring').ComponentDoc} */
export default {
  type: 'component',
  name: 'AcmeSideNav',
  displayName: 'Acme Side Nav',
  replaces: 'SideNav',
  import: '@acme/astryx-widgets/components/AcmeSideNav',
  usage: {description: 'Product navigation for Acme apps.'},
  props: [],
};`,
        },
        {
          type: 'reference',
          target: 'schema:component-doc',
          projection: {fields: ['replaces']},
          presentation: 'full',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '`replaces` names the Core `ComponentDoc` identity, not its display label, import path, or a standalone hook.',
            'Your component may keep a distinct name or use the same name as the target. A distinct name remains directly addressable on older CLIs that ignore `replaces`.',
            '`--package @astryxdesign/core` always selects the original Core component.',
          ],
        },
      ],
    },
    {
      id: 'check-replacement-resolution',
      title: 'Check replacement resolution',
      content: [
        {
          type: 'code',
          lang: 'bash',
          code: 'npx astryx doctor integration components\nnpx astryx component SideNav\nnpx astryx component AcmeSideNav\nnpx astryx component SideNav --package @astryxdesign/core',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A missing target, invalid value, second replacement for one target in the same package, or a replacement named after a different Core component is an error.',
            'When several integrations replace one target, explicit configuration beats autolinking. Among explicitly configured integrations, the later package wins and Doctor warns.',
          ],
        },
      ],
    },
  ],
};
