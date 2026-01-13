/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { InjectableStyle, StyleXOptions } from '../common-types';
export type ClassesToOriginalPaths = {
  readonly [className: string]: ReadonlyArray<string>;
};
export type ComputedStyle = null | Readonly<
  [string, InjectableStyle, ClassesToOriginalPaths]
>;
export interface IPreRule {
  compiled(options: StyleXOptions): ReadonlyArray<ComputedStyle>;
  equals(other: IPreRule): boolean;
}
export type AnyPreRule = NullPreRule | PreRule | PreRuleSet;
export declare class NullPreRule implements IPreRule {
  compiled(_options: StyleXOptions): [null];
  equals(other: IPreRule): boolean;
}
export declare class PreRule implements IPreRule {
  readonly property: string;
  readonly value: string | number | ReadonlyArray<string | number>;
  readonly keyPath: ReadonlyArray<string>;
  constructor(
    property: string,
    value: string | number | ReadonlyArray<string | number>,
    keyPath?: ReadonlyArray<string>,
  );
  get pseudos(): ReadonlyArray<string>;
  get atRules(): ReadonlyArray<string>;
  compiled(
    options: StyleXOptions,
  ): ReadonlyArray<[string, InjectableStyle, ClassesToOriginalPaths]>;
  equals(other: IPreRule): boolean;
}
export declare class PreRuleSet implements IPreRule {
  readonly rules: ReadonlyArray<PreRule | NullPreRule>;
  constructor(rules: ReadonlyArray<PreRule | NullPreRule>);
  static create(
    rules: ReadonlyArray<PreRule | NullPreRule | PreRuleSet>,
  ): AnyPreRule;
  compiled(options: StyleXOptions): ReadonlyArray<ComputedStyle>;
  equals(other: IPreRule): boolean;
}
