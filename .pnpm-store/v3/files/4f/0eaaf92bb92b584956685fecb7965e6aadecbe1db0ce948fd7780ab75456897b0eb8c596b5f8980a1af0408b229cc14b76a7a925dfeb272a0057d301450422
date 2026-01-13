/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type TRawValue = number | string | $ReadOnlyArray<number | string>;
export type TStyleValue = null | TRawValue;
export type TNestableStyleValue = TStyleValue | PrimitiveRawStyles;

export type RawStyles = $ReadOnly<{
  [string]: TNestableStyleValue,
}>;
export type PrimitiveRawStyles = $ReadOnly<{
  [string]: TNestableStyleValue,
}>;

export type InjectableStyle = {
  +priority: number,
  +ltr: string,
  +rtl: null | string,
};

export type InjectableConstStyle = {
  +priority: number,
  +ltr: string,
  +rtl: null | string,
  +constKey: string,
  +constVal: string | number,
};

export type StyleRule = [string, string, InjectableStyle];

export type CompiledStyles = $ReadOnly<{
  [string]: null | string | $ReadOnly<{ [string]: null | string }>,
}>;

export type FlatCompiledStyles = $ReadOnly<{
  [string]: string | null,
  $$css: true | string,
}>;

export type StyleXOptions = $ReadOnly<{
  classNamePrefix: string,
  debug: ?boolean,
  definedStylexCSSVariables?: { [key: string]: mixed },
  dev: boolean,
  enableDebugClassNames?: ?boolean,
  enableDebugDataProp?: ?boolean,
  enableDevClassNames?: ?boolean,
  enableFontSizePxToRem?: ?boolean,
  enableInlinedConditionalMerge?: ?boolean,
  enableMediaQueryOrder?: ?boolean,
  enableLegacyValueFlipping?: ?boolean,
  enableLogicalStylesPolyfill?: ?boolean,
  enableLTRRTLComments?: ?boolean,
  enableMinifiedKeys?: ?boolean,
  // runtimeInjection?:
  //   | boolean
  //   | ?string
  //   | $ReadOnly<{ from: string, as: string }>,
  importSources?: $ReadOnlyArray<
    string | $ReadOnly<{ from: string, as: string }>,
  >,
  treeshakeCompensation?: boolean,
  styleResolution:
    | 'application-order' // The last style applied wins.
    // More specific styles will win over less specific styles. (margin-top wins over margin)
    | 'property-specificity'
    // Legacy behavior, that expands shorthand properties into their longhand counterparts at compile-time.
    // This is not recommended, and will be removed in a future version.
    | 'legacy-expand-shorthands',
  test: boolean,
  ...
}>;

export type MutableCompiledNamespaces = {
  [key: string]: FlatCompiledStyles,
};

export type CompiledNamespaces = $ReadOnly<MutableCompiledNamespaces>;
