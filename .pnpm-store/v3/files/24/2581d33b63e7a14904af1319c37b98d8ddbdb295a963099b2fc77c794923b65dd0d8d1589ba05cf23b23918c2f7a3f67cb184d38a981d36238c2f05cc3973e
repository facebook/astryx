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
exports.EMPTY_PARENT = void 0;
exports.callExpression = callExpression;
exports.conjunction = conjunction;
exports.createDefaultPosition = createDefaultPosition;
exports.disjunction = disjunction;
exports.etc = etc;
exports.ident = ident;
exports.iife = iife;
exports.nullLiteral = nullLiteral;
exports.numberLiteral = numberLiteral;
exports.stringLiteral = stringLiteral;
exports.throwStatement = throwStatement;
exports.variableDeclaration = variableDeclaration;
// Rely on the mapper to fix up parent relationships.
const EMPTY_PARENT = null;
exports.EMPTY_PARENT = EMPTY_PARENT;

function createDefaultPosition() {
  return {
    line: 1,
    column: 0
  };
}

function etc({
  loc,
  range,
  parent
} = {}) {
  return {
    loc: {
      start: (loc == null ? void 0 : loc.start) != null ? loc.start : createDefaultPosition(),
      end: (loc == null ? void 0 : loc.end) != null ? loc.end : createDefaultPosition()
    },
    range: range != null ? range : [0, 0],
    parent: parent != null ? parent : EMPTY_PARENT
  };
}

function ident(name, info) {
  return {
    type: 'Identifier',
    name,
    optional: false,
    typeAnnotation: null,
    ...etc(info)
  };
}

function stringLiteral(value, info) {
  return {
    type: 'Literal',
    value,
    raw: `"${value}"`,
    literalType: 'string',
    ...etc(info)
  };
}

function numberLiteral(value, info) {
  return {
    type: 'Literal',
    value,
    raw: String(value),
    literalType: 'numeric',
    ...etc(info)
  };
}

function nullLiteral(info) {
  return {
    type: 'Literal',
    value: null,
    raw: 'null',
    literalType: 'null',
    ...etc(info)
  };
}

function conjunction(tests) {
  if (tests.length === 0) {
    throw new Error('Must have at least one test.');
  }

  return tests.reduce((acc, test) => ({
    type: 'LogicalExpression',
    left: acc,
    right: test,
    operator: '&&',
    ...etc()
  }));
}

function disjunction(tests) {
  if (tests.length === 0) {
    throw new Error('Must have at least one test.');
  }

  return tests.reduce((acc, test) => ({
    type: 'LogicalExpression',
    left: acc,
    right: test,
    operator: '||',
    ...etc()
  }));
}

function variableDeclaration(kind, id, init, info) {
  return {
    type: 'VariableDeclaration',
    kind,
    declarations: [{
      type: 'VariableDeclarator',
      init,
      id,
      ...etc(),
      parent: EMPTY_PARENT
    }],
    ...etc(info)
  };
}

function callExpression(callee, args, info) {
  return {
    type: 'CallExpression',
    callee,
    arguments: args,
    typeArguments: null,
    optional: false,
    ...etc(info)
  };
}

function throwStatement(arg, info) {
  return {
    type: 'ThrowStatement',
    argument: callExpression(ident('Error'), [arg]),
    ...etc(info)
  };
}

function iife(statements, params = [], args = []) {
  const callee = {
    type: 'ArrowFunctionExpression',
    params,
    expression: false,
    async: false,
    predicate: null,
    returnType: null,
    typeParameters: null,
    id: null,
    body: {
      type: 'BlockStatement',
      body: statements,
      ...etc()
    },
    ...etc()
  };
  return callExpression(callee, args);
}