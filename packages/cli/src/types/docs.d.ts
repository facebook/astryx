// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Docs command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json docs                           -> docs.list
 * xds --json docs <topic>                   -> docs.detail
 * xds --json docs <topic> <section>         -> docs.detail.section
 * (unknown topic/section)                   -> CLIError
 */

import type {
  ReferenceDoc,
  ReferenceSection,
} from '../../../core/src/docs-types';

/** xds --json docs */
export interface DocsListResponse {
  type: 'docs.list';
  data: DocsListEntry[];
}

export interface DocsListEntry {
  topic: string;
  description: string;
}

/** xds --json docs <topic> */
export interface DocsDetailResponse {
  type: 'docs.detail';
  data: ReferenceDoc;
}

/** xds --json docs <topic> <section> */
export interface DocsDetailSectionResponse {
  type: 'docs.detail.section';
  data: ReferenceSection;
}
