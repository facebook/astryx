/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import type { InjectableStyle, StyleXOptions } from './common-types';
import type { VarsConfig } from './stylex-vars-utils';
type VarsKeysWithStringValues<Vars extends VarsConfig> = Readonly<{
  [$$Key$$ in keyof Vars]: string;
}>;
type VarsObject<Vars extends VarsConfig> = Readonly<
  Omit<VarsKeysWithStringValues<Vars>, keyof { __varGroupHash__: string }> & {
    __varGroupHash__: string;
  }
>;
declare function styleXDefineVars<Vars extends VarsConfig>(
  variables: Vars,
  options: Readonly<
    Omit<Partial<StyleXOptions>, keyof { exportId: string }> & {
      exportId: string;
    }
  >,
): [VarsObject<Vars>, { [$$Key$$: string]: InjectableStyle }];
export default styleXDefineVars;
