/**
 * @file sandboxPages.ts
 * @position Central registry of all sandbox pages, grouped by category.
 *
 * To add a new page:
 * 1. Create the page under the appropriate route group:
 *    - `src/app/(sandbox)/pages/<name>/page.tsx` for standard layout
 *    - `src/app/(fullscreen)/pages/<name>/page.tsx` for fullscreen
 * 2. Run `node scripts/capture-previews.mjs` to generate a screenshot
 * 3. Add an entry to the appropriate category below
 *
 * Note: hrefs use trailing slashes because the sandbox is a static export
 * with `trailingSlash: true` in next.config.mjs.
 */

export interface SandboxPage {
  /** Display name shown on the card */
  name: string;
  /** Route path (with trailing slash) */
  href: string;
  /** Short description shown below the name */
  description: string;
  /** Path to preview image in /public (optional — falls back to placeholder) */
  preview?: string;
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
        name: 'Shell Lab',
        href: '/pages/shell-lab/',
        description: 'Experiment with app shell layouts and navigation',
      },
      {
        name: 'Table Overview',
        href: '/pages/table-overview/',
        description: 'Data table patterns and configurations',
      },
    ],
  },
  {
    label: 'Examples',
    slug: 'examples',
    description: 'Component demos and composition patterns.',
    pages: [
      {
        name: 'Navigation',
        href: '/pages/navigation/',
        description: 'Side navigation layout patterns',
      },
      {
        name: 'TopNav Menu',
        href: '/pages/topnav-menu/',
        description: 'Top navigation bar with menu integration',
      },
      {
        name: 'Mega Menu',
        href: '/pages/mega-menu/',
        description: 'Full-width dropdown navigation menu',
      },
      {
        name: 'Polymorphic Link',
        href: '/pages/polymorphic-link/',
        description: 'Flexible link component with router integration',
      },
      {
        name: 'Example',
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
        name: 'Dashboard',
        href: '/pages/template-dashboard/',
        description:
          'Analytics dashboard with sidebar, stats, charts, and tables',
      },
      {
        name: 'Login',
        href: '/pages/template-login/',
        description: 'Authentication page with login form and branding',
      },
      {
        name: 'Settings',
        href: '/pages/template-settings/',
        description: 'Settings page with tabs, forms, and toggles',
      },
      {
        name: 'Data Table',
        href: '/pages/template-data-table/',
        description:
          'Full data management view with search, filters, and pagination',
      },
    ],
  },
];
