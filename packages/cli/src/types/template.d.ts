/**
 * Template command JSON responses.
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json template [--list]              -> template.list
 * xds --json template <name> [path]         -> template.copy
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

/** xds --json template <name> [path] */
export interface TemplateCopyResponse {
  type: 'template.copy';
  data: {template: string; outputDir: string; filesCopied: number};
}
