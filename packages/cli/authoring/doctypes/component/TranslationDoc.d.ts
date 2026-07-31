// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AnatomyElement} from '../base/AnatomyElement';
import type {BestPractice} from '../base/BestPractice';

/**
 * Translation overlay for component documentation.
 *
 * Contains only the prose fields that change between languages/formats.
 * The CLI merges this onto the base `docs` at read time — props,
 * types, defaults, and code all come from `docs`.
 *
 * Used by both `docsZh` (Chinese translation) and `docsDense` (compressed format).
 */
export interface TranslationDoc {
  /** Compressed/translated component description. */
  description?: string;
  /** Prop descriptions keyed by prop name. Only include props that have descriptions. */
  propDescriptions?: Record<string, string>;
  /** Translated/compressed usage overlay. Mirrors UsageDoc fields. */
  usage?: {
    description?: string;
    bestPractices?: BestPractice[];
    anatomy?: AnatomyElement[];
  };
  /** Sub-component translations. Must match docs.components length and order (if present). */
  components?: {
    /** Exact name from docs.components[n].name */
    name: string;
    /** Optional translated displayName for the sub-component. Allowed so
     *  the displayName backfill codemod (which adds `displayName` next
     *  to every `name:` field) does not break translation overlays.
     *  Translation overlays render via the canonical docs, so this
     *  field is ignored at render time. */
    displayName?: string;
    /** Compressed/translated sub-component description. */
    description: string;
    /** Prop descriptions keyed by prop name. */
    propDescriptions?: Record<string, string>;
    /** When true, this sub-component is excluded from the overview page. */
    isHiddenFromOverview?: boolean;
  }[];
}
