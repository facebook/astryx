/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { CompiledStyles } from '../common-types';
type AnyObject = { readonly [$$Key$$: string]: unknown };
export declare function isPlainObject(obj: unknown): obj is AnyObject;
export declare function flattenObject(obj: CompiledStyles): {
  readonly [$$Key$$: string]: null | string;
};
type _ObjectEntries<Obj extends { readonly [$$Key$$: string]: unknown }> = {
  [Key in keyof Obj]: [Key, Obj[Key]];
};
type ObjectEntries<Obj extends { readonly [$$Key$$: string]: unknown }> =
  _ObjectEntries<Obj>[keyof _ObjectEntries<Obj>];
export declare function objEntries<
  Obj extends { readonly [$$Key$$: string]: unknown },
>(obj: Obj): ReadonlyArray<ObjectEntries<Obj>>;
export declare function objValues<
  Obj extends { readonly [$$Key$$: string]: unknown },
>(obj: Obj): ReadonlyArray<Obj[keyof Obj]>;
export declare function objFromEntries<K extends string | number, V>(
  entries: ReadonlyArray<Readonly<[K, V]>>,
): { [$$Key$$: K]: V };
export declare function objMapKeys<
  V,
  K1 extends string = string,
  K2 extends string = string,
>(
  obj: { readonly [$$Key$$: K1]: V },
  mapper: ($$PARAM_0$$: K1) => K2,
): { readonly [$$Key$$: K2]: V };
export declare function objMapEntry<
  V,
  V2,
  K1 extends string = string,
  K2 extends string = string,
>(
  obj: { readonly [$$Key$$: K1]: V },
  mapper: ($$PARAM_0$$: Readonly<[K1, V]>) => Readonly<[K2, V2]>,
): { readonly [$$Key$$: K2]: V2 };
export declare function objMap<V, V2, K extends string = string>(
  obj: { readonly [$$Key$$: K]: V },
  mapper: ($$PARAM_0$$: V, $$PARAM_1$$: K) => V2,
): { readonly [$$Key$$: K]: V2 };
export declare class Pipe<T> {
  value: T;
  constructor(val: T);
  pipe<T2>(mapper: ($$PARAM_0$$: T) => T2): Pipe<T2>;
  done(): T;
  static create(val: T): Pipe<T>;
}
export declare const arraySort: <T>(
  arr: ReadonlyArray<T>,
  fn?: ($$PARAM_0$$: T, $$PARAM_1$$: T) => number,
) => ReadonlyArray<T>;
export declare const arrayEquals: <T>(
  arr1: ReadonlyArray<T>,
  arr2: ReadonlyArray<T>,
  equals: ($$PARAM_0$$: T, $$PARAM_1$$: T) => boolean,
) => boolean;
