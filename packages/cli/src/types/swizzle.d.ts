/**
 * Swizzle command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json swizzle [--list]               -> swizzle.list
 * xds --json swizzle <component>            -> swizzle.copy
 * xds --json swizzle <component> --gap "x"  -> swizzle.copy (with gapReport)
 * (not found)                               -> CLIError
 */

/** xds --json swizzle [--list] */
export interface SwizzleListResponse {
  type: 'swizzle.list';
  data: string[];
}

/** xds --json swizzle <component> */
export interface SwizzleCopyResponse {
  type: 'swizzle.copy';
  data: {
    component: string;
    outputDir: string;
    filesCopied: number;
    files: string[];
    gapReport?: string | null;
  };
}
