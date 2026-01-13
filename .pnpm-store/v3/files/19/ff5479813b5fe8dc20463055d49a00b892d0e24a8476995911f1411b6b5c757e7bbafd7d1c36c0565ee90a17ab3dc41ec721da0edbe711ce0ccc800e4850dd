/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { NodePath } from '@babel/traverse';
import * as t from '@babel/types';
import StateManager from '../../utils/state-manager';
import { type FunctionConfig } from '../../utils/evaluate-path';
type TInlineStyles = {
  [$$Key$$: string]: {
    readonly path: ReadonlyArray<string>;
    readonly originalExpression: t.Expression;
    readonly expression: t.Expression | t.PatternLike;
  };
};
type DynamicFns = {
  [$$Key$$: string]: readonly [
    params: Array<t.Identifier>,
    inlineStyles: Readonly<TInlineStyles>,
  ];
};
export declare function evaluateStyleXCreateArg(
  path: NodePath,
  traversalState: StateManager,
  functions: FunctionConfig,
): Readonly<{
  confident: boolean;
  value: any;
  deopt?: null | NodePath;
  reason?: string;
  fns?: DynamicFns;
}>;
