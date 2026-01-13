/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type {
  CompiledStyles,
  InlineStyles,
  Keyframes,
  StaticStyles,
  StaticStylesWithout,
  StyleX$Create,
  StyleX$CreateTheme,
  StyleX$DefineVars,
  StyleXArray,
  StyleXStyles,
  StyleXStylesWithout,
  Theme,
  VarGroup,
} from './StyleXTypes';
import type { ValueWithDefault } from './util-types';
import * as Types from './VarTypes';
export type {
  StaticStyles,
  StaticStylesWithout,
  StyleXStyles,
  StyleXStylesWithout,
  Theme,
  Types,
  VarGroup,
};
export declare function attrs(
  ...styles: ReadonlyArray<
    StyleXArray<
      | (null | undefined | CompiledStyles)
      | boolean
      | Readonly<[CompiledStyles, InlineStyles]>
    >
  >
): Readonly<{ class?: string; 'data-style-src'?: string; style?: string }>;
export declare const create: StyleX$Create;
export declare const createTheme: StyleX$CreateTheme;
export declare const defineVars: StyleX$DefineVars;
export declare const firstThatWorks: <T extends string | number>(
  ..._styles: ReadonlyArray<T>
) => ReadonlyArray<T>;
export declare const keyframes: (_keyframes: Keyframes) => string;
export declare function props(
  this: null | undefined | unknown,
  ...styles: ReadonlyArray<
    StyleXArray<
      | (null | undefined | CompiledStyles)
      | boolean
      | Readonly<[CompiledStyles, InlineStyles]>
    >
  >
): Readonly<{
  className?: string;
  'data-style-src'?: string;
  style?: Readonly<{ [$$Key$$: string]: string | number }>;
}>;
export declare const types: {
  angle: <T extends string | 0 = string | 0>(
    _v: ValueWithDefault<T>,
  ) => Types.Angle<T>;
  color: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Color<T>;
  url: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Url<T>;
  image: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Image<T>;
  integer: <T extends number | string = number | string>(
    _v: ValueWithDefault<T>,
  ) => Types.Integer<T>;
  lengthPercentage: <T extends number | string = number | string>(
    _v: ValueWithDefault<T>,
  ) => Types.LengthPercentage<T>;
  length: <T extends number | string = number | string>(
    _v: ValueWithDefault<T>,
  ) => Types.Length<T>;
  percentage: <T extends number | string = number | string>(
    _v: ValueWithDefault<T>,
  ) => Types.Percentage<T>;
  number: <T extends number | string = number | string>(
    _v: ValueWithDefault<T>,
  ) => Types.Num<T>;
  resolution: <T extends string = string>(
    _v: ValueWithDefault<T>,
  ) => Types.Resolution<T>;
  time: <T extends string | 0 = string | 0>(
    _v: ValueWithDefault<T>,
  ) => Types.Time<T>;
  transformFunction: <T extends string = string>(
    _v: ValueWithDefault<T>,
  ) => Types.TransformFunction<T>;
  transformList: <T extends string = string>(
    _v: ValueWithDefault<T>,
  ) => Types.TransformList<T>;
};
/**
 * DO NOT USE. Legacy export for Meta
 */

/**
 * DO NOT USE. Legacy export for Meta
 */

type IStyleX = {
  (
    ...styles: ReadonlyArray<
      StyleXArray<(null | undefined | CompiledStyles) | boolean>
    >
  ): string;
  attrs: (
    ...styles: ReadonlyArray<
      StyleXArray<
        | (null | undefined | CompiledStyles)
        | boolean
        | Readonly<[CompiledStyles, InlineStyles]>
      >
    >
  ) => Readonly<{ class?: string; 'data-style-src'?: string; style?: string }>;
  create: StyleX$Create;
  createTheme: StyleX$CreateTheme;
  defineVars: StyleX$DefineVars;
  firstThatWorks: <T extends string | number>(
    ...v: ReadonlyArray<T>
  ) => ReadonlyArray<T>;
  keyframes: (keyframes: Keyframes) => string;
  props: (
    this: null | undefined | unknown,
    ...styles: ReadonlyArray<
      StyleXArray<
        | (null | undefined | CompiledStyles)
        | boolean
        | Readonly<[CompiledStyles, InlineStyles]>
      >
    >
  ) => Readonly<{
    className?: string;
    'data-style-src'?: string;
    style?: Readonly<{ [$$Key$$: string]: string | number }>;
  }>;
  types: typeof types;
  __customProperties?: { [$$Key$$: string]: unknown };
};
export declare const legacyMerge: IStyleX;
