// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx docs cli/integrations/templates/template-quality`: the public
 * template quality target, score overview, and canonical grading vocabulary.
 *
 * @input Public template-quality rules for integration authors.
 * @output TEMPLATE_RUBRIC for grading tools and the quality overview for people
 *   and agents.
 * @position The single source of rubric version, grade bands, category ids, and
 *   weights. Detailed scoring rules live in the sibling grading-rubric guide.
 */

export const TEMPLATE_RUBRIC = Object.freeze({
  version: '1.4',
  minimumScore: 75,
  minimumGrade: 'B',
  grades: Object.freeze([
    Object.freeze({
      grade: 'A',
      min: 90,
      max: 100,
      meaning: 'Exemplary. Copy-ready with no known quality problems.',
    }),
    Object.freeze({
      grade: 'B',
      min: 75,
      max: 89,
      meaning: 'Good. Minor issues may remain, but the template is usable.',
    }),
    Object.freeze({
      grade: 'C',
      min: 60,
      max: 74,
      meaning: 'Needs work before publication.',
    }),
    Object.freeze({
      grade: 'D',
      min: 40,
      max: 59,
      meaning: 'Poor. Significant rewrites are needed.',
    }),
    Object.freeze({
      grade: 'F',
      min: 0,
      max: 39,
      meaning: 'Failing. The template teaches or produces bad patterns.',
    }),
  ]),
  categories: Object.freeze([
    Object.freeze({
      id: 'component_purity',
      title: 'Astryx component purity',
      max: 30,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'icon_purity',
      title: 'Icon purity',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'custom_css',
      title: 'Custom CSS',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'layout_structure',
      title: 'Layout & structure',
      max: 15,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'doc_metadata',
      title: 'Doc metadata',
      max: 10,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'image_handling',
      title: 'Image handling',
      max: 5,
      guide: 'template-grading-rubric',
    }),
    Object.freeze({
      id: 'code_quality',
      title: 'Code quality',
      max: 10,
      guide: 'template-grading-rubric',
    }),
  ]),
});

const gradeRows = TEMPLATE_RUBRIC.grades.map(({grade, min, max, meaning}) => [
  grade,
  `${min}-${max}`,
  meaning,
]);
const categoryRows = TEMPLATE_RUBRIC.categories.map(({title, max}) => [
  title,
  String(max),
]);

/** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} */
export const docs = {
  type: 'generic',
  name: 'template-quality',
  placement: {parent: 'namespace:templates', slot: 'quality', order: 10},
  title: 'Quality overview',
  category: 'guide',
  description:
    'Learn what makes a template useful, reliable, and ready to publish, and review those qualities throughout authoring.',
  sections: [
    {
      id: 'what-good-means',
      title: 'What good means',
      content: [
        {
          type: 'prose',
          text: 'A good template does more than render. It gives an app a clear product starting point that is easy to understand, safe to change, and complete after Astryx copies it out of the package.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Its purpose and primary task are clear before someone reads every detail.',
            'It composes Astryx components instead of rebuilding their behavior with raw HTML or custom styles.',
            'Its hierarchy, spacing, interactions, and reading order still work at narrow widths and in every supported color mode.',
            'Its source, imports, styles, fonts, icons, images, and media still work from the copied location.',
            'Its metadata makes the template easy to find and accurately explains when to use it.',
            'Its example content is realistic enough to expose overflow, empty-space, and hierarchy problems.',
          ],
        },
      ],
    },
    {
      id: 'understand-the-score',
      title: 'Understand the score',
      content: [
        {
          type: 'prose',
          text: `Template rubric ${TEMPLATE_RUBRIC.version} scores seven categories for 100 points. Aim for 100; ${TEMPLATE_RUBRIC.minimumGrade} (${TEMPLATE_RUBRIC.minimumScore}) is the publication floor, not the target. Never award points for anything you did not inspect.`,
        },
        {
          type: 'table',
          headers: ['Category', 'Points'],
          rows: categoryRows,
        },
        {
          type: 'table',
          headers: ['Grade', 'Score', 'Meaning'],
          rows: gradeRows,
        },
        {
          type: 'prose',
          text: 'Keep improving while a deduction has a reasonable fix. A score below 100 is fine only when the remaining tradeoff is intentional and recorded. A template is not ready if the copied file fails to build or a required asset is missing, whatever its score.',
        },
        {
          type: 'prose',
          text: `Version ${TEMPLATE_RUBRIC.version} counts public integration components as Astryx components and grades assets and imports after the copy. Record the version with every score so results stay comparable.`,
        },
      ],
    },
    {
      id: 'review-while-you-build',
      title: 'Review while you build',
      content: [
        {
          type: 'prose',
          text: 'Grade the first runnable version, again after each source, doc, dependency, or asset change, and in full before every release. Grade the source, doc, copied file, and rendered app together; none of them is enough alone.',
        },
        {
          type: 'list',
          style: 'ordered',
          items: [
            'Read every scoring rule in {@link generic:template-grading-rubric}.',
            'Fix publication blockers first, then every reasonable deduction.',
            'Repeat the full grade on the packed package in a clean app ({@link generic:test-template-in-app}).',
            'To have an agent grade and improve the template, use {@link generic:grade-template-with-agent}.',
          ],
        },
        {
          type: 'prose',
          text: 'Keep each scorecard with its package revision and rubric version.',
        },
      ],
    },
  ],
};
