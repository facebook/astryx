"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.arrayIsEqual = arrayIsEqual;
exports.insertInArray = insertInArray;
exports.removeFromArray = removeFromArray;
exports.replaceInArray = replaceInArray;

/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 */
function assertArrayBounds(array, index) {
  if (index < 0 || index >= array.length) {
    throw new Error(`Invalid Mutation: Tried to mutate an elements array with an out of bounds index. Index: ${index}, Array Size: ${array.length}`);
  }
}

function arrayIsEqual(a1, a2) {
  if (a1 === a2) {
    return true;
  }

  if (a1.length !== a2.length) {
    return false;
  }

  for (let i = 0; i < a1.length; i++) {
    if (a1[i] !== a2[i]) {
      return false;
    }
  }

  return true;
}

function insertInArray(array, index, elements) {
  if (index === array.length) {
    // Support the insert at end of array case.
    return array.concat(elements);
  }

  assertArrayBounds(array, index);
  return array.slice(0, index).concat(elements).concat(array.slice(index));
}

function removeFromArray(array, index) {
  assertArrayBounds(array, index);
  return [...array.slice(0, index), ...array.slice(index + 1)];
}

function replaceInArray(array, index, elements) {
  assertArrayBounds(array, index);
  return array.slice(0, index).concat(elements).concat(array.slice(index + 1));
}