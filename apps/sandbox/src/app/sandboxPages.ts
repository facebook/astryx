/**
 * @file sandboxPages.ts
 * @position Central registry of all sandbox pages, grouped by category.
 *
 * To add a new page:
 * 1. Create the page under the appropriate route group:
 *    - `src/app/(sandbox)/pages/<name>/page.tsx` for standard layout
 *    - `src/app/(fullscreen)/pages/<name>/page.tsx` for fullscreen
 * 2. Add an entry to the appropriate category below
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
        name: 'Dashboard (WIP)',
        href: '/pages/template-dashboard/',
        description:
          'Analytics dashboard with sidebar, stats, charts, and tables',
      },
      {
        name: 'Login (Simple)',
        href: '/pages/template-login/',
        description: 'Centered login card with social auth and email form',
      },
      {
        name: 'Login (Two-Column)',
        href: '/pages/template-login-02/',
        description: 'Form on left, cover image on right — responsive',
      },
      {
        name: 'Settings',
        href: '/pages/template-settings/',
        description: 'Settings page with tabs, forms, and toggles',
      },
      {
        name: 'Settings (Account)',
        href: '/pages/template-settings-02/',
        description:
          'Account settings with sidebar nav, info rows, and device history',
      },
      {
        name: 'Data Table (WIP)',
        href: '/pages/template-data-table/',
        description:
          'Full data management view with search, filters, and pagination',
      },
      {
        name: 'File Explorer',
        href: '/pages/file-explorer/',
        description:
          'macOS Finder-style column view with drill-down file navigation',
      },
      {
        name: 'Details Page',
        href: '/pages/template-detail-2/',
        description: 'Order details',
      },
      {
        name: 'Detail Page (Product)',
        href: '/pages/template-product-detail/',
        description:
          'Product detail page with image gallery, options, and collapsible info',
      },
      {
        name: 'Editor',
        href: '/pages/editor/',
        description:
          'Page builder with config panel and live preview',
      },
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
    ],
  },
];
