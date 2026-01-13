/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { CSSType } from './types';
export type VarsConfigValue =
  | string
  | Readonly<{ default: VarsConfigValue; [$$Key$$: string]: VarsConfigValue }>;
export type VarsConfig = Readonly<{
  [$$Key$$: string]: VarsConfigValue | CSSType;
}>;
export declare function collectVarsByAtRule(
  key: string,
  $$PARAM_1$$: { readonly nameHash: string; readonly value: VarsConfigValue },
  collection: { [$$Key$$: string]: Array<string> },
  atRules: Array<string>,
): void;
export declare function wrapWithAtRules(ltr: string, atRule: string): string;
export declare function priorityForAtRule(atRule: string): number;
export declare function getDefaultValue(
  value: VarsConfigValue,
): null | undefined | string;
