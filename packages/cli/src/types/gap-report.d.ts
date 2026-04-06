/**
 * Gap-report command JSON responses.
 *
 * Invocation                                               -> type discriminator
 * ------------------------------------------------------------------
 * xds --json gap-report --list-categories                 -> gap-report.categories
 * xds --json gap-report --component X --category Y --reason Z -> gap-report.file
 * (invalid category)                                      -> CLIError
 * (interactive mode)                                      -> CLIUnsupportedError (fallback)
 */

/** xds --json gap-report --list-categories */
export interface GapReportCategoriesResponse {
  type: 'gap-report.categories';
  data: GapReportCategoryEntry[];
}

export interface GapReportCategoryEntry {
  value: string;
  label: string;
}

/** xds --json gap-report --component X --category Y --reason Z */
export interface GapReportFileResponse {
  type: 'gap-report.file';
  data: {filed: boolean; url: string | null};
}
