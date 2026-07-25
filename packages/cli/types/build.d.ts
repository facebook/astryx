// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Build command JSON responses.
 *
 * `astryx build` is the "assemble a page" verb. With no query it emits the
 * workflow playbook; with a query it delegates to the search pipeline and
 * emits a `search` response (see search.d.ts).
 *
 * Invocation                    -> type discriminator
 * ---------------------------------------------------
 * xds --json build              -> build.help
 * xds --json build "<idea>"     -> build.kit
 */

import type {SearchResultEntry} from './search';

/** xds --json build (no query) — the "how to build a page" playbook signal. */
export interface BuildHelpResponse {
  type: 'build.help';
  data: {
    /** Always true; marks this envelope as the playbook rather than a result set. */
    playbook: true;
  };
}

/**
 * xds --json build "<idea>" — the composition kit for what you're building.
 *
 * Entries are raw `SearchResultEntry` objects (no package-manager-prefixed
 * command strings — the CLI adds those); `frame`/`foundation` are static
 * component-name arrays surfaced on every kit.
 */
export interface BuildKitResponse {
  type: 'build.kit';
  data: {
    query: string;
    /** False when search returned nothing (renderer shows "No matches"). */
    hasResults: boolean;
    /** True when the top page template is a confident direct match. */
    directMatch: boolean;
    /** Closest page templates (≤3). */
    pages: SearchResultEntry[];
    /** Drop-in block patterns covering parts of the idea (≤5). */
    blocks: SearchResultEntry[];
    /** Idea-specific components/hooks (≤6), excluding frame/foundation. */
    domain: SearchResultEntry[];
    /** Always-on page-shell component names. */
    frame: string[];
    /** Always-on layout/typography/action component names. */
    foundation: string[];
  };
}
