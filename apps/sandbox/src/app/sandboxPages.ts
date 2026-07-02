// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file sandboxPages.ts
 * @position Central registry of all sandbox pages, grouped by category.
 *
 * The "Templates" category is auto-populated from packages/cli/templates/
 * via `node scripts/sync-templates.js`. Each template has a template.doc.mjs
 * that provides metadata. The sync script generates a registry file at
 * src/generated/templateRegistry.ts.
 *
 * To add a new template:
 *   1. Create packages/cli/templates/<name>/page.tsx + template.doc.mjs
 *   2. Run `node scripts/sync-templates.js`
 *   3. It appears in the sandbox and CLI automatically
 *
 * To add a non-template sandbox page:
 *   1. Create the page under the appropriate route group
 *   2. Add an entry to the appropriate category below
 *
 * Note: hrefs use trailing slashes because the sandbox is a static export
 * with `trailingSlash: true` in next.config.mjs.
 */

import {templates as autoDiscoveredTemplates} from '../generated/templateRegistry';

export interface SandboxPage {
  /** Display name shown on the card */
  name: string;
  /** Route path (with trailing slash) */
  href: string;
  /** Short description shown below the name */
  description: string;
}

export interface SandboxCategory {
  /** Category label shown in the sidebar and page header */
  label: string;
  /** URL-friendly slug used for routing */
  slug: string;
  /** Short description of the category */
  description: string;
  /** Pages in this category */
  pages: SandboxPage[];
}

export const categories: SandboxCategory[] = [
  {
    label: 'Components & Patterns',
    slug: 'components-patterns',
    description:
      'Component demos, composition patterns, and interactive examples.',
    pages: [
      {
        name: 'Card Examples',
        href: '/pages/example-cards/',
        description: 'Astryx components showcased in realistic card compositions',
      },
      {
        name: 'Table Overview',
        href: '/pages/table-overview/',
        description: 'Data table patterns and configurations',
      },
      {
        name: 'Side Navigation',
        href: '/pages/navigation/',
        description: 'Side navigation layout patterns',
      },
      {
        name: 'Top Navigation',
        href: '/pages/topnav-menu/',
        description: 'Top navigation bar with menu integration',
      },
      {
        name: 'Mega Menu',
        href: '/pages/mega-menu/',
        description: 'Full-width dropdown navigation menu',
      },
      {
        name: 'Link Patterns',
        href: '/pages/polymorphic-link/',
        description: 'Flexible link component with router integration',
      },
      {
        name: 'Motion Examples',
        href: '/pages/motion-examples/',
        description:
          'Duration and easing tokens applied to common animation patterns',
      },
      {
        name: 'App Shell',
        href: '/pages/shell-lab/',
        description: 'Experiment with app shell layouts and navigation',
      },
      {
        name: 'Component Overview',
        href: '/pages/example/',
        description: 'General component composition examples',
      },
    ],
  },
  {
    label: 'Templates',
    slug: 'templates',
    description:
      'Full-page application templates — dashboards, forms, and data views built with Astryx.',
    pages: [
      ...autoDiscoveredTemplates.map(t => ({
        name: t.name,
        href: t.href,
        description: t.description,
      })),
    ],
  },
  {
    label: 'Themes',
    slug: 'themes',
    description: 'Theme palette previews and design token references.',
    pages: [
      {
        name: 'Neutral Palette',
        href: '/pages/neutral-palette/',
        description:
          'Neutral theme — pure grayscale spine, OKLCH categorical palette, vivid T60 semantic badges, soft T90 categorical pastels, Figtree typography',
      },
      {
        name: 'Stone Palette',
        href: '/pages/stone-palette/',
        description:
          'Stone theme tonal palettes, badges, banners, inputs, and buttons in light and dark mode',
      },
      {
        name: 'Y2K Palette',
        href: '/pages/y2k-palette/',
        description:
          'Y2K pop theme — sharp corners, cream body, neon lime accent, Crimson Text display type',
      },
      {
        name: 'Gothic Palette',
        href: '/pages/gothic-palette/',
        description:
          'Gothic dark-only theme — atmospheric blue-gray, distressed display heading, pastel categorical accents',
      },
      {
        name: 'Butter Palette',
        href: '/pages/butter-palette/',
        description:
          'Butter theme — golden buttery palette with blue accents, Sarina display, Outfit body & headings',
      },
      {
        name: 'Color Studio',
        href: '/pages/color-studio/',
        description:
          'Generate and explore color palettes from an accent color or image',
      },
    ],
  },
  {
    label: 'Tools',
    slug: 'tools',
    description: 'Interactive tools for building and exploring Astryx components.',
    pages: [
      {
        name: 'Layout DSL',
        href: '/pages/layout-dsl/',
        description:
          'Write compressed XLE/XLO layout expressions and expand them to TSX with live token metrics',
      },
      {
        name: 'CodeBlock Perf',
        href: '/pages/codeblock-perf/',
        description: 'Compare highlight modes and scroll performance',
      },
      {
        name: 'Foundations',
        href: '/pages/doc-preview/',
        description:
          'Token reference docs with live theme previews — color, spacing, typography, and more',
      },
      {
        name: 'Media Mode',
        href: '/pages/media-mode/',
        description:
          'Compare luminance algorithms (BT.709 / WCAG 2 / APCA) for dark/light surface detection',
      },
      {
        name: 'Dictation Lab',
        href: '/pages/dictation-lab/',
        description:
          'Test voice dictation, tune sound effects, and explore animation',
      },
    ],
  },
];
