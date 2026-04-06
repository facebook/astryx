/**
 * Shared types for the XDS CLI JSON API.
 *
 * CLIError and CLIUnsupportedError are the two error shapes.
 * CLIMarkdownResponse is the shared fallback for legacy .md files.
 * CLIAnyResponse is the union of all success response types.
 * CLIResult<T> wraps any response with possible errors.
 */

import type {
  ComponentListResponse,
  ComponentBriefResponse,
  ComponentDetailResponse,
  ComponentDetailPropsResponse,
  ComponentDetailSourceResponse,
} from './component';
import type {
  DiscoverListResponse,
  DiscoverDetailResponse,
  DiscoverDetailDocResponse,
  DiscoverSearchResponse,
} from './discover';
import type {
  DocsListResponse,
  DocsDetailResponse,
  DocsDetailSectionResponse,
} from './docs';
import type {TemplateListResponse, TemplateCopyResponse} from './template';
import type {SwizzleListResponse, SwizzleCopyResponse} from './swizzle';
import type {ThemeBuildResponse} from './theme';
import type {UpgradeListResponse, UpgradeRunResponse} from './upgrade';
import type {
  GapReportCategoriesResponse,
  GapReportFileResponse,
} from './gap-report';

/** Structured error. Check `'error' in result` to discriminate. */
export interface CLIError {
  error: string;
  suggestions?: Array<{name: string; reason: string}>;
}

/** Returned by the fallback hook for commands without --json support. */
export interface CLIUnsupportedError {
  error: `JSON output is not supported for the '${string}' command`;
}

/** Legacy markdown fallback envelope. */
export interface CLIMarkdownResponse {
  type: 'markdown';
  data: {name: string; format: 'markdown'; content: string};
}

/** Wrap any response type to include possible error shapes. */
export type CLIResult<T> = T | CLIError | CLIUnsupportedError;

/** Union of all possible success response types. */
export type CLIAnyResponse =
  | ComponentListResponse
  | ComponentBriefResponse
  | ComponentDetailResponse
  | ComponentDetailPropsResponse
  | ComponentDetailSourceResponse
  | DiscoverListResponse
  | DiscoverDetailResponse
  | DiscoverDetailDocResponse
  | DiscoverSearchResponse
  | DocsListResponse
  | DocsDetailResponse
  | DocsDetailSectionResponse
  | TemplateListResponse
  | TemplateCopyResponse
  | SwizzleListResponse
  | SwizzleCopyResponse
  | ThemeBuildResponse
  | UpgradeListResponse
  | UpgradeRunResponse
  | GapReportCategoriesResponse
  | GapReportFileResponse
  | CLIMarkdownResponse;

/** Union of all type discriminator string literals. */
export type CLIResponseType = CLIAnyResponse['type'];

/** Parse raw CLI output (string or object) into typed result. */
export function parseResponse(
  raw: unknown,
): CLIAnyResponse | CLIError | CLIUnsupportedError;

/** Type guard: returns true if result is an error. */
export function isError(
  result: unknown,
): result is CLIError | CLIUnsupportedError;

/** Assert a specific response type. Throws on error or type mismatch. */
export function assertResponse<T extends CLIResponseType>(
  raw: unknown,
  type: T,
): Extract<CLIAnyResponse, {type: T}>;

declare global {
  namespace NodeJS {
    interface Process {
      __xdsJsonHandled?: boolean;
    }
  }
}
