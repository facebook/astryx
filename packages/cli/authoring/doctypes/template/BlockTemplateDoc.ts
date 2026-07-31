// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {BaseTemplateDoc} from './BaseTemplateDoc';

export interface BlockTemplateDoc extends BaseTemplateDoc {
  type: 'block';
  /** The component this block is an example of.
   *  Matches the component's doc name (e.g. 'Button', 'Dialog', 'Stack').
   *  Used by the docsite to show relevant examples on component detail pages. */
  exampleFor: string;
  /** Additional component or hook doc pages whose Examples section should
   *  include this block. Use when a component example is also the canonical
   *  usage example for one of that component's hooks. */
  alsoExampleFor?: string[];
  /** Additional component or hook doc pages whose hero showcase should reuse
   *  this block. Unlike `isShowcase`, this does not make the block the primary
   *  showcase for `exampleFor`; it only creates explicit secondary placements. */
  alsoShowcaseFor?: string[];
  /** Width-to-height ratio for preview containers (e.g. 16/9, 1, 3/4). */
  aspectRatio: number;
  /** Scale factor for the block preview (default 1). */
  scale?: number;
  /** Component names this block uses, for cross-referencing.
   *  Powers "See also" and "Used in" sections — not for primary attribution. */
  componentsUsed?: string[];
  /** When true this block is the canonical "hero" showcase for a component. */
  isShowcase?: boolean;
}
