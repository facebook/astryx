/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { ValueWithDefault } from './StyleXUtils';
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
type InnerValue = null | string | number;
interface ICSSType<_T extends InnerValue> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Angle<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Color<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Url<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Image<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Integer<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class LengthPercentage<T extends InnerValue>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Length<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Percentage<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Num<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Resolution<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class Time<T extends InnerValue> implements ICSSType<T> {
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformFunction<T extends InnerValue>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export declare class TransformList<T extends InnerValue>
  implements ICSSType<T>
{
  readonly value: ValueWithDefault<string>;
  readonly syntax: CSSSyntaxType;
}
export type CSSType<T extends InnerValue> =
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
