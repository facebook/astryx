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
exports.SimpleTraverserSkip = exports.SimpleTraverserBreak = exports.SimpleTraverser = void 0;

var _getVisitorKeys = require("./getVisitorKeys");

/**
 * Can be thrown within the traversal "enter" function to prevent the traverser
 * from traversing the node any further, essentially culling the remainder of the
 * AST branch
 */
const SimpleTraverserSkip = new Error();
/**
 * Can be thrown at any point during the traversal to immediately stop traversal
 * entirely.
 */

exports.SimpleTraverserSkip = SimpleTraverserSkip;
const SimpleTraverserBreak = new Error();
/**
 * A very simple traverser class to traverse AST trees.
 */

exports.SimpleTraverserBreak = SimpleTraverserBreak;

class SimpleTraverser {
  /**
   * Traverse the given AST tree.
   * @param node The root node to traverse.
   * @param options The option object.
   */
  traverse(node, options) {
    try {
      this._traverse(node, null, options);
    } catch (ex) {
      if (ex === SimpleTraverserBreak) {
        return;
      }

      throw ex;
    }
  }
  /**
   * Traverse the given AST tree recursively.
   * @param node The current node.
   * @param parent The parent node.
   * @private
   */


  _traverse(node, parent, options) {
    if (!(0, _getVisitorKeys.isNode)(node)) {
      return;
    }

    try {
      options.enter(node, parent);
    } catch (ex) {
      if (ex === SimpleTraverserSkip) {
        return;
      }

      this._setErrorContext(ex, node);

      throw ex;
    }

    const keys = (0, _getVisitorKeys.getVisitorKeys)(node, options.visitorKeys);

    for (const key of keys) {
      const child = node[key];

      if (Array.isArray(child)) {
        for (let j = 0; j < child.length; ++j) {
          this._traverse(child[j], node, options);
        }
      } else {
        this._traverse(child, node, options);
      }
    }

    try {
      options.leave(node, parent);
    } catch (ex) {
      if (ex === SimpleTraverserSkip) {
        return;
      }

      this._setErrorContext(ex, node);

      throw ex;
    }
  }
  /**
   * Set useful contextual information onto the error object.
   * @param ex The error object.
   * @param node The current node.
   * @private
   */


  _setErrorContext(ex, node) {
    // $FlowFixMe[prop-missing]
    ex.currentNode = {
      type: node.type,
      range: node.range,
      loc: node.loc
    };
  }
  /**
   * Traverse the given AST tree.
   * @param node The root node to traverse.
   * @param options The option object.
   */


  static traverse(node, options) {
    new SimpleTraverser().traverse(node, options);
  }

}

exports.SimpleTraverser = SimpleTraverser;
SimpleTraverser.Break = SimpleTraverserBreak;
SimpleTraverser.Skip = SimpleTraverserSkip;