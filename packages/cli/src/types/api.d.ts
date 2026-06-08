// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Programmatic API types for @xds/cli/api.
 *
 * Every function returns the same { type, data } envelope as `xds --json`.
 * Errors throw XDSError.
 */

import type {
  ComponentListResponse,
  ComponentBriefResponse,
  ComponentFullResponse,
  ComponentDetailResponse,
  ComponentDetailPropsResponse,
  ComponentDetailSourceResponse,
  ComponentDetailShowcaseResponse,
  ComponentDetailBlocksResponse,
} from './component';
import type {
  DocsListResponse,
  DocsDetailResponse,
  DocsDetailSectionResponse,
} from './docs';
import type {
  DiscoverListResponse,
  DiscoverDetailResponse,
  DiscoverDetailDocResponse,
  DiscoverSearchResponse,
} from './discover';
import type {
  TemplateListResponse,
  TemplateShowResponse,
  TemplateSkeletonResponse,
  TemplateCopyResponse,
  TemplateGetResponse,
} from './template';
import type {
  HookListResponse,
  HookBriefResponse,
  HookFullResponse,
  HookDetailResponse,
  HookDetailParamsResponse,
} from './hook';
import type {SearchResponse, SearchDomain} from './search';
import type {ErrorCode} from './error-codes';
import type {DoctorResponse} from './doctor';

/** Structured API error with a stable machine-readable code. */
export declare class XDSError extends Error {
  /** Stable error code; consumers branch on this, never the message. */
  code: ErrorCode;
  suggestions?: Array<{name: string; reason: string}>;
  constructor(
    message: string,
    suggestions?: Array<{name: string; reason: string}>,
    code?: ErrorCode,
  );
}

// ── Component ────────────────────────────────────────────────────────

export interface ComponentOptions {
  cwd?: string;
  list?: boolean;
  category?: string;
  /** Scope lookup to a specific external package (e.g. '@acme/xds-widgets'). */
  package?: string;
  props?: boolean;
  source?: boolean;
  showcase?: boolean;
  /** List example blocks for the component: showcase, examples, and related. */
  blocks?: boolean;
  detail?: 'full' | 'compact' | 'brief';
  lang?: string;
  zh?: boolean;
  dense?: boolean;
}

type ComponentResult =
  | ComponentListResponse
  | ComponentBriefResponse
  | ComponentFullResponse
  | ComponentDetailResponse
  | ComponentDetailPropsResponse
  | ComponentDetailSourceResponse
  | ComponentDetailShowcaseResponse
  | ComponentDetailBlocksResponse;

export declare function component(
  name?: string,
  options?: ComponentOptions,
): Promise<ComponentResult>;

// ── Docs ─────────────────────────────────────────────────────────────

export interface DocsOptions {
  lang?: string;
  zh?: boolean;
  dense?: boolean;
}

type DocsResult =
  | DocsListResponse
  | DocsDetailResponse
  | DocsDetailSectionResponse;

export declare function docs(
  topic?: string,
  section?: string,
  options?: DocsOptions,
): Promise<DocsResult>;

// ── Discover ─────────────────────────────────────────────────────────

export interface DiscoverOptions {
  components?: boolean;
  lang?: string;
  zh?: boolean;
}

type DiscoverResult =
  | DiscoverListResponse
  | DiscoverDetailResponse
  | DiscoverDetailDocResponse
  | DiscoverSearchResponse;

export declare function discover(
  query?: string,
  options?: DiscoverOptions,
): Promise<DiscoverResult>;

// ── Template ─────────────────────────────────────────────────────────

export interface TemplateOptions {
  list?: boolean;
  skeleton?: boolean;
  show?: boolean;
  /** Filter templates by kind: 'page' or 'block'. Only applies to list views. */
  type?: 'page' | 'block';
  targetPath?: string;
  cwd?: string;
}

type TemplateResult =
  | TemplateListResponse
  | TemplateShowResponse
  | TemplateSkeletonResponse
  | TemplateCopyResponse;

export declare function template(
  name?: string,
  options?: TemplateOptions,
): Promise<TemplateResult>;

export declare function getTemplateById(
  id: string,
  options?: {cwd?: string},
): Promise<TemplateGetResponse>;

// ── Hook ─────────────────────────────────────────────────────────────

export interface HookOptions {
  cwd?: string;
  list?: boolean;
  category?: string;
  params?: boolean;
  detail?: 'full' | 'compact' | 'brief';
  lang?: string;
  zh?: boolean;
}

type HookResult =
  | HookListResponse
  | HookBriefResponse
  | HookFullResponse
  | HookDetailResponse
  | HookDetailParamsResponse;

export declare function hook(
  name?: string,
  options?: HookOptions,
): Promise<HookResult>;

// ── Search ───────────────────────────────────────────────────────────

export interface SearchOptions {
  cwd?: string;
  type?: SearchDomain;
  limit?: number;
}

export declare function search(
  query: string,
  options?: SearchOptions,
): Promise<SearchResponse>;

// ── Doctor ──────────────────────────────────

export interface DoctorOptions {
  cwd?: string;
}

export declare function doctor(
  options?: DoctorOptions,
): Promise<DoctorResponse>;
