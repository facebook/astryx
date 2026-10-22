// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs upgrade-and-migrate/earlier-theme-copies`: what the upgrade
 * does to themes an older `theme add` copied into the app.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'earlier-theme-copies',
  placement: {
    parent: 'namespace:upgrade-and-migrate',
    slot: 'guides',
    order: 20,
  },
  title: 'Earlier theme copies',
  category: 'guide',
  description:
    'Upgrade a theme that an older `theme add` copied into the app, and replace `ASTRYX_THEME`.',
  keywords: [
    'ASTRYX_THEME',
    'theme copy',
    'descriptor',
    'maintained: false',
    'unmigrated theme',
  ],
  sections: [
    {
      id: 'migrating-earlier-theme-copies',
      title: 'Migrating Earlier Theme Copies',
      content: [
        {
          type: 'prose',
          text: 'A theme copied by the released `theme add` stays app source. The upgrade does not move, delete, or rewrite it. It only writes the missing same-stem descriptor with `maintained: false`, so the copy becomes a local theme.',
        },
        {
          type: 'code',
          lang: 'bash',
          label: 'Add descriptors to earlier copies',
          code: 'astryx upgrade --from 0.6.4 --path . --apply',
        },
        {
          type: 'prose',
          text: 'Before the upgrade runs, theme commands skip a descriptor-less copy in `src/themes`. `theme list` and doctor name it as unmigrated and show the upgrade command. A script that meant to copy source now runs `theme eject` with the same arguments. A script that meant to make the app use a theme runs `theme add`.',
        },
        {
          type: 'prose',
          text: '`ASTRYX_THEME` is no longer read. Run `theme add <slug>` and `theme use <slug>` to choose the default in a generated app theme module. When that module exists, component metadata reads its recorded default theme. Without the module, the released `package.json#astryx.theme` lookup keeps its meaning.',
        },
      ],
    },
  ],
};
