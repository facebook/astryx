import { walk } from 'estree-walker';

const isNodeInPatternWeakSet = /* @__PURE__ */ new WeakSet();
function setIsNodeInPattern(node) {
  return isNodeInPatternWeakSet.add(node);
}
function isNodeInPattern(node) {
  return isNodeInPatternWeakSet.has(node);
}
function esmWalker(root, { onIdentifier, onImportMeta, onDynamicImport, onCallExpression }) {
  const parentStack = [];
  const varKindStack = [];
  const scopeMap = /* @__PURE__ */ new WeakMap();
  const identifiers = [];
  const setScope = (node, name) => {
    let scopeIds = scopeMap.get(node);
    if (scopeIds && scopeIds.has(name)) {
      return;
    }
    if (!scopeIds) {
      scopeIds = /* @__PURE__ */ new Set();
      scopeMap.set(node, scopeIds);
    }
    scopeIds.add(name);
  };
  function isInScope(name, parents) {
    return parents.some((node) => {
      var _a;
      return node && ((_a = scopeMap.get(node)) == null ? void 0 : _a.has(name));
    });
  }
  function handlePattern(p, parentScope) {
    if (p.type === "Identifier") {
      setScope(parentScope, p.name);
    } else if (p.type === "RestElement") {
      handlePattern(p.argument, parentScope);
    } else if (p.type === "ObjectPattern") {
      p.properties.forEach((property) => {
        if (property.type === "RestElement") {
          setScope(parentScope, property.argument.name);
        } else {
          handlePattern(property.value, parentScope);
        }
      });
    } else if (p.type === "ArrayPattern") {
      p.elements.forEach((element) => {
        if (element) {
          handlePattern(element, parentScope);
        }
      });
    } else if (p.type === "AssignmentPattern") {
      handlePattern(p.left, parentScope);
    } else {
      setScope(parentScope, p.name);
    }
  }
  walk(root, {
    enter(node, parent) {
      if (node.type === "ImportDeclaration") {
        return this.skip();
      }
      if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
        parentStack.unshift(parent);
      }
      if (node.type === "VariableDeclaration") {
        varKindStack.unshift(node.kind);
      }
      if (node.type === "CallExpression") {
        onCallExpression == null ? void 0 : onCallExpression(node);
      }
      if (node.type === "MetaProperty" && node.meta.name === "import") {
        onImportMeta == null ? void 0 : onImportMeta(node);
      } else if (node.type === "ImportExpression") {
        onDynamicImport == null ? void 0 : onDynamicImport(node);
      }
      if (node.type === "Identifier") {
        if (!isInScope(node.name, parentStack) && isRefIdentifier(node, parent, parentStack)) {
          identifiers.push([node, parentStack.slice(0)]);
        }
      } else if (isFunctionNode(node)) {
        if (node.type === "FunctionDeclaration") {
          const parentScope = findParentScope(parentStack);
          if (parentScope) {
            setScope(parentScope, node.id.name);
          }
        }
        node.params.forEach((p) => {
          if (p.type === "ObjectPattern" || p.type === "ArrayPattern") {
            handlePattern(p, node);
            return;
          }
          walk(p.type === "AssignmentPattern" ? p.left : p, {
            enter(child, parent2) {
              if ((parent2 == null ? void 0 : parent2.type) === "AssignmentPattern" && (parent2 == null ? void 0 : parent2.right) === child) {
                return this.skip();
              }
              if (child.type !== "Identifier") {
                return;
              }
              if (isStaticPropertyKey(child, parent2)) {
                return;
              }
              if ((parent2 == null ? void 0 : parent2.type) === "TemplateLiteral" && (parent2 == null ? void 0 : parent2.expressions.includes(child)) || (parent2 == null ? void 0 : parent2.type) === "CallExpression" && (parent2 == null ? void 0 : parent2.callee) === child) {
                return;
              }
              setScope(node, child.name);
            }
          });
        });
      } else if (node.type === "Property" && parent.type === "ObjectPattern") {
        setIsNodeInPattern(node);
      } else if (node.type === "VariableDeclarator") {
        const parentFunction = findParentScope(
          parentStack,
          varKindStack[0] === "var"
        );
        if (parentFunction) {
          handlePattern(node.id, parentFunction);
        }
      } else if (node.type === "CatchClause" && node.param) {
        handlePattern(node.param, node);
      }
    },
    leave(node, parent) {
      if (parent && !(parent.type === "IfStatement" && node === parent.alternate)) {
        parentStack.shift();
      }
      if (node.type === "VariableDeclaration") {
        varKindStack.shift();
      }
    }
  });
  identifiers.forEach(([node, stack]) => {
    if (!isInScope(node.name, stack)) {
      const parent = stack[0];
      const grandparent = stack[1];
      const hasBindingShortcut = isStaticProperty(parent) && parent.shorthand && (!isNodeInPattern(parent) || isInDestructuringAssignment(parent, parentStack));
      const classDeclaration = parent.type === "PropertyDefinition" && (grandparent == null ? void 0 : grandparent.type) === "ClassBody" || parent.type === "ClassDeclaration" && node === parent.superClass;
      const classExpression = parent.type === "ClassExpression" && node === parent.id;
      onIdentifier == null ? void 0 : onIdentifier(
        node,
        {
          hasBindingShortcut,
          classDeclaration,
          classExpression
        },
        stack
      );
    }
  });
}
function isRefIdentifier(id, parent, parentStack) {
  if (parent.type === "CatchClause" || (parent.type === "VariableDeclarator" || parent.type === "ClassDeclaration") && parent.id === id) {
    return false;
  }
  if (isFunctionNode(parent)) {
    if (parent.id === id) {
      return false;
    }
    if (parent.params.includes(id)) {
      return false;
    }
  }
  if (parent.type === "MethodDefinition" && !parent.computed) {
    return false;
  }
  if (isStaticPropertyKey(id, parent)) {
    return false;
  }
  if (isNodeInPattern(parent) && parent.value === id) {
    return false;
  }
  if (parent.type === "ArrayPattern" && !isInDestructuringAssignment(parent, parentStack)) {
    return false;
  }
  if (parent.type === "MemberExpression" && parent.property === id && !parent.computed) {
    return false;
  }
  if (parent.type === "ExportSpecifier") {
    return false;
  }
  if (id.name === "arguments") {
    return false;
  }
  return true;
}
function isStaticProperty(node) {
  return node && node.type === "Property" && !node.computed;
}
function isStaticPropertyKey(node, parent) {
  return isStaticProperty(parent) && parent.key === node;
}
const functionNodeTypeRE = /Function(?:Expression|Declaration)$|Method$/;
function isFunctionNode(node) {
  return functionNodeTypeRE.test(node.type);
}
const blockNodeTypeRE = /^BlockStatement$|^For(?:In|Of)?Statement$/;
function isBlock(node) {
  return blockNodeTypeRE.test(node.type);
}
function findParentScope(parentStack, isVar = false) {
  return parentStack.find(isVar ? isFunctionNode : isBlock);
}
function isInDestructuringAssignment(parent, parentStack) {
  if (parent && (parent.type === "Property" || parent.type === "ArrayPattern")) {
    return parentStack.some((i) => i.type === "AssignmentExpression");
  }
  return false;
}

export { esmWalker, isFunctionNode, isInDestructuringAssignment, isNodeInPattern, isStaticProperty, isStaticPropertyKey, setIsNodeInPattern };
