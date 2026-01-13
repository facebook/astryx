/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 *
 */

import { type PluginItem } from '@babel/core';
import type { Options } from '@stylexjs/babel-plugin';
import type { Plugin } from 'esbuild';
export type PluginOptions = Readonly<
  Omit<
    Partial<Options>,
    keyof ({
      generatedCSSFileName?: string;
      stylexImports?: ReadonlyArray<string>;
      babelConfig?: Readonly<{
        plugins?: ReadonlyArray<PluginItem>;
        presets?: ReadonlyArray<PluginItem>;
      }>;
      useCSSLayers?: boolean;
    })
  > & {
    generatedCSSFileName?: string;
    stylexImports?: ReadonlyArray<string>;
    babelConfig?: Readonly<{
      plugins?: ReadonlyArray<PluginItem>;
      presets?: ReadonlyArray<PluginItem>;
    }>;
    useCSSLayers?: boolean;
  }
>;
declare function stylexPlugin($$PARAM_0$$: PluginOptions): Plugin;
export default stylexPlugin;
