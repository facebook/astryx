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
        description: 'XDS components showcased in realistic card compositions',
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
      'Full-page application templates — dashboards, forms, and data views built with XDS.',
    pages: [
      {
        name: 'Library',
        href: '/templates/library/',
        description: 'Browsable grid of XDS components organized by category',
      },
      ...autoDiscoveredTemplates
        .filter(t => t.slug !== 'docsite-landing')
        .map(t => ({
          name: t.isReady ? t.name : t.name + ' (WIP)',
          href: t.href,
          description: t.description,
        })),
    ],
  },
  {
    label: 'Tools',
    slug: 'tools',
    description: 'Interactive tools for building and exploring XDS components.',
    pages: [
      {
        name: 'Theme Editor',
        href: '/pages/theme-editor/',
        description: 'Customize and preview XDS design tokens',
      },
      {
        name: 'Code Fiddle',
        href: '/pages/code-fiddle/',
        description:
          'CodePen-style playground with code panels and live XDS preview',
      },
      {
        name: 'CodeBlock Perf',
        href: '/pages/codeblock-perf/',
        description: 'Compare highlight modes and scroll performance',
      },
      {
        name: 'Docsite',
        href: '/pages/docsite/',
        description:
          'Template gallery with AI composer and component documentation',
      },
      {
        name: 'Docsite Landing',
        href: '/templates/docsite-landing/',
        description:
          'Template gallery with SideNav layout, AI chat, and resizable preview panel',
      },
      {
        name: 'Media Mode',
        href: '/pages/media-mode/',
        description:
          'Compare luminance algorithms (BT.709 / WCAG 2 / APCA) for dark/light surface detection',
      },
    ],
  },
];
