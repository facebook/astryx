// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/building-blocks/themes/themes-on-older-clis`:
 * why themes are missing on a stable CLI before 0.7.0, and the fix.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'themes-on-older-clis',
  placement: {parent: 'namespace:themes', slot: 'guides', order: 70},
  title: 'Fix missing themes on older CLIs',
  category: 'guide',
  description:
    'Why themes are missing on a stable CLI before 0.7.0, and how an app fixes it.',
  sections: [
    {
      id: 'themes-on-older-clis',
      title: 'Fix missing themes on older CLIs',
      content: [
        {
          type: 'prose',
          text: 'A stable `@astryxdesign/cli` before 0.7.0 cannot list or add your themes. On such a CLI, the themes are missing:',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'A CLI from before the `themes` field ignores it with an `unknown_manifest_key` warning and loads the rest of the manifest.',
            'Some stable 0.6 CLIs, such as 0.6.3, read `themes` in an older layout. They report `invalid_theme`, and they also hide your doc topics.',
          ],
        },
        {
          type: 'prose',
          text: 'The fix is the same in both cases: the app upgrades `@astryxdesign/cli`. Your optional `@astryxdesign/cli` peer makes npm warn an app that installs your package next to an older CLI, and `integration verify` fails without it. See {@link generic:versioning}.',
        },
      ],
    },
  ],
};
