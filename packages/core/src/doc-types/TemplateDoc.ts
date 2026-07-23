// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Template doc shape + authoring factory.
 *
 * `TemplateDoc` documents a page or block template (`template.doc.mjs`).
 * `createTemplateDoc()` is a typed identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

/**
 * Functional category for a page template, used to group templates on the
 * docsite Templates overview gallery. Independent of any sidebar/nav grouping.
 *
 * Values follow a `"Group - Variant"` convention (e.g. `"Dashboard - Analytics"`).
 * The overview page derives the group heading from the text before the `" - "`.
 * Standalone values without a hyphen (e.g. `"Settings"`) are their own group.
 *
 * Not every value maps to an existing template — unused values are reserved
 * for future templates so authors get autocomplete for the full taxonomy.
 */
export type TemplateCategory =
  // Dashboard
  | 'Dashboard - Analytics'
  | 'Dashboard - KPI Summary'
  | 'Dashboard - Monitoring'
  | 'Dashboard - Executive Summary'
  | 'Dashboard - Widget Grid'
  | 'Dashboard - Split'
  | 'Dashboard - Tabbed'
  | 'Dashboard - Filterable'
  | 'Dashboard - Portfolio'
  // Table
  | 'Table - Basic'
  | 'Table - Grouped'
  | 'Table - Index/Detail'
  | 'Table - Split Pane'
  | 'Table - Bulk Actions'
  | 'Table - Filtering'
  | 'Table - Tree/Hierarchical List'
  | 'Table - Frozen Column'
  | 'Table - Chart'
  | 'Table - Heatmap'
  // Form
  | 'Form - Basic'
  | 'Form - Page'
  | 'Form - Checkout'
  | 'Form - Two-column'
  | 'Form - Wizard'
  | 'Form - Modal Overlay'
  | 'Form - Side Sheet'
  | 'Form - Inline Edits'
  | 'Form - Settings'
  // Settings
  | 'Settings'
  | 'Settings - Dialog'
  | 'Settings - Sidebar'
  | 'Settings - Panels'
  | 'Settings - Form'
  // Login
  | 'Login - Basic'
  | 'Login - Card'
  | 'Login - SSO'
  | 'Login - Split'
  // Tools
  | 'Tools - File Explorer'
  | 'Tools - Page Editor'
  | 'Tools - IDE'
  | 'Tools - Incident Console'
  | 'Tools - Kanban Board'
  | 'Tools - Notebook/Report Page'
  | 'Tools - Diff Compare Viewer'
  | 'Tools - Search Results Page'
  // Content
  | 'Content - Card Grid'
  | 'Content - Order Detail'
  | 'Content - Product Detail'
  | 'Content - Product List'
  | 'Content - Documentation Catalog'
  | 'Content - Documentation Design'
  | 'Content - Documentation Technical'
  | 'Content - Infinite Scroll Page'
  | 'Content - Timeline'
  | 'Content - Profile Page'
  // AI Chat
  | 'AI Chat - Conversation'
  | 'AI Chat - Landing'
  | 'AI Chat - Artifact Page'
  // Gallery
  | 'Gallery - Hero'
  | 'Gallery - Basic'
  | 'Gallery - Mixed'
  | 'Gallery - Side'
  | 'Gallery - Product'
  // Shell
  | 'Shell - Left Sidebar'
  | 'Shell - Top Nav'
  | 'Shell - Top Nav + Left Sidebar'
  | 'Shell - Breadcrumb Driven Layout'
  | 'Shell - Messaging'
  | 'Shell - Blank';

interface BaseTemplateDoc {
  /** Identifier name for the template. For block templates this matches
   *  the React component import name (e.g. `"ChatMessageMetadata"`); for
   *  page templates it's a human-readable label that doubles as the
   *  display value (e.g. `"Dashboard"`). */
  name: string;
  /** Human-readable display name for the gallery / CLI. Matches `name`
   *  for already-spaced template names (e.g. `"Blank Page"`); for block
   *  templates that mirror a PascalCase component, spaces it out
   *  (`"ChatMessageMetadata"` → `"Chat Message Metadata"`). Required so
   *  authors stay in control of the visible label rather than relying
   *  on a build-time regex derivation. */
  displayName: string;

  /** One-sentence description of what the template provides. */
  description?: string;

  /** Whether this template is ready for use. Templates with
   *  isReady: false show as "(WIP)" in the gallery and CLI. */
  isReady?: boolean;

  /** Whether this template is a scaffolding tool only (e.g. blank page).
   *  Scaffold templates are available via the CLI but hidden from
   *  browsable template galleries like the craft browser. */
  scaffold?: boolean;

  /** Functional category for the docsite Templates overview gallery.
   *  Templates are grouped by the part before `" - "` (e.g. `"Dashboard"`).
   *  Independent of CLI discovery, which uses `name`/`description`. */
  category?: TemplateCategory;

  /** Boolean opt-out for templates that shouldn't appear on the Templates
   *  overview gallery. The template stays available via the CLI and
   *  `astryx template <name>` — it's only hidden from the browsable gallery.
   *  Use for duplicate/experimental variants. Scaffold templates are
   *  hidden automatically and don't need this flag. */
  isHiddenFromOverview?: boolean;
}

export interface PageTemplateDoc extends BaseTemplateDoc {
  type: 'page';
}

export interface BlockTemplateDoc extends BaseTemplateDoc {
  type: 'block';
  /** The component this block is an example of.
   *  Matches the component's doc name (e.g. 'Button', 'Dialog', 'Stack').
   *  Used by the docsite to show relevant examples on component detail pages. */
  exampleFor: string;
  /** Additional component or hook doc pages whose Examples section should
   *  include this block. Use when a component example is also the canonical
   *  usage example for one of that component's hooks. */
  alsoExampleFor?: string[];
  /** Additional component or hook doc pages whose hero showcase should reuse
   *  this block. Unlike `isShowcase`, this does not make the block the primary
   *  showcase for `exampleFor`; it only creates explicit secondary placements. */
  alsoShowcaseFor?: string[];
  /** Width-to-height ratio for preview containers (e.g. 16/9, 1, 3/4). */
  aspectRatio: number;
  /** Scale factor for the block preview (default 1). */
  scale?: number;
  /** Component names this block uses, for cross-referencing.
   *  Powers "See also" and "Used in" sections — not for primary attribution. */
  componentsUsed?: string[];
  /** When true this block is the canonical "hero" showcase for a component. */
  isShowcase?: boolean;
}

export type TemplateDoc = PageTemplateDoc | BlockTemplateDoc;

/** Authoring factory for a `template.doc.mjs`. Type-checks + returns as-is. */
export function createTemplateDoc(doc: TemplateDoc): TemplateDoc {
  return doc;
}
