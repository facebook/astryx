// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Reference doc shape + authoring factory.
 *
 * `ReferenceDoc` is a long-form documentation topic (sections of content
 * blocks), e.g. the CLI `docs/<topic>.doc.mjs` files. `createReferenceDoc()`
 * is a typed identity. Zero runtime dependencies.
 *
 * Part of the `@astryxdesign/core/doc-types` single home for doc typing.
 */

/**
 * A content block within a reference doc section.
 * Ordered array of these makes up a section's content.
 * New block types can be added without breaking existing docs.
 *
 * @example
 * ```
 * { type: 'prose', text: 'Spacing tokens control gap and padding...' }
 * { type: 'code', lang: 'tsx', code: 'padding: spacingVars[...]' }
 * { type: 'table', headers: ['Token', 'Value'], rows: [['--spacing-4', '16px']] }
 * { type: 'list', style: 'do', items: ['Use semantic tokens'] }
 * { type: 'token-ref', topic: 'tokens', section: 'Color Tokens' }
 * ```
 */
export type ContentBlock =
  | {type: 'prose'; text: string}
  | {type: 'code'; lang: string; code: string; label?: string}
  | {type: 'table'; headers: string[]; rows: string[][]}
  | {
      type: 'list';
      style: 'ordered' | 'unordered' | 'do' | 'dont';
      items: string[];
    }
  | {
      /** Reference to a token table in another doc topic.
       *  The CLI resolves this at read time and inlines the referenced
       *  section's table. The docsite can render it with live theme values
       *  and type-specific previews instead of static strings. */
      type: 'token-ref';
      /** Doc topic name containing the tokens. e.g. `'tokens'` */
      topic: string;
      /** Section title to pull from that topic. e.g. `'Color Tokens'` */
      section: string;
    };

/**
 * Preview type hint for token tables. Tells the docsite how to render
 * a visual preview column for each token row.
 *
 * - `'swatch'` — Color circle/square showing the token value
 * - `'shadow-box'` — Box with the shadow applied
 * - `'radius-box'` — Box with the border-radius applied
 * - `'spacing-bar'` — Horizontal bar at the token's width
 * - `'size-bar'` — Horizontal bar at the token's height
 * - `'border-line'` — Line at the token's border-width
 * - `'duration-bar'` — Animated bar showing the timing
 * - `'easing-curve'` — Bezier curve visualization
 * - `'font-sample'` — Text sample in the font family/size/weight
 */
export type TokenPreviewType =
  | 'swatch'
  | 'shadow-box'
  | 'radius-box'
  | 'spacing-bar'
  | 'size-bar'
  | 'border-line'
  | 'duration-bar'
  | 'easing-curve'
  | 'font-sample';

/**
 * A section within a reference doc. Sections are the primary
 * organizational unit — each becomes an h2 in full output,
 * and can be individually retrieved via `astryx docs <topic> <section>`.
 */
export interface ReferenceSection {
  /** Section title, e.g. "Spacing Tokens", "Light/Dark Mode" */
  title: string;
  /** Ordered content blocks. Mix prose, code, tables, and lists freely. */
  content: ContentBlock[];
  /** Preview type for token tables in this section. When set, the docsite
   *  renders a visual preview column using the token's computed CSS value
   *  from the current theme. Omit for non-token sections. */
  previewType?: TokenPreviewType;
}

/**
 * A reference documentation file (.doc.mjs).
 *
 * Reference docs cover topics like design tokens, principles, theming,
 * patterns, accessibility, and migration guides. Unlike ComponentDoc,
 * they aren't tied to a specific component — just drop a .doc.mjs file
 * in the docs/ directory and it shows up in `astryx docs`.
 *
 * Every reference .doc.mjs must export a single `docs` constant:
 *
 *   /** @type {import('@astryxdesign/core/doc-types').ReferenceDoc} *\/
 *   export const docs = createReferenceDoc({ ... });
 */
export interface ReferenceDoc {
  /** URL-safe identifier, used as the CLI topic name. e.g. 'tokens', 'principles' */
  name: string;
  /** Human-readable title. e.g. 'All Tokens' */
  title: string;
  /** One-line summary shown in topic listings. */
  description: string;
  /** Navigation category: 'guide' or 'foundations'. */
  category?: string;
  /** Ordered sections that make up the doc. */
  sections: ReferenceSection[];
  /** Token category for foundational docs that map to a token section.
   *  When set, the docsite can link from the tokens overview page
   *  to this doc for detailed guidance on that category.
   *  e.g. `'color'` links tokens → color foundational doc. */
  tokenCategory?: string;
}

/**
 * Translation/compression overlay for reference documentation.
 *
 * Swaps prose text and list items. Code blocks and table data
 * are NOT translated — they stay as-is from the base doc.
 *
 * Used by `docsZh` (Chinese) and `docsDense` (compressed format).
 */
export interface ReferenceTranslationDoc {
  /** Translated/compressed description. */
  description: string;
  /** Section overrides, keyed to base sections by `section`. Order does not
   *  matter, and an overlay may cover any subset — sections it does not name
   *  keep their base content. (These used to be matched by array index, which
   *  meant a reordered or partial overlay grafted every title onto the wrong
   *  body: `docs tokens --dense` printed the colour table under a "Spacing"
   *  heading. See #2182.) */
  sections: {
    /** Title of the BASE section this entry overrides, verbatim and in English
     *  (e.g. 'Spacing Tokens'). Must match a section in the base doc. */
    section: string;
    /** Translated/compressed section title, shown in place of the base title. */
    title: string;
    /** Content block overrides, by index within the anchored base section.
     *  Only prose and list blocks need entries. Use null for blocks that don't
     *  change (code, table). */
    content: (
      {type: 'prose'; text: string} | {type: 'list'; items: string[]} | null
    )[];
  }[];
}

/** Authoring factory for a reference `.doc.mjs` topic. Type-checks + returns as-is. */
export function createReferenceDoc(doc: ReferenceDoc): ReferenceDoc {
  return doc;
}
