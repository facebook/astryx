// Copyright (c) Meta Platforms, Inc. and affiliates.

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
