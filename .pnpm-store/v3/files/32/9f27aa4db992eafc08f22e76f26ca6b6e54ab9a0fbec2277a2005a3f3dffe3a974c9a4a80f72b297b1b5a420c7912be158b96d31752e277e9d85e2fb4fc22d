/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type {
  RawStyles,
  InjectableStyle,
  StyleXOptions,
  FlatCompiledStyles,
} from './common-types';
type ClassPathsInNamespace = {
  readonly [className: string]: ReadonlyArray<string>;
};
declare function styleXCreateSet(
  namespaces: { readonly [$$Key$$: string]: RawStyles },
  options?: StyleXOptions,
): [
  { [$$Key$$: string]: FlatCompiledStyles },
  { [$$Key$$: string]: InjectableStyle },
  { readonly [$$Key$$: string]: ClassPathsInNamespace },
];
export default styleXCreateSet;
