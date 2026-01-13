/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 */
'use strict';
/*::
import type {
  ESNode,
  Token,
  MostTokens,
  BlockComment,
  LineComment,
  AFunction,
  PropertyDefinition,
  PropertyDefinitionWithNonComputedName,
  MethodDefinition,
  MethodDefinitionConstructor,
  MethodDefinitionWithNonComputedName,
  MemberExpression,
  MemberExpressionWithNonComputedName,
  ObjectPropertyWithShorthandStaticName,
  ObjectPropertyWithNonShorthandStaticName,
  DestructuringObjectPropertyWithShorthandStaticName,
  DestructuringObjectPropertyWithNonShorthandStaticName,
  ClassMember,
  ClassDeclaration,
  ClassExpression,
  Literal,
  BigIntLiteral,
  BooleanLiteral,
  NullLiteral,
  NumericLiteral,
  RegExpLiteral,
  StringLiteral,
  Identifier,
  EnumDefaultedMember,
  Expression,
  Statement,
} from './types';
*/

Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  isClass: true,
  isPropertyDefinitionWithNonComputedName: true,
  isClassMember: true,
  isClassMemberWithNonComputedName: true,
  isComment: true,
  isFunction: true,
  isMethodDefinitionWithNonComputedName: true,
  isMemberExpressionWithNonComputedProperty: true,
  isOptionalMemberExpressionWithNonComputedProperty: true,
  isObjectPropertyWithShorthand: true,
  isObjectPropertyWithNonComputedName: true,
  isBigIntLiteral: true,
  isBooleanLiteral: true,
  isNullLiteral: true,
  isNumericLiteral: true,
  isRegExpLiteral: true,
  isStringLiteral: true,
  isExpression: true,
  isStatement: true
};
exports.isBigIntLiteral = isBigIntLiteral;
exports.isBooleanLiteral = isBooleanLiteral;
exports.isClass = isClass;
exports.isClassMember = isClassMember;
exports.isClassMemberWithNonComputedName = isClassMemberWithNonComputedName;
exports.isComment = isComment;
exports.isExpression = isExpression;
exports.isFunction = isFunction;
exports.isMemberExpressionWithNonComputedProperty = isMemberExpressionWithNonComputedProperty;
exports.isMethodDefinitionWithNonComputedName = isMethodDefinitionWithNonComputedName;
exports.isNullLiteral = isNullLiteral;
exports.isNumericLiteral = isNumericLiteral;
exports.isObjectPropertyWithNonComputedName = isObjectPropertyWithNonComputedName;
exports.isObjectPropertyWithShorthand = isObjectPropertyWithShorthand;
exports.isOptionalMemberExpressionWithNonComputedProperty = isOptionalMemberExpressionWithNonComputedProperty;
exports.isPropertyDefinitionWithNonComputedName = isPropertyDefinitionWithNonComputedName;
exports.isRegExpLiteral = isRegExpLiteral;
exports.isStatement = isStatement;
exports.isStringLiteral = isStringLiteral;

var _predicates = require("./generated/predicates");

Object.keys(_predicates).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _predicates[key]) return;
  exports[key] = _predicates[key];
});

function isClass(node
/*: ESNode */
)
/*: implies node is (ClassDeclaration | ClassExpression) */
{
  return node.type === 'ClassDeclaration' || node.type === 'ClassExpression';
}

function isPropertyDefinitionWithNonComputedName(node
/*: ESNode */
)
/*: implies node is PropertyDefinitionWithNonComputedName */
{
  return node.type === 'PropertyDefinition' && node.computed === false;
}

function isClassMember(node
/*: ESNode */
)
/*: implies node is ClassMember */
{
  return node.type === 'PropertyDefinition' || node.type === 'MethodDefinition';
}

function isClassMemberWithNonComputedName(node
/*: ESNode */
)
/*: implies node is (PropertyDefinitionWithNonComputedName | MethodDefinitionConstructor | MethodDefinitionWithNonComputedName) */
{
  return (node.type === 'PropertyDefinition' || node.type === 'MethodDefinition') && node.computed === false;
}

function isComment(node
/*: ESNode | Token */
)
/*: implies node is (MostTokens | BlockComment | LineComment) */
{
  return node.type === 'Block' || node.type === 'Line';
}

function isFunction(node
/*: ESNode */
)
/*: implies node is AFunction */
{
  return node.type === 'ArrowFunctionExpression' || node.type === 'FunctionDeclaration' || node.type === 'FunctionExpression';
}

function isMethodDefinitionWithNonComputedName(node
/*: ESNode */
)
/*: implies node is (MethodDefinitionConstructor | MethodDefinitionWithNonComputedName) */
{
  return node.type === 'MethodDefinition' && node.computed === false;
}

