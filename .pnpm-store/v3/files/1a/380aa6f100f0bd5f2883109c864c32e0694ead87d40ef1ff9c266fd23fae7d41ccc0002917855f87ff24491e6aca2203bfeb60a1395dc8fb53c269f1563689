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
export type InjectableConstStyle = {
  readonly priority: number;
  readonly ltr: string;
  readonly rtl: null | string;
  readonly constKey: string;
  readonly constVal: string | number;
};
export type StyleRule = [string, string, InjectableStyle];
export type CompiledStyles = Readonly<{
  [$$Key$$: string]:
    | null
    | string
    | Readonly<{ [$$Key$$: string]: null | string }>;
}>;
export type FlatCompiledStyles = Readonly<
  { [$$Key$$: string]: string | null } & { $$css: true | string }
>;
export type StyleXOptions = Readonly<{
  classNamePrefix: string;
  debug: null | undefined | boolean;
  definedStylexCSSVariables?: { [key: string]: unknown };
  dev: boolean;
  enableDebugClassNames?: null | undefined | boolean;
  enableDebugDataProp?: null | undefined | boolean;
  enableDevClassNames?: null | undefined | boolean;
  enableFontSizePxToRem?: null | undefined | boolean;
  enableMediaQueryOrder?: null | undefined | boolean;
  enableLegacyValueFlipping?: null | undefined | boolean;
  enableLogicalStylesPolyfill?: null | undefined | boolean;
  enableLTRRTLComments?: null | undefined | boolean;
  enableMinifiedKeys?: null | undefined | boolean;
  styleResolution:
    | 'application-order'
    | 'property-specificity'
    | 'legacy-expand-shorthands';
  test: boolean;
}>;
export type MutableCompiledNamespaces = { [key: string]: FlatCompiledStyles };
export type CompiledNamespaces = Readonly<MutableCompiledNamespaces>;
