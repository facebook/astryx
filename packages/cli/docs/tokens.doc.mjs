/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'tokens',
  title: 'XDS Design Tokens',
  description: 'Spacing, color, radius, typography, and elevation token reference.',

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
            ['--size-sm', '28px', 'Compact controls'],
            ['--size-md', '32px', 'Default control size'],
            ['--size-lg', '36px', 'Larger, more prominent controls'],
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
            ['--color-surface', 'Background surface'],
            ['--color-wash', 'Secondary background'],
            ['--color-positive', 'Success states'],
            ['--color-negative', 'Error states'],
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
            ['--color-text-link', 'Link text'],
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
          type: 'table',
          headers: ['Token', 'Value', 'Usage'],
          rows: [
            ['--radius-rounded', '9999px', 'Pills, avatars'],
            ['--radius-3', '12px', 'Cards, modals'],
            ['--radius-2', '8px', 'Buttons, inputs'],
            ['--radius-1', '4px', 'Small elements'],
            ['--radius-0', '0px', 'No radius'],
          ],
        },
      ],
    },
    {
      title: 'Elevation Tokens',
      content: [
        {
          type: 'table',
          headers: ['Token', 'Usage'],
          rows: [
            ['--elevation-base', 'Subtle shadow'],
            ['--elevation-menu', 'Dropdowns, menus'],
            ['--elevation-dialog', 'Modals, dialogs'],
            ['--elevation-hover', 'Hover states'],
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
            '--font-body: System UI font stack',
            '--font-code: Monospace font stack',
            '--font-heading: System UI font stack',
          ],
        },
        {
          type: 'table',
          headers: ['Token', 'Value'],
          rows: [
            ['--text-4xs', '8px'],
            ['--text-3xs', '10px'],
            ['--text-2xs', '11px'],
            ['--text-xsm', '12px'],
            ['--text-sm', '13px'],
            ['--text-base', '14px (default)'],
            ['--text-lg', '16px'],
            ['--text-xl', '18px'],
            ['--text-2xl', '20px'],
            ['--text-3xl', '24px'],
            ['--text-4xl', '32px'],
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
            ['--leading-base', '1.4286', 'Body text with --text-base'],
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
    backgroundColor: colorVars['--color-surface'],
    borderRadius: radiusVars['--radius-3'],
  },
  button: {
    height: sizeVars['--size-md'],
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
    backgroundColor: 'var(--color-surface)',
    borderRadius: 'var(--radius-3)',
  },
});`,
        },
      ],
    },
  ],
};
