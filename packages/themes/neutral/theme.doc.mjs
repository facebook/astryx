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
    'A muted, minimal theme with warm gray tones and desaturated colors. Uses Geist font for body and headings, Geist Mono for code, and Lucide icons. Ideal for productivity tools and developer-facing interfaces.',
  characteristics: [
    {
      label: 'Typography',
      value: 'Geist / Geist Mono',
      detail: 'Scale base 14px, ratio 1.2, h3/h4 bold',
    },
    {label: 'Icons', value: 'Lucide', detail: 'Outline style'},
    {label: 'Accent', value: 'Desaturated', detail: 'Full oklch color space'},
    {
      label: 'Radius',
      value: 'Larger',
      detail: 'element 10px, container 12px',
    },
    {
      label: 'Motion',
      value: 'Snappy',
      detail: 'fast 125ms, medium 300ms, slow 700ms',
    },
    {
      label: 'Syntax',
      value: 'Desaturated',
      detail: 'Matches grayscale palette',
    },
  ],
};
