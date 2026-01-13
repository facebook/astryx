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
  MapNamespaces,
  StaticStyles,
  StaticStylesWithout,
  StyleX$Create,
  StyleX$CreateTheme,
  StyleX$DefineVars,
  StyleX$DefineConsts,
  StyleXArray,
  StyleXClassNameFor,
  StyleXStyles,
  StyleXStylesWithout,
  StyleXVar,
  Theme,
  VarGroup,
  PositionTry,
  ViewTransitionClass,
  StyleX$When,
  MapNamespace,
  StyleX$DefineMarker,
} from './types/StyleXTypes';
import type { ValueWithDefault } from './types/StyleXUtils';
import * as Types from './types/VarTypes';
export type {
  CompiledStyles,
  InlineStyles,
  Keyframes,
  MapNamespaces,
  StaticStyles,
  StaticStylesWithout,
  StyleXArray,
  StyleXClassNameFor,
  StyleXStyles,
  StyleXStylesWithout,
  StyleXVar,
  Theme,
  Types,
  VarGroup,
  PositionTry,
};
export declare const create: StyleX$Create;
export declare type create = typeof create;
export declare const createTheme: StyleX$CreateTheme;
export declare type createTheme = typeof createTheme;
export declare const defineConsts: StyleX$DefineConsts;
export declare type defineConsts = typeof defineConsts;
export declare const defineVars: StyleX$DefineVars;
export declare type defineVars = typeof defineVars;
export declare const defineMarker: StyleX$DefineMarker;
export declare type defineMarker = typeof defineMarker;
export declare const firstThatWorks: <T extends string | number>(
  ..._styles: ReadonlyArray<T>
) => ReadonlyArray<T>;
export declare type firstThatWorks = typeof firstThatWorks;
export declare const keyframes: (_keyframes: Keyframes) => string;
export declare type keyframes = typeof keyframes;
export declare const positionTry: (_positionTry: PositionTry) => string;
export declare type positionTry = typeof positionTry;
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
export declare const viewTransitionClass: (
  _viewTransitionClass: ViewTransitionClass,
) => string;
export declare type viewTransitionClass = typeof viewTransitionClass;
export declare const defaultMarker: () => MapNamespace<
  Readonly<{ marker: 'default-marker' }>
>;
export declare type defaultMarker = typeof defaultMarker;
export declare const when: StyleX$When;
export declare type when = typeof when;
export declare const types: {
  angle: <T extends string | 0 = string | 0>(
    _v: ValueWithDefault<T>,
  ) => Types.Angle<T>;
  color: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Color<T>;
  url: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Url<T>;
  image: <T extends string = string>(_v: ValueWithDefault<T>) => Types.Image<T>;
  integer: <T extends number = number>(
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
  number: <T extends number = number>(_v: ValueWithDefault<T>) => Types.Num<T>;
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
export declare type types = typeof types;
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
  create: StyleX$Create;
  createTheme: StyleX$CreateTheme;
  defineConsts: StyleX$DefineConsts;
  defineVars: StyleX$DefineVars;
  defaultMarker: () => MapNamespace<Readonly<{ marker: 'default-marker' }>>;
  defineMarker: StyleX$DefineMarker;
  firstThatWorks: <T extends string | number>(
    ...v: ReadonlyArray<T>
  ) => ReadonlyArray<T>;
  keyframes: (keyframes: Keyframes) => string;
  positionTry: (positionTry: PositionTry) => string;
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
  viewTransitionClass: (viewTransitionClass: ViewTransitionClass) => string;
  types: typeof types;
  when: typeof when;
  __customProperties?: { [$$Key$$: string]: unknown };
};
export declare const legacyMerge: IStyleX;
export declare type legacyMerge = typeof legacyMerge;
