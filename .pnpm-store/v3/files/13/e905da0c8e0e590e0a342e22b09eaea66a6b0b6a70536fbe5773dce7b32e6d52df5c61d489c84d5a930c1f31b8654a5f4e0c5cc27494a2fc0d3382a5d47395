/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

export type TRawValue = number | string | ReadonlyArray<number | string>;
export type TStyleValue = null | TRawValue;
export type TNestableStyleValue = TStyleValue | PrimitiveRawStyles;
export type RawStyles = Readonly<{ [$$Key$$: string]: TNestableStyleValue }>;
export type PrimitiveRawStyles = Readonly<{
  [$$Key$$: string]: TNestableStyleValue;
}>;
export type InjectableStyle = {
  readonly priority: number;
  readonly ltr: string;
  readonly rtl: null | string;
};
export type StyleRule = [string, string, InjectableStyle];
export type CompiledStyles = Readonly<{
  [$$Key$$: string]:
    | null
    | string
    | Readonly<{ [$$Key$$: string]: null | string }>;
}>;
export type FlatCompiledStyles = Readonly<{
  [$$Key$$: string]: string | null;
  $$css: true | string;
}>;
export type StyleXOptions = Readonly<{
  classNamePrefix: string;
  debug: null | undefined | boolean;
  enableDebugClassNames?: null | undefined | boolean;
  definedStylexCSSVariables?: { [key: string]: unknown };
  dev: boolean;
  styleResolution:
    | 'application-order'
    | 'property-specificity'
    | 'legacy-expand-shorthands';
  test: boolean;
  useRemForFontSize: boolean;
}>;
export type MutableCompiledNamespaces = { [key: string]: FlatCompiledStyles };
export type CompiledNamespaces = Readonly<MutableCompiledNamespaces>;
