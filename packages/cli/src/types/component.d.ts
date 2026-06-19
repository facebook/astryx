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
 * xds --json component                      -> component.list
 * xds --json component --list               -> component.list
 * xds --json component --category Form      -> component.list (filtered)
 * xds --json component --list --detail compact -> component.brief
 * xds --json component --list --detail full -> component.full
 * xds --json component Button               -> component.detail
 * xds --json component Button --props       -> component.detail.props
 * xds --json component Button --source      -> component.detail.source
 * xds --json component Button --showcase    -> component.detail.showcase
 * xds --json component Button --blocks      -> component.detail.blocks
 * (not found)                               -> CLIError
 */

import type {ComponentDoc, PropDoc} from '../../../core/src/docs-types';

/** xds --json component [--list] [--category X] [--detail brief] */
export interface ComponentListResponse {
  type: 'component.list';
  data: Record<string, string[]>;
}

/** xds --json component --list --detail compact */
export interface ComponentBriefResponse {
  type: 'component.brief';
  data: Record<string, ComponentBriefEntry[]>;
}

export interface ComponentBriefEntry {
  name: string;
  description: string;
  import: string;
}

/** xds --json component --list --detail full */
export interface ComponentFullResponse {
  type: 'component.full';
  data: Record<string, ComponentDoc[]>;
}

/** xds --json component <name> */
export interface ComponentDetailResponse {
  type: 'component.detail';
  data: ComponentDoc;
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
