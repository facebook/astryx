// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Swizzle command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json swizzle [--list]               -> swizzle.list
 * xds --json swizzle <component>            -> swizzle.copy
 * (not found)                               -> CLIError
 */

/** xds --json swizzle [--list] */
export interface SwizzleListResponse {
  type: 'swizzle.list';
  data: string[];
}

/** Maintainer feedback note emitted after a successful swizzle. */
export interface SwizzleFeedback {
  /** Where to report the gap that led to swizzling. */
  issuesUrl: string;
  /** Ready-to-run `gh issue create` command, when `gh` is available. */
  ghCommand?: string;
}

/** xds --json swizzle <component> */
export interface SwizzleCopyResponse {
  type: 'swizzle.copy';
  data: {
    component: string;
    outputDir: string;
    filesCopied: number;
    files: string[];
    feedback?: SwizzleFeedback;
  };
}
