// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs fix-a-problem/report-a-gap`: tell the package that owns a
 * component or area what is missing, with `astryx gap-report`.
 */

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'report-a-gap',
  placement: {parent: 'namespace:fix-a-problem', slot: 'guides', order: 30},
  title: 'Report a gap',
  category: 'guide',
  description:
    'Report a missing component, variant, or doc to the package that owns it with `astryx gap-report`.',
  keywords: [
    'gap report',
    'missing component',
    'feature request',
    'report',
    'request a component',
    'tell maintainers',
  ],
  sections: [
    {
      id: 'file-one',
      title: 'File a report',
      content: [
        {
          type: 'prose',
          text: 'When no component fits ({@link generic:by-job} and `astryx search` found nothing), build with what exists and report the gap, so the owner can close it. Name the component or area, a category, and what you needed.',
        },
        {
          type: 'code',
          lang: 'bash',
          code: 'astryx gap-report --list-categories\nastryx gap-report Table --category missing_variant \\\n  --reason "Needs sticky first column for wide data"',
        },
        {
          type: 'prose',
          text: 'Categories: missing_component, missing_variant, layout_gap, styling_gap, a11y_gap, api_friction, docs_gap, other.',
        },
      ],
    },
    {
      id: 'where-it-goes',
      title: 'Where it goes',
      content: [
        {
          type: 'prose',
          text: 'The report goes to the package that owns the component: an integration whose component replaces the Core one, else the one package that provides it, else Core. `--package` overrides that; `--to` picks one destination when several are listed. Delivery to a public issue tracker needs `--confirm-public`. Integration authors decide where their reports land: {@link generic:debug-and-gap-reports}. Every flag: {@link command:gap-report}.',
        },
      ],
    },
  ],
};
