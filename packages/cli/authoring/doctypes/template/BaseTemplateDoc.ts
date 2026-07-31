// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {TemplateCategory} from './TemplateCategory';

export interface BaseTemplateDoc {
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
