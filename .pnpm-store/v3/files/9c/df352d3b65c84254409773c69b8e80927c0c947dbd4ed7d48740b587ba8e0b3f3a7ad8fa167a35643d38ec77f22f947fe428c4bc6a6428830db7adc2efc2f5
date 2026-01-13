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
exports.deepCloneNode = deepCloneNode;
exports.nodeWith = nodeWith;
exports.removeNodeOnParent = removeNodeOnParent;
exports.replaceNodeOnParent = replaceNodeOnParent;
exports.setParentPointersInDirectChildren = setParentPointersInDirectChildren;
exports.shallowCloneNode = shallowCloneNode;
exports.updateAllParentPointers = updateAllParentPointers;

var _astArrayMutationHelpers = require("./astArrayMutationHelpers");

var _getVisitorKeys = require("../traverse/getVisitorKeys");

var _SimpleTraverser = require("../traverse/SimpleTraverser");

function getParentKey(target, parent, visitorKeys) {
  if (parent == null) {
    throw new Error(`Expected parent node to be set on "${target.type}"`);
  }

  for (const key of (0, _getVisitorKeys.getVisitorKeys)(parent, visitorKeys)) {
    if ((0, _getVisitorKeys.isNode)( // $FlowExpectedError[prop-missing]
    parent[key])) {
      if (parent[key] === target) {
        return {
          type: 'single',
          node: parent,
          key
        };
      }
    } else if (Array.isArray(parent[key])) {
      for (let i = 0; i < parent[key].length; i += 1) {
        // $FlowExpectedError[invalid-tuple-index]
        const current = parent[key][i];

        if (current === target) {
          return {
            type: 'array',
            node: parent,
            key,
            targetIndex: i
          };
        }
      }
    }
  } // this shouldn't happen ever


  throw new Error(`Expected to find the ${target.type} as a direct child of the ${parent.type}.`);
}
/**
 * Replace a node with a new node within an AST (via the parent pointer).
 */


function replaceNodeOnParent(originalNode, originalNodeParent, nodeToReplaceWith, visitorKeys) {
  const replacementParent = getParentKey(originalNode, originalNodeParent, visitorKeys);
  const parent = replacementParent.node;

  if (replacementParent.type === 'array') {
    // $FlowExpectedError[prop-missing]
    parent[replacementParent.key] = (0, _astArrayMutationHelpers.replaceInArray)( // $FlowExpectedError[prop-missing]
    parent[replacementParent.key], replacementParent.targetIndex, [nodeToReplaceWith]);
  } else {
    // $FlowExpectedError[prop-missing]
    parent[replacementParent.key] = nodeToReplaceWith;
  }
}
/**
 * Remove a node from the AST its connected to (via the parent pointer).
 */


function removeNodeOnParent(originalNode, originalNodeParent, visitorKeys) {
  const replacementParent = getParentKey(originalNode, originalNodeParent, visitorKeys);
  const parent = replacementParent.node;

  if (replacementParent.type === 'array') {
    // $FlowExpectedError[prop-missing]
    parent[replacementParent.key] = (0, _astArrayMutationHelpers.removeFromArray)( // $FlowExpectedError[prop-missing]
    parent[replacementParent.key], replacementParent.targetIndex);
  } else {
    // $FlowExpectedError[prop-missing]
    parent[replacementParent.key] = null;
  }
}
/**
 * Corrects the parent pointers in direct children of the given node.
 */


function setParentPointersInDirectChildren(node, visitorKeys) {
  for (const key of (0, _getVisitorKeys.getVisitorKeys)(node, visitorKeys)) {
    if ((0, _getVisitorKeys.isNode)(node[key])) {
      // $FlowExpectedError[cannot-write]
      node[key].parent = node;
    } else if (Array.isArray(node[key])) {
      for (const child of node[key]) {
        child.parent = node;
      }
    }
  }
}
/**
 * Traverses the entire subtree to ensure the parent pointers are set correctly.
 */


function updateAllParentPointers(node, visitorKeys) {
  _SimpleTraverser.SimpleTraverser.traverse(node, {
    enter(node, parent) {
      // $FlowExpectedError[cannot-write]
      node.parent = parent;
    },

    leave() {},

    visitorKeys
  });
}
/**
 * Clone node and add new props.
 *
 * This will only create a new object if the overrides actually result in a change.
 */


function nodeWith(node, overrideProps, visitorKeys) {
  // Check if this will actually result in a change, maintaining referential equality is important.
  const willBeUnchanged = Object.entries(overrideProps).every(([key, value]) => {
    const node_ = node;

    if (Array.isArray(value)) {
      return Array.isArray(node_[key]) ? (0, _astArrayMutationHelpers.arrayIsEqual)(node_[key], value) : false;
    }

    return node_[key] === value;
  });

  if (willBeUnchanged) {
    return node;
  } // Create new node.
  // $FlowExpectedError[cannot-spread-interface]


  const newNode = { ...node,
    ...overrideProps
  }; // Ensure parent pointers are correctly set within this nodes children.

  setParentPointersInDirectChildren(newNode, visitorKeys);
  return newNode;
}
/**
 * Shallow clones node, providing a new reference for an existing node.
 */


function shallowCloneNode(node, visitorKeys) {
  // $FlowExpectedError[cannot-spread-interface]
  const newNode = { ...node
  }; // Ensure parent pointers are correctly set within this nodes children.

  setParentPointersInDirectChildren(newNode, visitorKeys);
  return newNode;
}
/**
 * Deeply clones node and its entire tree.
 */


function deepCloneNode(node, visitorKeys) {
  const clone = JSON.parse(JSON.stringify(node, (key, value) => {
    // null out parent pointers
    if (key === 'parent') {
      return undefined;
    }

    return value;
  }));
  updateAllParentPointers(clone, visitorKeys);
  return clone;
}