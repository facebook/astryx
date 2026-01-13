/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 */

export type ValueWithDefault<+T> =
  | T
  | $ReadOnly<{
      default: ValueWithDefault<T>,
      [string]: ValueWithDefault<T>,
    }>;
