// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Shared types for the Astryx CLI JSON API.
 *
 * CLIError and CLIUnsupportedError are the two error shapes.
 * CLIAnyResponse is the union of all success response types.
 * CLIResult<T> wraps any response with possible errors.
 */

import type {
  ComponentListResponse,
  ComponentBriefResponse,
  ComponentDetailResponse,
  ComponentDetailPropsResponse,
  ComponentDetailSourceResponse,
  ComponentDetailShowcaseResponse,
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
import type {
  TemplateListResponse,
  TemplateShowResponse,
  TemplateSkeletonResponse,
  TemplateCopyResponse,
} from './template';
import type {
  HookListResponse,
  HookBriefResponse,
  HookFullResponse,
  HookDetailResponse,
  HookDetailParamsResponse,
} from './hook';
import type {SwizzleListResponse, SwizzleCopyResponse} from './swizzle';
import type {ThemeBuildResponse} from './theme';
import type {UpgradeListResponse, UpgradeRunResponse} from './upgrade';
import type {SearchResponse} from './search';
import type {ErrorCode} from './error-codes';
import type {ManifestResponse} from './manifest';
import type {DoctorResponse} from './doctor';
import type {ValidateIntegrationResponse} from './validate-integration';

/**
 * Structured error. Check `'error' in result` to discriminate.
 *
 * Branch on `code` (a stable machine-readable identifier), never on the
 * human-readable `error` string, which changes freely.
 */
export interface CLIError {
  error: string;
  code: ErrorCode;
  suggestions?: Array<{name: string; reason: string}>;
}

/** Returned by the fallback hook for commands without --json support. */
export interface CLIUnsupportedError {
  error: `JSON output is not supported for the '${string}' command`;
  code: ErrorCode;
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
  | ComponentDetailShowcaseResponse
  | DiscoverListResponse
  | DiscoverDetailResponse
  | DiscoverDetailDocResponse
  | DiscoverSearchResponse
  | DocsListResponse
  | DocsDetailResponse
  | DocsDetailSectionResponse
  | TemplateListResponse
  | TemplateShowResponse
  | TemplateSkeletonResponse
  | TemplateCopyResponse
  | HookListResponse
  | HookBriefResponse
  | HookFullResponse
  | HookDetailResponse
  | HookDetailParamsResponse
  | SwizzleListResponse
  | SwizzleCopyResponse
  | ThemeBuildResponse
  | UpgradeListResponse
  | UpgradeRunResponse
  | SearchResponse
  | ManifestResponse
  | DoctorResponse
  | ValidateIntegrationResponse;

/** Union of all type discriminator string literals. */
export type CLIResponseType = CLIAnyResponse['type'];

/**
 * Map from type discriminator to the data shape for that response.
 * Used by jsonOut to enforce type-safe data payloads.
 */
export type CLIResponseDataMap = {
  [R in CLIAnyResponse as R['type']]: R['data'];
};

/**
 * Output a typed JSON response envelope. The data parameter is
 * constrained to match the declared shape for the given type discriminator.
 */
export function jsonOut<T extends CLIResponseType>(
  type: T,
  data: CLIResponseDataMap[T],
): void;

/**
 * Output a structured JSON error and exit.
 */
export function jsonError(
  message: string,
  suggestions?: Array<{name: string; reason: string}>,
  code?: ErrorCode,
): never;

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
