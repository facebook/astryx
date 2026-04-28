/**
 * @file Theme documentation — colocated with the package so it can be
 *       published together and discovered by scripts/sync-templates.js.
 *
 * Only specify what cannot be inferred from the defineTheme() call.
 * Tokens, component overrides, and variant displays are auto-generated
 * from the theme object at build time.
 */

export const doc = {
  description:
    'The reference theme for XDS. Clean and professional with a blue accent, system fonts, and Heroicons. Designed to work out of the box with zero configuration.',
  characteristics: [
    {
      label: 'Typography',
      value: 'System fonts',
      detail: 'Scale base 14px, ratio 1.2',
    },
    {label: 'Icons', value: 'Heroicons', detail: 'Outline + solid variants'},
    {
      label: 'Accent',
      value: 'Blue (#0066FF)',
      detail: 'Semantic color palette',
    },
    {
      label: 'Radius',
      value: 'Standard',
      detail: 'element 8px, container 12px',
    },
    {
      label: 'Motion',
      value: 'Balanced',
      detail: 'fast 175ms, medium 410ms, slow 975ms',
    },
    {label: 'Syntax', value: 'GitHub theme', detail: 'Light + dark variants'},
  ],
};
