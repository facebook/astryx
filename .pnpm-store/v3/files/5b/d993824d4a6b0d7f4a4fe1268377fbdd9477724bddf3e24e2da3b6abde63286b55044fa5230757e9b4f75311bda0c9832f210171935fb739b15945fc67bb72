/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { InjectableConstStyle, StyleXOptions } from './common-types';
import type { ConstsConfig } from './stylex-consts-utils';
declare function styleXDefineConsts<Vars extends ConstsConfig>(
  constants: Vars,
  options: Readonly<
    Omit<Partial<StyleXOptions>, keyof { exportId: string }> & {
      exportId: string;
    }
  >,
): [
  { [$$Key$$: string]: string | number },
  { [$$Key$$: string]: InjectableConstStyle },
];
export default styleXDefineConsts;
