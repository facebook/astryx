/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
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

interface ICSSType<+_T: string | number> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}

declare export class Angle<+T: string | 0> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Color<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Url<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Image<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Integer<+T: string | number> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class LengthPercentage<+T: string | number>
  implements ICSSType<T>
{
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Length<+T: string | number> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Percentage<+T: string | number> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Num<+T: string | number> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Resolution<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class Time<+T: string | 0> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformFunction<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}
declare export class TransformList<+T: string> implements ICSSType<T> {
  +value: ValueWithDefault<string>;
  +syntax: CSSSyntaxType;
}

export type CSSType<+T: null | string | number> =
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
