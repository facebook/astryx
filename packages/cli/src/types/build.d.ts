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
 * xds --json build "<idea>"     -> search
 */

/** xds --json build (no query) — the "how to build a page" playbook signal. */
export interface BuildHelpResponse {
  type: 'build.help';
  data: {
    /** Always true; marks this envelope as the playbook rather than a result set. */
    playbook: true;
  };
}
