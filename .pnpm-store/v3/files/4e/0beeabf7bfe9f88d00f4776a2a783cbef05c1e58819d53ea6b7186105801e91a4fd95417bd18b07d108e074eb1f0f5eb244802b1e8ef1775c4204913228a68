/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

type NestedWithNumbers =
  | number
  | string
  | Readonly<{
      default: NestedWithNumbers;
      [$$Key$$: string]: NestedWithNumbers;
    }>;
type ValueWithDefault =
  | string
  | Readonly<{
      default: ValueWithDefault;
      [$$Key$$: string]: ValueWithDefault;
    }>;
type CSSSyntax =
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
declare class BaseCSSType {
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  constructor(value: ValueWithDefault);
}
export interface CSSType<_T extends string | number = string | number> {
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
}
export declare const isCSSType: (
  value: unknown,
) => value is CSSType<string | number>;
type AngleValue = string;
export declare class Angle<T extends AngleValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static readonly syntax: CSSSyntaxType;
  static create<T extends AngleValue = AngleValue>(
    value: ValueWithDefault,
  ): Angle<T>;
}
export declare const angle: <T extends AngleValue = AngleValue>(
  value: ValueWithDefault,
) => Angle<T>;
type ColorValue = string;
export declare class Color<T extends ColorValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends ColorValue = ColorValue>(
    value: ValueWithDefault,
  ): Color<T>;
}
export declare const color: <T extends ColorValue = ColorValue>(
  value: ValueWithDefault,
) => Color<T>;
type URLValue = string;
export declare class Url<T extends URLValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends URLValue = URLValue>(value: ValueWithDefault): Url<T>;
}
export declare const url: <T extends URLValue = URLValue>(
  value: ValueWithDefault,
) => Url<T>;
type ImageValue = string;
export declare class Image<T extends ImageValue>
  extends Url<T>
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  constructor(value: ValueWithDefault);
  static create<T extends ImageValue = ImageValue>(
    value: ValueWithDefault,
  ): Image<T>;
}
export declare const image: <T extends ImageValue = ImageValue>(
  value: ValueWithDefault,
) => Image<T>;
type IntegerValue = number;
export declare class Integer<T extends IntegerValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends IntegerValue = IntegerValue>(value: T): Integer<T>;
}
export declare const integer: <T extends IntegerValue = IntegerValue>(
  value: T,
) => Integer<T>;
type LengthPercentageValue = string;
export declare class LengthPercentage<_T extends LengthPercentageValue>
  extends BaseCSSType
  implements CSSType<string>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static createLength<_T extends LengthPercentageValue | number>(
    value: ValueWithDefault,
  ): LengthPercentage<string>;
  static createPercentage<_T extends LengthPercentageValue | number>(
    value: ValueWithDefault,
  ): LengthPercentage<string>;
}
export declare const lengthPercentage: <
  _T extends LengthPercentageValue | number,
>(
  value: ValueWithDefault,
) => LengthPercentage<string>;
type LengthValue = number | string;
export declare class Length<_T extends LengthValue>
  extends LengthPercentage<string>
  implements CSSType<string>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends LengthValue = LengthValue>(
    value: NestedWithNumbers,
  ): Length<T>;
}
export declare const length: <T extends LengthValue = LengthValue>(
  value: NestedWithNumbers,
) => Length<T>;
type PercentageValue = string | number;
export declare class Percentage<_T extends PercentageValue>
  extends LengthPercentage<string>
  implements CSSType<string>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends PercentageValue = PercentageValue>(
    value: NestedWithNumbers,
  ): Percentage<T>;
}
export declare const percentage: <T extends PercentageValue = PercentageValue>(
  value: NestedWithNumbers,
) => Percentage<T>;
type NumberValue = number;
export declare class Num<T extends NumberValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends NumberValue = NumberValue>(
    value: NestedWithNumbers,
  ): Num<T>;
}
export declare const number: <T extends NumberValue = NumberValue>(
  value: NestedWithNumbers,
) => Num<T>;
type ResolutionValue = string | 0;
export declare class Resolution<T extends ResolutionValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends ResolutionValue = ResolutionValue>(
    value: ValueWithDefault,
  ): Resolution<T>;
}
export declare const resolution: <T extends ResolutionValue = ResolutionValue>(
  value: ValueWithDefault,
) => Resolution<T>;
type TimeValue = string | 0;
export declare class Time<T extends TimeValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends TimeValue = TimeValue>(
    value: ValueWithDefault,
  ): Time<T>;
}
export declare const time: <T extends TimeValue = TimeValue>(
  value: ValueWithDefault,
) => Time<T>;
type TransformFunctionValue = string;
export declare class TransformFunction<T extends TransformFunctionValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends TransformFunctionValue = TransformFunctionValue>(
    value: ValueWithDefault,
  ): TransformFunction<T>;
}
export declare const transformFunction: <
  T extends TransformFunctionValue = TransformFunctionValue,
>(
  value: ValueWithDefault,
) => TransformFunction<T>;
type TransformListValue = string;
export declare class TransformList<T extends TransformListValue>
  extends BaseCSSType
  implements CSSType<T>
{
  readonly value: ValueWithDefault;
  readonly syntax: CSSSyntaxType;
  static create<T extends TransformListValue = TransformListValue>(
    value: ValueWithDefault,
  ): TransformList<T>;
}
export declare const transformList: <
  T extends TransformListValue = TransformListValue,
>(
  value: ValueWithDefault,
) => TransformList<T>;
