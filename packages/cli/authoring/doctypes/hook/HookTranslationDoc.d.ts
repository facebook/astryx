// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {BestPractice} from '../base/BestPractice';

/**
 * Translation overlay for hook documentation.
 */
export interface HookTranslationDoc {
  /** Compressed/translated description. */
  description?: string;
  /** Param descriptions keyed by param name. */
  paramDescriptions?: Record<string, string>;
  /** Return descriptions keyed by field name. */
  returnDescriptions?: Record<string, string>;
  /** Translated usage. */
  usage?: {
    description?: string;
    bestPractices?: BestPractice[];
  };
}
