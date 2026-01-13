/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { NodePath } from '@babel/traverse';
import type { CompiledNamespaces } from '../shared';
import * as t from '@babel/types';
import StateManager from './state-manager';
/**
 * Adds sourceMap data to objects created with stylex.create.
 * Populates the '$$css' property, which the runtime uses to produce a
 * debug string.
 */
export declare function addSourceMapData(
  obj: CompiledNamespaces,
  babelPath: NodePath<t.CallExpression>,
  state: StateManager,
): CompiledNamespaces;
