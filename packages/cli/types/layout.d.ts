// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Layout command JSON responses.
 *
 * `astryx layout expand|check|grammar` turn compressed XLE/XLO expressions into
 * validated XDS TSX (or echo canonical surfaces / a grammar cheatsheet).
 *
 * Invocation                                 -> type discriminator
 * -----------------------------------------------------------------
 * astryx --json layout expand "<expr>"       -> layout.expand
 * astryx --json layout check "<expr>"        -> layout.check
 * astryx --json layout grammar               -> layout.grammar
 */

/** The input surface an expression was parsed as. */
export type LayoutForm = 'compact' | 'outline' | 'auto';

/** A validation issue with its formatted, human-readable rendering. */
export interface LayoutIssue {
  line?: number;
  col?: number;
  message: string;
  formatted: string;
  suggestions?: string[];
}

/** A block referenced by a layout expression and how it was spliced in. */
export interface LayoutBlockReference {
  name: string;
  mode: string;
}

/** astryx --json layout expand "<expr>" [path] */
export interface LayoutExpandResponse {
  type: 'layout.expand';
  data: {
    form: LayoutForm;
    code: string;
    componentsUsed: string[];
    /** Number of useState hooks the expansion scaffolded. */
    states: number;
    todos: string[];
    blocksReferenced: LayoutBlockReference[];
    warnings: string[];
    written: string | null;
  };
}

/** astryx --json layout check "<expr>" */
export interface LayoutCheckResponse {
  type: 'layout.check';
  data: {
    valid: boolean;
    form: LayoutForm;
    errors: LayoutIssue[];
    warnings: string[];
    compact: string;
    outline: string;
  };
}

/** astryx --json layout grammar */
export interface LayoutGrammarResponse {
  type: 'layout.grammar';
  data: {
    text: string;
    /** Alias table (short name -> canonical component), from the registry. */
    aliases: Record<string, string>;
  };
}

export type LayoutResponse =
  LayoutExpandResponse | LayoutCheckResponse | LayoutGrammarResponse;
