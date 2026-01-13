/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { ValueWithDefault } from './util-types';
export type CSSSyntax =
  | '*'
  | '<length>'
  | '<number>'
  | '<percentage>'
  | '<length-percentage>'
  | '<color>'
  | '<image>'
  | '<url>'
  | '<integer>'
  | '<angle>'
  | '<time>'
  | '<resolution>'
  | '<transform-function>'
  | '<custom-ident>'
  | '<transform-list>';
type CSSSyntaxType = CSSSyntax;
interface ICSSType<_T extends string | number> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Angle<T extends string | 0> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Color<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Url<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Image<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Integer<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class LengthPercentage<T extends string | number>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Length<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Percentage<T extends string | number>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Num<T extends string | number> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Resolution<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Time<T extends string | 0> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformFunction<T extends string>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformList<T extends string> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export type CSSType<T extends null | string | number> =
  | Angle<T>
  | Color<T>
  | Url<T>
  | Image<T>
  | Integer<T>
  | LengthPercentage<T>
  | Length<T>
  | Percentage<T>
  | Num<T>
  | Resolution<T>
  | Time<T>
  | TransformFunction<T>
  | TransformList<T>;
