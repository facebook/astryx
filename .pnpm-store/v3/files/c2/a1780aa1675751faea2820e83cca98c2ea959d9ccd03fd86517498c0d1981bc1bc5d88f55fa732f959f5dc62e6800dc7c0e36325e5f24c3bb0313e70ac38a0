/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

/**
 * This could be an interface, but we use a class so that we can
 * use instanceof to check for it.
 */
export declare class Rule<V> {}
/**
 * This is a class that represents a raw style rule.
 *
 * It exists to track the actual CSS rule that should be compiled
 * even as we transform the structure of the RawStyles object.
 */
export declare class RawRule<V> extends Rule<V> {
  readonly key: string;
  readonly value: V;
  readonly psuedos: null | undefined | ReadonlyArray<string>;
  readonly atRules: null | undefined | ReadonlyArray<string>;
  constructor(
    key: string,
    value: V,
    psuedos: null | undefined | ReadonlyArray<string>,
    atRules: null | undefined | ReadonlyArray<string>,
  );
}
export declare class RawRuleList<V> extends Rule<V> {
  readonly rules: ReadonlyArray<Rule<V>>;
  constructor(rules: ReadonlyArray<Rule<V>>);
}
export declare class RawRuleRTLTuple<V1, V2> extends Rule<V1 | V2> {
  readonly rules: [RawRule<V1>, RawRule<V2>];
  constructor(rule1: RawRule<V1>, rule2: RawRule<V2>);
}
export declare class CompiledRule<V> extends Rule<V> {
  readonly key: string;
  readonly value: V;
  readonly psuedos: null | undefined | ReadonlyArray<string>;
  readonly atRules: null | undefined | ReadonlyArray<string>;
  readonly className: string;
  constructor(
    key: string,
    value: V,
    psuedos: null | undefined | ReadonlyArray<string>,
    atRules: null | undefined | ReadonlyArray<string>,
    className: string,
  );
}
export declare class CompiledRuleTuple2<V1, V2> extends Rule<V1 | V2> {
  readonly rules: [CompiledRule<V1>, CompiledRule<V2>];
  constructor(rule1: CompiledRule<V1>, rule2: CompiledRule<V2>);
}