function isMemberExpressionWithNonComputedProperty(node
/*: ESNode */
)
/*: implies node is MemberExpressionWithNonComputedName */
{
  return node.type === 'MemberExpression' && node.computed === false;
}

function isOptionalMemberExpressionWithNonComputedProperty(node
/*: ESNode */
)
/*: implies node is MemberExpressionWithNonComputedName */
{
  return node.type === 'MemberExpression' && node.computed === false;
}

function isObjectPropertyWithShorthand(node
/*: ESNode */
)
/*: implies node is (ObjectPropertyWithShorthandStaticName | DestructuringObjectPropertyWithShorthandStaticName) */
{
  return node.type === 'Property' && node.shorthand === true;
}

function isObjectPropertyWithNonComputedName(node
/*: ESNode */
)
/*: implies node is (ObjectPropertyWithNonShorthandStaticName | ObjectPropertyWithShorthandStaticName | DestructuringObjectPropertyWithNonShorthandStaticName | DestructuringObjectPropertyWithShorthandStaticName) */
{
  return node.type === 'Property' && node.computed === false;
}

function isBigIntLiteral(node
/*: ESNode */
)
/*: implies node is BigIntLiteral */
{
  return node.type === 'Literal' && node.literalType === 'bigint';
}

function isBooleanLiteral(node
/*: ESNode */
)
/*: implies node is BooleanLiteral */
{
  return node.type === 'Literal' && node.literalType === 'boolean';
}

function isNullLiteral(node
/*: ESNode */
)
/*: implies node is NullLiteral */
{
  return node.type === 'Literal' && node.literalType === 'null';
}

function isNumericLiteral(node
/*: ESNode */
)
/*: implies node is NumericLiteral */
{
  return node.type === 'Literal' && node.literalType === 'numeric';
}

function isRegExpLiteral(node
/*: ESNode */
)
/*: implies node is RegExpLiteral */
{
  return node.type === 'Literal' && node.literalType === 'regexp';
}

function isStringLiteral(node
/*: ESNode */
)
/*: implies node is StringLiteral */
{
  return node.type === 'Literal' && node.literalType === 'string';
}

function isExpression(node
/*: ESNode */
)
/*: implies node is Expression */
{
  return node.type === 'ThisExpression' || node.type === 'ArrayExpression' || node.type === 'ObjectExpression' || // $FlowFixMe[incompatible-type]
  node.type === 'ObjectExpression' || node.type === 'FunctionExpression' || node.type === 'ArrowFunctionExpression' || node.type === 'YieldExpression' || node.type === 'Literal' || node.type === 'UnaryExpression' || node.type === 'UpdateExpression' || node.type === 'BinaryExpression' || node.type === 'AssignmentExpression' || node.type === 'LogicalExpression' || node.type === 'MemberExpression' || node.type === 'ConditionalExpression' || node.type === 'CallExpression' || node.type === 'NewExpression' || node.type === 'SequenceExpression' || node.type === 'TemplateLiteral' || node.type === 'TaggedTemplateExpression' || node.type === 'ClassExpression' || node.type === 'MetaProperty' || node.type === 'Identifier' || node.type === 'AwaitExpression' || node.type === 'ImportExpression' || node.type === 'ChainExpression' || node.type === 'TypeCastExpression' || node.type === 'AsExpression' || node.type === 'AsConstExpression' || node.type === 'JSXFragment' || node.type === 'JSXElement';
}

function isStatement(node
/*: ESNode */
)
/*: implies node is Statement */
{
  return node.type === 'BlockStatement' || node.type === 'BreakStatement' || node.type === 'ClassDeclaration' || node.type === 'ContinueStatement' || node.type === 'DebuggerStatement' || node.type === 'DeclareClass' || node.type === 'DeclareVariable' || node.type === 'DeclareFunction' || node.type === 'DeclareInterface' || node.type === 'DeclareModule' || node.type === 'DeclareOpaqueType' || node.type === 'DeclareTypeAlias' || node.type === 'DoWhileStatement' || node.type === 'EmptyStatement' || node.type === 'EnumDeclaration' || node.type === 'ExpressionStatement' || node.type === 'ForInStatement' || node.type === 'ForOfStatement' || node.type === 'ForStatement' || node.type === 'FunctionDeclaration' || node.type === 'IfStatement' || node.type === 'InterfaceDeclaration' || node.type === 'LabeledStatement' || node.type === 'OpaqueType' || node.type === 'ReturnStatement' || node.type === 'SwitchStatement' || node.type === 'ThrowStatement' || node.type === 'TryStatement' || node.type === 'TypeAlias' || node.type === 'VariableDeclaration' || node.type === 'WhileStatement' || node.type === 'WithStatement';
}