/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @noformat
 */
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getVisitorKeys = getVisitorKeys;
exports.isNode = isNode;

var _ESTreeVisitorKeys = _interopRequireDefault(require("../generated/ESTreeVisitorKeys"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function isNode(thing)
/*: implies thing is {+[string]: mixed} */
{
  return typeof thing === 'object' && thing != null && typeof thing.type === 'string';
}

function getVisitorKeys(node, visitorKeys) {
  const keys = (visitorKeys != null ? visitorKeys : _ESTreeVisitorKeys.default)[node.type];

  if (keys == null) {
    throw new Error(`No visitor keys found for node type "${node.type}".`);
  } // $FlowExpectedError[prop-missing]


  return keys;
}