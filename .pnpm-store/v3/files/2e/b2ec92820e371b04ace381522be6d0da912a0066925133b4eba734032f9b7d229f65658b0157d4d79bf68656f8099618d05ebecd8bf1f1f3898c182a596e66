/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { NodePath } from '@babel/traverse';
import StateManager from './state-manager';
export type FunctionConfig = {
  identifiers: { [fnName: string]: any };
  memberExpressions: {
    [key: string]: {
      [memberName: string]: {
        fn: (...args: any[]) => any;
        takesPath?: boolean;
      };
    };
  };
};
export declare function evaluate(
  path: NodePath,
  traversalState: StateManager,
  functions: FunctionConfig,
): Readonly<{
  confident: boolean;
  value: any;
  deopt?: null | NodePath;
  reason?: string;
}>;
