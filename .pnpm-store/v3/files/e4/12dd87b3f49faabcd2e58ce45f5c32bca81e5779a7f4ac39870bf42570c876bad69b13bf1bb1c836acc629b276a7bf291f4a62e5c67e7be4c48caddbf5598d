/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

export type Check<T> = (val: unknown, name?: string) => Error | T;
export type InferCheckType<T> =
  T extends Check<infer U>
    ? U
    : /**
       * > 11 | export type InferCheckType<T> = T extends Check<infer U> ? U : empty;
       *      |                                                                ^^^^^ Unsupported feature: Translating "empty type" is currently not supported.
       **/
      any;
type Msg = (value: unknown, name?: string) => string;
type PrimitiveChecker<T> = (message?: Msg) => Check<T>;
export declare const string: PrimitiveChecker<string>;
export declare const nullish: PrimitiveChecker<null | void>;
export declare const boolean: PrimitiveChecker<boolean>;
export declare const number: PrimitiveChecker<number>;
export declare const literal: <T extends string | number | boolean>(
  $$PARAM_0$$: T,
  msg?: Msg,
) => Check<T>;
export declare const array: <T>(
  $$PARAM_0$$: Check<T>,
  msg?: Msg,
) => Check<ReadonlyArray<T>>;
type ObjOfChecks<T extends { readonly [$$Key$$: string]: Check<unknown> }> =
  Readonly<{ [K in keyof T]: InferCheckType<T[K]> }>;
export declare const object: <
  T extends { readonly [$$Key$$: string]: Check<unknown> },
>(
  $$PARAM_0$$: T,
  msg?: Msg,
) => Check<ObjOfChecks<T>>;
export declare const objectOf: <T>(
  $$PARAM_0$$: Check<T>,
  message?: Msg,
) => Check<{ readonly [$$Key$$: string]: T }>;
export declare const unionOf: <A, B>(
  a: Check<A>,
  b: Check<B>,
  message: Msg,
) => Check<A | B>;
export declare const unionOf3: <A, B, C>(
  a: Check<A>,
  b: Check<B>,
  c: Check<C>,
  message: Msg,
) => Check<A | B | C>;
export declare const unionOf4: <A, B, C, D>(
  a: Check<A>,
  b: Check<B>,
  c: Check<C>,
  d: Check<D>,
  message: Msg,
) => Check<A | B | C | D>;
export declare const logAndDefault: <T>(
  check: Check<T>,
  value: unknown,
  def: T,
  name?: string,
) => T;
