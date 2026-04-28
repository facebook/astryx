/** @type {import('../../core/src/docs-types').ReferenceDoc} */

export const docs = {
  name: 'theme-neutral',
  title: 'Neutral Theme',
  description:
    'A grayscale theme with modern aesthetics — oklch colors, Geist fonts, shadcn-inspired. Ships as @xds/theme-neutral.',

  sections: [
    {
      title: 'Overview',
      content: [
        {
          type: 'prose',
          text: 'The neutral theme is a desaturated, grayscale-first design language inspired by shadcn/ui and Tailwind conventions. It uses the oklch color space for perceptually uniform colors, Geist font family for body and headings, and snappier motion timing than the default theme.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Installation',
          code: `npm install @xds/theme-neutral`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Usage (runtime injection)',
          code: `import {XDSTheme} from '@xds/core';
import {neutralTheme} from '@xds/theme-neutral';

function App() {
  return (
    <XDSTheme theme={neutralTheme}>
      <YourApp />
    </XDSTheme>
  );
}`,
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Usage (pre-built CSS — better for SSR)',
          code: `import {XDSTheme} from '@xds/core';
import {neutralTheme} from '@xds/theme-neutral/built';
import '@xds/theme-neutral/theme.css';

function App() {
  return (
    <XDSTheme theme={neutralTheme}>
      <YourApp />
    </XDSTheme>
  );
}`,
        },
      ],
    },
    {
      title: 'Typography',
      content: [
        {
          type: 'prose',
          text: 'Uses the Geist font family for body and headings, and Geist Mono for code. Same modular scale as default (14px base, 1.2 ratio) but with bolder heading weights at h3/h4 for stronger subsection hierarchy.',
        },
        {
          type: 'table',
          headers: ['Property', 'Value'],
          rows: [
            ['Body font', 'Geist (with system fallbacks)'],
            ['Heading font', 'Geist (with system fallbacks)'],
            ['Code font', 'Geist Mono (with SF Mono, Monaco, Consolas fallbacks)'],
            ['Base size', '14px'],
            ['Scale ratio', '1.2 (minor third)'],
            ['h3 / h4 weight', 'Bold (vs default semibold)'],
          ],
        },
      ],
    },
    {
      title: 'Colors',
      content: [
        {
          type: 'prose',
          text: 'All colors use the oklch color space for perceptual uniformity. The palette is fully desaturated (chroma 0) for core UI, with chromatic colors reserved for status indicators and semantic highlights.',
        },
        {
          type: 'table',
          headers: ['Token', 'Light', 'Dark'],
          rows: [
            ['--color-accent', 'oklch(0.205 0 0) (near-black)', 'oklch(0.922 0 0) (near-white)'],
            ['--color-background-body', 'oklch(0.97 0 0)', 'oklch(0.269 0 0)'],
            ['--color-background-surface', 'oklch(1 0 0) (white)', 'oklch(0.145 0 0) (near-black)'],
            ['--color-background-card', 'oklch(1 0 0)', 'oklch(0.205 0 0)'],
            ['--color-text-primary', 'oklch(0.145 0 0)', 'oklch(0.985 0 0)'],
            ['--color-text-secondary', 'oklch(0.556 0 0)', 'oklch(0.708 0 0)'],
            ['--color-border', 'oklch(0.922 0 0)', 'oklch(1 0 0 / 10%)'],
          ],
        },
        {
          type: 'prose',
          text: 'The accent color is the most distinctive choice: near-black in light mode, near-white in dark mode. This gives buttons and interactive elements a bold, high-contrast appearance without introducing color.',
        },
      ],
    },
    {
      title: 'Status Colors',
      content: [
        {
          type: 'prose',
          text: 'Status colors break the grayscale rule — they use chromatic oklch values to remain distinguishable. Each status color has a full-strength and a 20% muted variant.',
        },
        {
          type: 'table',
          headers: ['Status', 'Light', 'Dark'],
          rows: [
            ['Success', 'oklch(0.6 0.15 145)', 'oklch(0.7 0.15 145)'],
            ['Error', 'oklch(0.577 0.245 27)', 'oklch(0.704 0.191 22)'],
            ['Warning', 'oklch(0.828 0.189 84)', 'oklch(0.769 0.188 70)'],
          ],
        },
      ],
    },
    {
      title: 'Non-Semantic Colors',
      content: [
        {
          type: 'prose',
          text: 'The neutral theme provides a full palette of non-semantic colors for decorative use — badges, tags, charts, and categorical indicators. Each color has background, border, icon, and text variants.',
        },
        {
          type: 'list',
          style: 'unordered',
          items: [
            'Blue — oklch-based, medium chroma',
            'Cyan — teal-shifted for contrast with blue',
            'Gray — neutral palette, 50% opacity backgrounds',
            'Green — matches cyan hue range',
            'Orange — warm, high chroma',
            'Pink — vibrant, 303° hue',
            'Purple — shares pink values (by design)',
            'Red — matches error palette',
            'Teal — matches cyan palette',
            'Yellow — matches warning palette',
          ],
        },
      ],
    },
    {
      title: 'Radius',
      content: [
        {
          type: 'prose',
          text: 'Slightly larger radius values than the default theme, giving a softer, more rounded appearance.',
        },
        {
          type: 'table',
          headers: ['Token', 'Value'],
          rows: [
            ['--radius-none', '0.25rem'],
            ['--radius-inner', '0.375rem'],
            ['--radius-element', '0.625rem'],
            ['--radius-container', '0.75rem'],
            ['--radius-page', '1.75rem'],
            ['--radius-full', '9999px'],
          ],
        },
      ],
    },
    {
      title: 'Shadows',
      content: [
        {
          type: 'prose',
          text: 'Shadows use oklch-based opacity for consistency with the color system. Three elevation tiers plus inset variants for interactive states.',
        },
        {
          type: 'table',
          headers: ['Token', 'Description'],
          rows: [
            ['--shadow-low', 'Subtle lift — cards, sections'],
            ['--shadow-med', 'Medium elevation — popovers, dropdowns'],
            ['--shadow-high', 'Strong elevation — dialogs, modals'],
            ['--shadow-inset-hover', 'Blue inset ring for hover states'],
            ['--shadow-inset-selected', 'Blue inset ring for selected states'],
            ['--shadow-inset-success/warning/error', 'Status-colored inset rings'],
          ],
        },
      ],
    },
    {
      title: 'Motion',
      content: [
        {
          type: 'prose',
          text: 'Snappier timing than the default theme, aligned with shadcn/Tailwind conventions. Uses the same ratio-based system (0.75) but with lower base values.',
        },
        {
          type: 'table',
          headers: ['Tier', 'Min', 'Base', 'Max'],
          rows: [
            ['Fast', '95ms', '125ms', '165ms'],
            ['Medium', '225ms', '300ms', '400ms'],
            ['Slow', '525ms', '700ms', '935ms'],
          ],
        },
      ],
    },
    {
      title: 'Component Overrides',
      content: [
        {
          type: 'prose',
          text: 'The neutral theme applies targeted component overrides to reinforce the grayscale aesthetic.',
        },
        {
          type: 'table',
          headers: ['Component', 'Override', 'Value'],
          rows: [
            ['Button (secondary)', 'Border', '1px solid var(--color-border)'],
            ['Card', 'Padding', 'var(--spacing-3) (tighter than default)'],
            ['Section', 'Padding', 'var(--spacing-3) (tighter than default)'],
          ],
        },
        {
          type: 'prose',
          text: 'Heading and text component sizes are auto-generated by the typography scale. h3/h4 bold weights come from the typography.heading.weights configuration.',
        },
      ],
    },
    {
      title: 'Syntax Highlighting',
      content: [
        {
          type: 'prose',
          text: 'Code blocks use a desaturated, low-chroma syntax palette that harmonizes with the grayscale UI. Chromatic colors are reserved for semantic distinctions.',
        },
        {
          type: 'table',
          headers: ['Token', 'Light', 'Dark'],
          rows: [
            ['keyword', '#7c3aed (violet)', '#a78bfa'],
            ['string', '#16653a (green)', '#6ee7a0'],
            ['comment', '#71717a (gray)', '#71717a'],
            ['number', '#b45309 (amber)', '#fbbf24'],
            ['function', '#2563eb (blue)', '#60a5fa'],
            ['type', '#7c3aed (violet)', '#c4b5fd'],
            ['variable', '#18181b (near-black)', '#e4e4e7'],
            ['background', '#fafafa', '#0a0a0a'],
          ],
        },
      ],
    },
    {
      title: 'Icons',
      content: [
        {
          type: 'prose',
          text: 'The neutral theme ships with its own icon registry (neutralIconRegistry) which uses the same semantic icon names but may include visual variants tuned to the grayscale aesthetic.',
        },
        {
          type: 'code',
          lang: 'tsx',
          label: 'Using themed icons',
          code: `import {XDSIcon} from '@xds/core/Icon';

// Icons resolve from the neutral theme's registry
<XDSIcon name="check" />
<XDSIcon name="chevron-down" />
<XDSIcon name="search" />`,
        },
      ],
    },
  ],
};
