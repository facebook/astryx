/**
 * @file Type definitions for template documentation.
 *
 * Every template directory under `packages/cli/templates/` has a `template.doc.mjs`
 * that exports a single `doc` constant typed via JSDoc. The CLI and sandbox
 * import these directly for discovery and display.
 */

/**
 * Describes which XDS components the template uses.
 * Helps users understand what they're getting and what to customize.
 */
export interface TemplateDependency {
  /** Component name without XDS prefix, e.g. "Button", "Card", "AppShell" */
  name: string;
  /** Why this component is used in the template */
  usage?: string;
}

/**
 * A file included in the template. Templates can ship multiple files
 * (e.g. a main page, a shared layout, helper components).
 */
export interface TemplateFile {
  /** Filename relative to the template directory, e.g. "page.tsx" */
  path: string;
  /** What this file provides */
  description?: string;
}

/**
 * The documentation type for a template directory's template.doc.mjs file.
 *
 * Every template.doc.mjs must export a single `doc` constant of this type:
 *
 *   /** @type {import('../../src/template-doc-types').TemplateDoc} *\/
 *   export const doc = { ... };
 */
export interface TemplateDoc {
  /** Display name shown in the sandbox gallery and CLI.
   *  e.g. "Dashboard", "Login (Card)", "Settings (Sidebar)" */
  name: string;

  /** URL-friendly identifier. Used as the route slug and CLI argument.
   *  Must match the directory name.
   *  e.g. "dashboard", "login-card", "settings-sidebar" */
  slug: string;

  /** One-sentence description of what the template provides.
   *  e.g. "Analytics dashboard with KPI cards and a data table." */
  description: string;

  /** Template category for grouping in the gallery.
   *  e.g. "dashboard", "auth", "settings", "data", "detail" */
  category: string;

  /** Search/filter tags.
   *  e.g. ["analytics", "kpi", "table"] */
  tags?: string[];

  /** XDS components used by this template. */
  components?: TemplateDependency[];

  /** Files included in the template. If omitted, defaults to ["page.tsx"]. */
  files?: TemplateFile[];

  /** Whether the template renders fullscreen (no sandbox shell).
   *  Defaults to true since most templates are full-page layouts. */
  fullscreen?: boolean;
}
