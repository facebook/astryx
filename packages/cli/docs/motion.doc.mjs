/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'motion',
  title: 'Motion',
  description:
    'Duration and easing tokens for animations and transitions.',
  tokenCategory: 'duration',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'XDS motion tokens define timing in three bands: fast (micro-interactions like hover/press), medium (entrance/exit), and slow (continuous/looping). Each band has a base value with min/max variants derived from a consistent ratio.',
        },
      ],
    },
    {
      title: 'Duration',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Duration Tokens',
        },
      ],
    },
    {
      title: 'Easing',
      content: [
        {
          type: 'token-ref',
          topic: 'tokens',
          section: 'Easing Tokens',
        },
      ],
    },
    {
      title: 'Usage',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Applying motion tokens',
          code: `import {durationVars, easeVars} from '@xds/core';

const styles = stylex.create({
  fadeIn: {
    transitionProperty: 'opacity',
    transitionDuration: durationVars['--duration-fast'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
  slideUp: {
    transitionProperty: 'transform, opacity',
    transitionDuration: durationVars['--duration-medium'],
    transitionTimingFunction: easeVars['--ease-standard'],
  },
});`,
        },
      ],
    },
    {
      title: 'Best Practices',
      content: [
        {
          type: 'list',
          style: 'do',
          items: [
            'Use fast durations for state changes (hover, press, toggle).',
            'Use medium durations for element entrance/exit (dialogs, dropdowns).',
            'Use slow durations sparingly — only for continuous animations (loading spinners, progress bars).',
          ],
        },
        {
          type: 'list',
          style: 'dont',
          items: [
            'Use slow durations for interactive feedback — users will perceive lag.',
            'Skip easing on transitions — linear motion feels robotic.',
          ],
        },
      ],
    },
  ],
};
