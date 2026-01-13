/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
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

interface ICSSType<+_T: InnerValue> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Angle<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Color<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Url<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Image<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Integer<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class LengthPercentage<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Length<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Percentage<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Num<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Resolution<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Time<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformFunction<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformList<+T: InnerValue> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}

export type CSSType<+T: InnerValue> =
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
