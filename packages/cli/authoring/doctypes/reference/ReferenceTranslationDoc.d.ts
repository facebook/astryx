// Copyright (c) Meta Platforms, Inc. and affiliates.

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
