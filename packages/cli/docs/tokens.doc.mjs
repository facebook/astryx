/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'tokens',
  title: 'XDS Design Tokens',
  description: 'Spacing, color, radius, typography, and shadow token reference.',

  sections: [
    {
      title: 'Spacing Tokens',
      content: [
        {
          type: 'prose',
          text: 'All design tokens are defined in packages/core/src/theme/tokens.stylex.ts. Component gap props use space0-space12 which map to these tokens.',
        },
        {
          type: 'table',
          headers: ['Token', 'Value', 'Usage'],
          rows: [
            ['--spacing-0', '0px', 'No spacing'],
            ['--spacing-0-5', '2px', 'Hairline spacing'],
            ['--spacing-1', '4px', 'Tight spacing'],
            ['--spacing-2', '8px', 'Compact spacing'],
            ['--spacing-3', '12px', 'Default small'],
            ['--spacing-4', '16px', 'Default medium'],
            ['--spacing-5', '20px', 'Comfortable'],
            ['--spacing-6', '24px', 'Loose'],
            ['--spacing-7', '28px', 'Semi-loose'],
            ['--spacing-8', '32px', 'Extra loose'],
            ['--spacing-9', '36px', 'Spacious'],
            ['--spacing-10', '40px', 'Extra spacious'],
            ['--spacing-11', '44px', 'Ultra spacious'],
            ['--spacing-12', '48px', 'Maximum spacing'],
          ],
        },
      ],
    },
    {
      title: 'Size Tokens',
      content: [
        {
          type: 'prose',
          text: 'Control heights for consistent sizing across buttons, inputs, and selectors.',
        },
        {
          type: 'table',
          headers: ['Token', 'Value', 'Usage'],
          rows: [
            ['--size-element-sm', '28px', 'Compact controls'],
            ['--size-element-md', '32px', 'Default control size'],
            ['--size-element-lg', '36px', 'Larger, more prominent controls'],
          ],
        },
      ],
    },
    {
      title: 'Color Tokens',
      content: [
        {
          type: 'prose',
          text: 'Semantic colors for consistent theming. All colors support light-dark() for automatic mode switching.',
        },
        {
          type: 'table',
          headers: ['Token', 'Usage'],
          rows: [
            ['--color-accent', 'Primary action color'],
            ['--color-background-surface', 'Background surface'],
            ['--color-background-body', 'Secondary background'],
            ['--color-success', 'Success states'],
            ['--color-error', 'Error states'],
            ['--color-warning', 'Warning states'],
          ],
        },
        {
          type: 'table',
          headers: ['Token', 'Usage'],
          rows: [
            ['--color-text-primary', 'Main text'],
            ['--color-text-secondary', 'Secondary text'],
            ['--color-text-disabled', 'Disabled text'],
            ['--color-text-accent', 'Link text'],
          ],
        },
        {
          type: 'table',
          headers: ['Token', 'Usage'],
          rows: [
            ['--color-icon-primary', 'Main icons'],
            ['--color-icon-secondary', 'Secondary icons'],
            ['--color-icon-disabled', 'Disabled icons'],
          ],
        },
      ],
    },
    {
      title: 'Radius Tokens',
      content: [
        {
          type: 'prose',
          text: 'Numeric scale based on a 4dp base unit. Tokens 1–4 scale with the theme\'s radius multiplier; tokens 0 and rounded are fixed.',
        },
        {
          type: 'table',
          headers: ['Token', 'Value', 'Usage', 'Scales'],
          rows: [
            ['--radius-none', '0px', 'No radius (dividers, table cells)', 'No'],
            ['--radius-inner', '4px', 'Code blocks, inner content', 'Yes'],
            ['--radius-element', '8px', 'Buttons, inputs, text areas', 'Yes'],
            ['--radius-container', '12px', 'Cards, modals, popovers, dropdowns', 'Yes'],
            ['--radius-page', '28px', 'Page sections, large containers', 'Yes'],
            ['--radius-full', '9999px', 'Badges, avatars, status dots, toggles', 'No'],
          ],
        },
        {
          type: 'prose',
          text: 'Use radius in defineTheme to generate all radius tokens from a base unit and multiplier: defineTheme({ radius: { base: 4, multiplier: 1.5 } }). Multiplier 0 = sharp, 1 = default, 1.5 = rounded, 2 = pill-like. Explicit token overrides take precedence over radius values.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'radius example',
          code: `import {defineTheme} from '@xds/core/theme';

// Rounded theme — all scalable radii increased by 50%
const roundedTheme = defineTheme({
  name: 'rounded',
  radius: { base: 4, multiplier: 1.5 },
});

// Sharp/brutalist theme — all scalable radii become 0
const sharpTheme = defineTheme({
  name: 'sharp',
  radius: { base: 4, multiplier: 0 },
  tokens: { '--radius-full': '0px' }, // even pills are sharp
});`,
        },
      ],
    },
    {
      title: 'Shadow Tokens',
      content: [
        {
          type: 'table',
          headers: ['Token', 'Usage'],
          rows: [
            ['--shadow-low', 'Subtle lift (cards, menus, popovers)'],
            ['--shadow-med', 'Hover lift, toasts'],
            ['--shadow-high', 'Dialogs, modals'],
            ['--shadow-inset-hover', 'Input hover ring'],
            ['--shadow-inset-selected', 'Input focused/active ring'],
            ['--shadow-inset-success', 'Input success ring'],
            ['--shadow-inset-warning', 'Input warning ring'],
            ['--shadow-inset-error', 'Input error ring'],
          ],
        },
      ],
    },
    {
      title: 'Typography Tokens',
      content: [
        {
          type: 'list',
          style: 'unordered',
          items: [
            '--font-family-body: System UI font stack',
            '--font-family-code: Monospace font stack',
            '--font-family-heading: System UI font stack',
          ],
        },
        {
          type: 'table',
          headers: ['Token', 'Value'],
          rows: [
            ['--font-size-4xs', '8px'],
            ['--font-size-3xs', '10px'],
            ['--font-size-2xs', '11px'],
            ['--font-size-xs', '12px'],
            ['--font-size-sm', '13px'],
            ['--font-size-base', '14px (default)'],
            ['--font-size-lg', '16px'],
            ['--font-size-xl', '18px'],
            ['--font-size-2xl', '20px'],
            ['--font-size-3xl', '24px'],
            ['--font-size-4xl', '32px'],
          ],
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            '--font-weight-normal: 400',
            '--font-weight-medium: 500',
            '--font-weight-semibold: 600',
            '--font-weight-bold: 700',
          ],
        },
        {
          type: 'table',
          headers: ['Token', 'Value', 'Usage'],
          rows: [
            ['--leading-tight', '1.25', 'Display text, headings'],
            ['--leading-snug', '1.375', 'Compact body text, headings'],
            ['--leading-base', '1.4286', 'Body text with --font-size-base'],
            ['--leading-normal', '1.5', 'Body text, large body'],
            ['--leading-relaxed', '1.625', 'Editorial body, reading text'],
          ],
        },
      ],
    },
    {
      title: 'Usage in StyleX',
      content: [
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using token imports',
          code: `import * as stylex from '@stylexjs/stylex';
import {colorVars, spacingVars, sizeVars, radiusVars} from '@xds/core';

const styles = stylex.create({
  card: {
    padding: spacingVars['--spacing-4'],
    backgroundColor: colorVars['--color-background-surface'],
    borderRadius: radiusVars['--radius-container'],
  },
  button: {
    height: sizeVars['--size-element-md'],
  },
});`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using CSS custom properties directly',
          code: `const styles = stylex.create({
  card: {
    padding: 'var(--spacing-4)',
    backgroundColor: 'var(--color-background-surface)',
    borderRadius: 'var(--radius-container)',
  },
});`,
        },
        {
          type: 'prose',
          text: 'See `npx xds docs styling` for how to apply tokens via xstyle, className, and compound component patterns. See `npx xds docs theme` for overriding tokens with defineTheme.',
        },
      ],
    },
  ],
};
