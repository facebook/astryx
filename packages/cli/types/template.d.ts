// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Template command JSON responses.
 *
 * Each template is exactly two files: page.tsx (code) + template.doc.mjs (metadata).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json template [--list]              -> template.list
 * xds --json template <name>               -> template.show
 * xds --json template <name> --skeleton    -> template.skeleton
 * xds --json template <name> [path]        -> template.copy
 * (unknown template)                        -> CLIError
 */

/** xds --json template [--list] */
export interface TemplateListResponse {
  type: 'template.list';
  data: TemplateListEntry[];
}

export interface TemplateListEntry {
  /** Stable template id (relative path under the templates root, minus the .doc.* suffix). */
  id: string;
  name: string;
  /** @deprecated Alias of `name`, retained for back-compat. */
  displayName: string;
  description: string;
  type: 'page' | 'block';
  /** Owning package; core (built-in) templates report '@astryxdesign/core'. */
  package: string;
  /** Optional grouping/category label. */
  category?: string;
  /** Component display names the template composes. */
  componentsUsed?: string[];
  isReady: boolean;
  scaffold?: boolean;
}

/** xds --json template <name> */
export interface TemplateShowResponse {
  type: 'template.show';
  data: {
    template: string;
    description: string;
    type: 'page' | 'block';
    components: string[];
    source: string;
  };
}

/** xds --json template <name> --skeleton */
export interface TemplateSkeletonResponse {
  type: 'template.skeleton';
  data: {
    template: string;
    description: string;
    components: string[];
    skeleton: string;
  };
}

/** xds --json template <name> [path] */
export interface TemplateCopyResponse {
  type: 'template.copy';
  data: {
    template: string;
    outputDir: string;
    fileName: string;
    filesCopied: number;
  };
}
