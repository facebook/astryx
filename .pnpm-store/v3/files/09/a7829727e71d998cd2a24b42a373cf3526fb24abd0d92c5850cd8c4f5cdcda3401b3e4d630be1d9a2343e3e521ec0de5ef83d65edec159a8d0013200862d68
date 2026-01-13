/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

const genPrefix = '$$gen$';

export function createGenID(uniqueTransformPrefix: string): {
  genID(): string,
  addUsage(string): void,
} {
  let genN: number = 0;
  const used = new Set<string>();

  return {
    genID(): string {
      let name;
      do {
        name = `${genPrefix}${uniqueTransformPrefix}${genN}`;
        genN++;
      } while (used.has(name));
      used.add(name);
      return name;
    },
    addUsage(name: string): void {
      if (name.startsWith(genPrefix)) {
        used.add(name);
      }
    },
  };
}
