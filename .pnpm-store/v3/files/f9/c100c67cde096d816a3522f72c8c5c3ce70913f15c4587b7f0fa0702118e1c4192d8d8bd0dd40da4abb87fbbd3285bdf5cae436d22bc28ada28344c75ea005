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
exports.SimpleTransform = void 0;

var _SimpleTraverser = require("../traverse/SimpleTraverser");

var _astNodeMutationHelpers = require("./astNodeMutationHelpers");

function setParentPointer(node, parent) {
  if (parent != null) {
    // $FlowExpectedError[cannot-write]
    node.parent = parent;
  }
}
/**
 * A simple class to recursively tranform AST trees.
 */


class SimpleTransform {
  /**
   * Transform the given AST tree.
   * @param rootNode The root node to traverse.
   * @param options The option object.
   * @return The modified rootNode or a new node if the rootNode was transformed directly.
   */
  transform(rootNode, options) {
    let resultRootNode = rootNode;

    _SimpleTraverser.SimpleTraverser.traverse(rootNode, {
      enter: (node, parent) => {
        // Ensure the parent pointers are correctly set before entering the node.
        setParentPointer(node, parent);
        const resultNode = options.transform(node);

        if (resultNode !== node) {
          let traversedResultNode = null;

          if (resultNode != null) {
            // Ensure the new node has the correct parent pointers before recursing again.
            setParentPointer(resultNode, parent);
            traversedResultNode = this.transform(resultNode, options);
          }

          if (parent == null) {
            if (node !== rootNode) {
              throw new Error('SimpleTransform infra error: Parent not set on non root node, this should not be possible');
            }

            resultRootNode = traversedResultNode;
          } else if (traversedResultNode == null) {
            (0, _astNodeMutationHelpers.removeNodeOnParent)(node, parent, options.visitorKeys);
          } else {
            (0, _astNodeMutationHelpers.replaceNodeOnParent)(node, parent, traversedResultNode, options.visitorKeys);
            setParentPointer(traversedResultNode, parent);
          }

          throw _SimpleTraverser.SimpleTraverser.Skip;
        }
      },

      leave(_node) {},

      visitorKeys: options.visitorKeys
    });

    return resultRootNode;
  }
  /**
   * Transform the given AST tree.
   * @param node The root node to traverse.
   * @param options The option object.
   */


  static transform(node, options) {
    return new SimpleTransform().transform(node, options);
  }

  static transformProgram(program, options) {
    const result = SimpleTransform.transform(program, options);

    if ((result == null ? void 0 : result.type) === 'Program') {
      return result;
    }

    throw new Error('SimpleTransform.transformProgram: Expected program node.');
  }
  /**
   * Return a new AST node with the given properties overrided if needed.
   *
   * This function takes care to only create new nodes when needed. Referential equality of nodes
   * is important as its used to know if a node should be re-traversed.
   *
   * @param node The base AST node.
   * @param overrideProps New properties to apply to the node.
   * @return Either the orginal node if the properties matched the existing node or a new node with
   *         the new properties.
   */


  static nodeWith(node, overrideProps, visitorKeys) {
    return (0, _astNodeMutationHelpers.nodeWith)(node, overrideProps, visitorKeys);
  }

}

exports.SimpleTransform = SimpleTransform;