/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createGenID = createGenID;
const genPrefix = '$$gen$';

function createGenID(uniqueTransformPrefix) {
  let genN = 0;
  const used = new Set();
  return {
    genID() {
      let name;

      do {
        name = `${genPrefix}${uniqueTransformPrefix}${genN}`;
        genN++;
      } while (used.has(name));

      used.add(name);
      return name;
    },

    addUsage(name) {
      if (name.startsWith(genPrefix)) {
        used.add(name);
      }
    }

  };
}