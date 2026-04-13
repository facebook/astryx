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
  name: string;
  description: string;
  isReady: boolean;
}

/** xds --json template <name> */
export interface TemplateShowResponse {
  type: 'template.show';
  data: {
    template: string;
    description: string;
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
  data: {template: string; outputDir: string; filesCopied: number};
}

/** xds --json template get --id <id> */
export interface TemplateGetResponse {
  type: 'template.get';
  data: {id: string; source: string};
}
