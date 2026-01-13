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
exports.createSyntaxError = createSyntaxError;

function createSyntaxError(node, err) {
  const syntaxError = new SyntaxError(err); // $FlowExpectedError[prop-missing]

  syntaxError.loc = {
    line: node.loc.start.line,
    column: node.loc.start.column
  };
  return syntaxError;
}