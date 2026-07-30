// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Component command JSON responses.
 *
 * Detail-level contract for list views (brief < compact < full):
 *   --detail brief    Names only. Smallest, most scannable. (DEFAULT for --list)
 *   --detail compact  Names + 1-line description + import path.
 *   --detail full     Full ComponentDoc per entry (props, theming, examples, etc.).
 *
 * Invocation                                 -> type discriminator
 * ------------------------------------------------------------------
 * xds --json component                      -> component.list (data.detail='names')
 * xds --json component --list               -> component.list (data.detail='names')
 * xds --json component --category Form      -> component.list (filtered)
 * xds --json component --list --detail compact -> component.list (data.detail='compact')
 * xds --json component --list --detail full -> component.list (data.detail='full')
 * xds --json component Button               -> component.detail
 * xds --json component Button --props       -> component.detail.props
 * xds --json component Button --source      -> component.detail.source
 * xds --json component Button --showcase    -> component.detail.showcase
 * xds --json component Button --blocks      -> component.detail.blocks
 * (not found)                               -> CLIError
 */

import type {ComponentDoc, PropDoc} from '../../core/src/docs-types';

/**
 * xds --json component [--list] [--category X] [--detail names|compact|full]
 *
 * The list view emits ONE `component.list` type across all three detail levels;
 * the depth is carried in `data.detail` and `data.components` holds the grouped
 * map whose entry shape depends on that level:
 *   - 'names'   -> ComponentListEntry[]  (name + owner package)
 *   - 'compact' -> ComponentBriefEntry[] (name + 1-line description + import)
 *   - 'full'    -> ComponentDoc[]        (full authored doc per entry)
 */
export interface ComponentListResponse {
  type: 'component.list';
  data: ComponentListData;
}

/** Detail-tagged payload for `component.list` (discriminated on `detail`). */
export type ComponentListData =
  | {detail: 'names'; components: Record<string, ComponentListEntry[]>}
  | {detail: 'compact'; components: Record<string, ComponentBriefEntry[]>}
  | {detail: 'full'; components: Record<string, ComponentDoc[]>};

/**
 * A single entry in a `component.list` group at `detail: 'names'`. Pre-1.0 the
 * list moved from bare strings to package-qualified objects so consumers can
 * disambiguate ownership (core vs. an integration package).
 */
export interface ComponentListEntry {
  name: string;
  /** Owner package, e.g. '@astryxdesign/core' or '@acme/astryx-meta'. */
  package: string;
}

/** A single entry in a `component.list` group at `detail: 'compact'`. */
export interface ComponentBriefEntry {
  name: string;
  description: string;
  import: string;
}

/** xds --json component <name> */
export interface ComponentDetailResponse {
  type: 'component.detail';
  data: ComponentDoc & ComponentOwnership;
}

/**
 * Ownership metadata attached to every `component.detail` payload. Exposes the
 * owner package, the import specifier, and whether a swizzleable source file is
 * available — the inputs the integration-component swizzle (a later PR) needs.
 */
export interface ComponentOwnership {
  /** Owner package, e.g. '@astryxdesign/core' or an integration package name. */
  package: string;
  /** Import specifier for the component (e.g. '@astryxdesign/core/Button'). */
  import: string;
  /** Whether a component source file exists for `--source` / swizzle. */
  sourceAvailable: boolean;
}

/** xds --json component <name> --props */
export interface ComponentDetailPropsResponse {
  type: 'component.detail.props';
  data: PropDoc[];
}

/** xds --json component <name> --source */
export interface ComponentDetailSourceResponse {
  type: 'component.detail.source';
  data: {component: string; source: string};
}

/** xds --json component <name> --showcase */
export interface ComponentDetailShowcaseResponse {
  type: 'component.detail.showcase';
  data: {component: string; aspectRatio: number; source: string};
}

/** xds --json component <name> --blocks */
export interface ComponentDetailBlocksResponse {
  type: 'component.detail.blocks';
  data: {
    component: string;
    showcase: BlockEntry | null;
    examples: BlockEntry[];
    related: BlockEntry[];
  };
}

export interface BlockEntry {
  name: string;
  displayName: string;
  description: string;
  isShowcase: boolean;
  category: string;
}
