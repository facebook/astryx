/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { FlatCompiledStyles } from '../../../shared/src/common-types';
import * as t from '@babel/types';
type NestedStringObject = Readonly<{
  [key: string]: string | number | null | boolean | NestedStringObject;
}>;
export declare function convertObjectToAST(
  obj: NestedStringObject,
): t.ObjectExpression;
export declare function removeObjectsWithSpreads(obj: {
  readonly [$$Key$$: string]: FlatCompiledStyles;
}): { readonly [$$Key$$: string]: FlatCompiledStyles };
