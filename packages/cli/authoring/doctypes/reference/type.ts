// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Reference/topic doc types.
 */

/**
 * A content block within a reference doc section.
 * Ordered array of these makes up a section's content.
 * New block types can be added without breaking existing docs.
 *
 * @example
 * ```
 * { type: 'prose', text: 'Spacing tokens control gap and padding...' }
 * { type: 'heading', level: 3, text: 'Examples' }
 * { type: 'code', lang: 'tsx', code: 'padding: spacingVars[...]' }
 * { type: 'table', headers: ['Token', 'Value'], rows: [['--spacing-4', '16px']] }
 * { type: 'list', style: 'do', items: ['Use semantic tokens'] }
 * { type: 'token-ref', topic: 'tokens', section: 'Color Tokens' }
 * ```
 */
export type ReferenceContentBlock =
  | {type: 'prose'; text: string}
  | {type: 'heading'; level: 3 | 4 | 5 | 6; text: string}
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
 * A reference documentation file (.doc.mjs).
 *
 * Reference docs cover topics like design tokens, principles, theming,
 * patterns, accessibility, and migration guides. Unlike ComponentDoc,
 * they aren't tied to a specific component — just drop a .doc.mjs file
 * in the docs/ directory and it shows up in `astryx docs`.
 *
 * Every reference .doc.mjs must export a single `docs` constant:
 *
 *   /** @type {import('@astryxdesign/cli/authoring').ReferenceDoc} *\/
 *   export const docs = { ... };
 */
export interface ReferenceDoc {
  /** Doc-kind discriminant for the stamped default-export format
   *  (`export default { type: 'generic', ... }`). Optional: legacy
   *  `export const docs = {...}` docs omit it. The value stays `'generic'`
   *  (the reference/topic discriminant). */
  type?: 'generic';
  /** URL-safe identifier, used as the CLI topic name. e.g. 'tokens', 'principles' */
  name: string;
  /** Human-readable title. e.g. 'All Tokens' */
  title: string;
  /** One-line summary shown in topic listings. */
  description: string;
  /** Navigation category: 'guide' or 'foundations'. */
  category?: string;
  /** Name of an existing topic this doc takes the place of. Authored by an
   *  integration whose guide should be served instead of the built-in one —
   *  `replaces: 'getting-started'` on a doc named `getting-started` swaps the
   *  content, and on a doc named something else swaps it and leaves the old
   *  name as an alias, so `astryx docs getting-started` still resolves.
   *  Ignored on a built-in topic (there is nothing above it to replace). */
  replaces?: string;
  /** Name of an existing topic this doc merges onto, section by section: a
   *  section whose title matches one in the base replaces it, and a section
   *  the base does not have is appended. For correcting or adding to a topic
   *  rather than owning it — `replaces` and `extends` are exclusive. */
  extends?: string;
  /** Ordered sections that make up the doc. */
  sections: ReferenceSection[];
  /** Token category for foundational docs that map to a token section.
   *  When set, the docsite can link from the tokens overview page
   *  to this doc for detailed guidance on that category.
   *  e.g. `'color'` links tokens → color foundational doc. */
  tokenCategory?: string;
}

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
  content: ReferenceContentBlock[];
  /** Preview type for token tables in this section. When set, the docsite
   *  renders a visual preview column using the token's computed CSS value
   *  from the current theme. Omit for non-token sections. */
  previewType?: ReferenceTokenPreviewType;
}

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
export type ReferenceTokenPreviewType =
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
