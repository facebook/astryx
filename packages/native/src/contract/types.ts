// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file contract/types.ts
 * @input None (pure type definitions)
 * @output The contract model: portable prop types, prop specs, and component contracts
 * @position Foundation of the contract generator; parseDocType produces these,
 *   generators consume them
 */

import type {NativePlatform} from '../platforms.js';

/** A prop type every supported platform language can express (AST-082 FR4). */
export type PropType =
  | {kind: 'string'}
  | {kind: 'number'}
  | {kind: 'boolean'}
  | {kind: 'enum'; values: readonly string[]}
  | {kind: 'array'; of: PropType}
  | {kind: 'record'; fields: Readonly<Record<string, PropSpec>>}
  | {kind: 'fn'; args: readonly PropType[]}
  | {kind: 'named'; name: string};

export interface PropSpec {
  readonly type: PropType;
  readonly optional?: boolean;
  readonly doc?: string;
}

export type PropMap = Readonly<Record<string, PropSpec>>;

/** The part of a component its base props attach to (AST-082 FR7). */
export type BaseTarget = 'root' | 'trigger' | 'control' | 'container';

/** A web prop left out of the core contract, with the reason. */
export interface WebOnlyProp {
  readonly name: string;
  readonly reason: string;
}

export interface ComponentContract {
  readonly name: string;
  readonly baseTarget: BaseTarget;
  /** Named record types the contract references, such as an option shape. */
  readonly types: Readonly<Record<string, PropMap>>;
  /** Shared on every platform that offers the component. */
  readonly core: PropMap;
  /** Added per native platform; never removes or renames a core prop. */
  readonly platforms: Readonly<Partial<Record<NativePlatform, PropMap>>>;
  /** Core-doc props that stay in the web contract. */
  readonly webOnly: readonly WebOnlyProp[];
}
