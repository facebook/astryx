// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {ContentBlock} from './ContentBlock';
import type {TokenPreviewType} from './TokenPreviewType';

/**
 * A section within a reference doc. Sections are the primary
 * organizational unit — each becomes an h2 in full output,
 * and can be individually retrieved via `astryx docs <topic> <section>`.
 */
export interface ReferenceSection {
  /** Section title, e.g. "Spacing Tokens", "Light/Dark Mode" */
  title: string;
  /** Navigation category ('guide' | 'foundations'). Mirrors the parent doc's
   *  category so sections can be grouped independently in the docsite nav. */
  category?: string;
  /** Ordered content blocks. Mix prose, code, tables, and lists freely. */
  content: ContentBlock[];
  /** Preview type for token tables in this section. When set, the docsite
   *  renders a visual preview column using the token's computed CSS value
   *  from the current theme. Omit for non-token sections. */
  previewType?: TokenPreviewType;
}
