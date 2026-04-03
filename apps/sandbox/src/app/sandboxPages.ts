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
          'Analytics dashboard with KPI cards, charts, and data tables',
      },
      {
        name: 'Login (Card)',
        href: '/pages/template-login/',
        description: 'Centered login card with social sign-in and email form',
      },
      {
        name: 'Login (Split)',
        href: '/pages/template-login-02/',
        description: 'Split-screen login with form and cover image',
      },
      {
        name: 'Login (SSO)',
        href: '/pages/template-login-sso/',
        description: 'SSO login with email-based provider detection',
      },
      {
        name: 'Settings (Sidebar)',
        href: '/pages/template-settings-02/',
        description: 'Account settings with sidebar nav and inline editing',
      },
      {
        name: 'Settings (Dialog)',
        href: '/pages/template-settings-03/',
        description: 'Account settings in a dialog with sidebar nav',
      },
      {
        name: 'Data Table (WIP)',
        href: '/pages/template-data-table/',
        description: 'Sortable data table with search and pagination',
      },
      {
        name: 'File Explorer',
        href: '/pages/file-explorer/',
        description: 'Column-based file browser inspired by macOS Finder',
      },
      {
        name: 'Detail Page',
        href: '/pages/template-detail-2/',
        description: 'Order detail page with timeline and line items',
      },
      {
        name: 'Product Detail',
        href: '/pages/template-product-detail/',
        description: 'Product page with image gallery and collapsible sections',
      },
      {
        name: 'Page Editor',
        href: '/pages/editor/',
        description:
          'Block-based page builder with sidebar config and live preview',
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
