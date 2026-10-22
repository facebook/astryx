// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs build-a-page`: the outside-in layout guides, from template to breakpoints.
 */

/** @type {import('@astryxdesign/cli/authoring').NamespaceDoc} */
export const docs = {
  type: 'namespace',
  name: 'build-a-page',
  title: 'Build a page',
  summary:
    'Start from a template, lay it out outside-in, add blocks, adapt across widths.',
  keywords: [
    'build a page',
    'page',
    'layout',
    'scaffold',
    'structure',
    'responsive',
    'AppShell',
    'SideNav',
    'TopNav',
    'hasDivider',
    'MobileNav',
    'contentWidth',
    'template',
    'dashboard',
    'page shell',
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
      text: 'Begin with `astryx build "<idea>"`: it names the closest page template, and `astryx template <name>` prints its source. Then work outside-in.',
    },
    {
      type: 'list',
      style: 'ordered',
      items: [
        'Scaffold: pick the shell, budget each region, and choose navigation',
        "Structure: rank each region's content and choose its container",
        'Spacing: align each region to one content line, then set gaps and density',
        'Breakpoints: decide what each region does as width changes',
      ],
    },
    {
      type: 'prose',
      text: 'Settle the shell and its region budgets before any content exists. Content-first layouts drift into a padded column of cards, because every section invents its own container. This guide decides layout; {@link namespace:find-a-component} picks the parts.',
    },
  ],
};
