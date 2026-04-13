/**
 * Programmatic API types for @xds/cli/api.
 *
 * Every function returns the same { type, data } envelope as `xds --json`.
 * Errors throw XDSError.
 */

import type {
  ComponentListResponse,
  ComponentBriefResponse,
  ComponentDetailResponse,
  ComponentDetailPropsResponse,
  ComponentDetailSourceResponse,
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

/** Structured API error with optional suggestions. */
export declare class XDSError extends Error {
  suggestions?: Array<{name: string; reason: string}>;
  constructor(
    message: string,
    suggestions?: Array<{name: string; reason: string}>,
  );
}

// ── Component ────────────────────────────────────────────────────────

export interface ComponentOptions {
  cwd?: string;
  list?: boolean;
  category?: string;
  props?: boolean;
  source?: boolean;
  detail?: 'full' | 'compact' | 'brief';
  lang?: string;
  zh?: boolean;
  dense?: boolean;
}

type ComponentResult =
  | ComponentListResponse
  | ComponentBriefResponse
  | ComponentDetailResponse
  | ComponentDetailPropsResponse
  | ComponentDetailSourceResponse;

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
