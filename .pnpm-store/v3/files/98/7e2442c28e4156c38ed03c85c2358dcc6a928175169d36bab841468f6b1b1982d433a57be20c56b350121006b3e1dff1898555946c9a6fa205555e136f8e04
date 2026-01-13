/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * 
 * @format
 * @generated
 */

/*
 * !!! GENERATED FILE !!!
 *
 * Any manual changes to this file will be overwritten. To regenerate run `yarn build`.
 */
// lint directives to let us do some basic validation of generated files

/* eslint no-undef: 'error', no-unused-vars: ['error', {vars: "local"}], no-redeclare: 'error' */

/* global $NonMaybeType, Partial, $ReadOnly, $ReadOnlyArray, $FlowFixMe */
'use strict';

function deserializeEmpty() {
  return {
    type: 'Empty',
    loc: this.addEmptyLoc()
  };
}

function deserializeMetadata() {
  return {
    type: 'Metadata',
    loc: this.addEmptyLoc()
  };
}

function deserializeFunctionLikeFirst() {
  throw new Error('FunctionLike' + ' should not appear in program buffer');
}

function deserializeProgram() {
  return {
    type: 'Program',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeFunctionExpression() {
  return {
    type: 'FunctionExpression',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    predicate: this.deserializeNode(),
    generator: this.deserializeBoolean(),
    async: this.deserializeBoolean()
  };
}

function deserializeArrowFunctionExpression() {
  return {
    type: 'ArrowFunctionExpression',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    predicate: this.deserializeNode(),
    expression: this.deserializeBoolean(),
    async: this.deserializeBoolean()
  };
}

function deserializeFunctionDeclaration() {
  return {
    type: 'FunctionDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode(),
    predicate: this.deserializeNode(),
    generator: this.deserializeBoolean(),
    async: this.deserializeBoolean()
  };
}

function deserializeComponentDeclaration() {
  return {
    type: 'ComponentDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    rendersType: this.deserializeNode()
  };
}

function deserializeHookDeclaration() {
  return {
    type: 'HookDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    body: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    returnType: this.deserializeNode()
  };
}

function deserializeFunctionLikeLast() {
  throw new Error('FunctionLike' + ' should not appear in program buffer');
}

function deserializeStatementFirst() {
  throw new Error('Statement' + ' should not appear in program buffer');
}

function deserializeMatchStatement() {
  return {
    type: 'MatchStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}

function deserializeLoopStatementFirst() {
  throw new Error('LoopStatement' + ' should not appear in program buffer');
}

function deserializeWhileStatement() {
  return {
    type: 'WhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}

function deserializeDoWhileStatement() {
  return {
    type: 'DoWhileStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNode(),
    test: this.deserializeNode()
  };
}

function deserializeForInStatement() {
  return {
    type: 'ForInStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeForOfStatement() {
  return {
    type: 'ForOfStatement',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    body: this.deserializeNode(),
    await: this.deserializeBoolean()
  };
}

function deserializeForStatement() {
  return {
    type: 'ForStatement',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    test: this.deserializeNode(),
    update: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeLoopStatementLast() {
  throw new Error('LoopStatement' + ' should not appear in program buffer');
}

function deserializeDebuggerStatement() {
  return {
    type: 'DebuggerStatement',
    loc: this.addEmptyLoc()
  };
}

function deserializeEmptyStatement() {
  return {
    type: 'EmptyStatement',
    loc: this.addEmptyLoc()
  };
}

function deserializeBlockStatement() {
  return {
    type: 'BlockStatement',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeStaticBlock() {
  return {
    type: 'StaticBlock',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeBreakStatement() {
  return {
    type: 'BreakStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}

function deserializeContinueStatement() {
  return {
    type: 'ContinueStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode()
  };
}

function deserializeThrowStatement() {
  return {
    type: 'ThrowStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeReturnStatement() {
  return {
    type: 'ReturnStatement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeWithStatement() {
  return {
    type: 'WithStatement',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeSwitchStatement() {
  return {
    type: 'SwitchStatement',
    loc: this.addEmptyLoc(),
    discriminant: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}

function deserializeLabeledStatement() {
  return {
    type: 'LabeledStatement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeExpressionStatement() {
  return {
    type: 'ExpressionStatement',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    directive: this.deserializeString()
  };
}

function deserializeTryStatement() {
  return {
    type: 'TryStatement',
    loc: this.addEmptyLoc(),
    block: this.deserializeNode(),
    handler: this.deserializeNode(),
    finalizer: this.deserializeNode()
  };
}

function deserializeIfStatement() {
  return {
    type: 'IfStatement',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNode(),
    alternate: this.deserializeNode()
  };
}

function deserializeStatementLast() {
  throw new Error('Statement' + ' should not appear in program buffer');
}

function deserializeNullLiteral() {
  return {
    type: 'NullLiteral',
    loc: this.addEmptyLoc()
  };
}

function deserializeBooleanLiteral() {
  return {
    type: 'BooleanLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean()
  };
}

function deserializeStringLiteral() {
  return {
    type: 'StringLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeString()
  };
}

function deserializeNumericLiteral() {
  return {
    type: 'NumericLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeNumber()
  };
}

function deserializeRegExpLiteral() {
  return {
    type: 'RegExpLiteral',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeString(),
    flags: this.deserializeString()
  };
}

function deserializeBigIntLiteral() {
  return {
    type: 'BigIntLiteral',
    loc: this.addEmptyLoc(),
    bigint: this.deserializeString()
  };
}

function deserializeThisExpression() {
  return {
    type: 'ThisExpression',
    loc: this.addEmptyLoc()
  };
}

function deserializeSuper() {
  return {
    type: 'Super',
    loc: this.addEmptyLoc()
  };
}

function deserializeSequenceExpression() {
  return {
    type: 'SequenceExpression',
    loc: this.addEmptyLoc(),
    expressions: this.deserializeNodeList()
  };
}

function deserializeObjectExpression() {
  return {
    type: 'ObjectExpression',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList()
  };
}

function deserializeArrayExpression() {
  return {
    type: 'ArrayExpression',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    trailingComma: this.deserializeBoolean()
  };
}

function deserializeSpreadElement() {
  return {
    type: 'SpreadElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeNewExpression() {
  return {
    type: 'NewExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList()
  };
}

function deserializeYieldExpression() {
  return {
    type: 'YieldExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    delegate: this.deserializeBoolean()
  };
}

function deserializeAwaitExpression() {
  return {
    type: 'AwaitExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeImportExpression() {
  return {
    type: 'ImportExpression',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    attributes: this.deserializeNode()
  };
}

function deserializeCallExpressionLikeFirst() {
  throw new Error('CallExpressionLike' + ' should not appear in program buffer');
}

function deserializeCallExpression() {
  return {
    type: 'CallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList()
  };
}

function deserializeOptionalCallExpression() {
  return {
    type: 'OptionalCallExpression',
    loc: this.addEmptyLoc(),
    callee: this.deserializeNode(),
    typeArguments: this.deserializeNode(),
    arguments: this.deserializeNodeList(),
    optional: this.deserializeBoolean()
  };
}

function deserializeCallExpressionLikeLast() {
  throw new Error('CallExpressionLike' + ' should not appear in program buffer');
}

function deserializeAssignmentExpression() {
  return {
    type: 'AssignmentExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}

function deserializeUnaryExpression() {
  return {
    type: 'UnaryExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}

function deserializeUpdateExpression() {
  return {
    type: 'UpdateExpression',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    argument: this.deserializeNode(),
    prefix: this.deserializeBoolean()
  };
}

function deserializeMemberExpressionLikeFirst() {
  throw new Error('MemberExpressionLike' + ' should not appear in program buffer');
}

function deserializeMemberExpression() {
  return {
    type: 'MemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean()
  };
}

function deserializeOptionalMemberExpression() {
  return {
    type: 'OptionalMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    optional: this.deserializeBoolean()
  };
}

function deserializeMemberExpressionLikeLast() {
  throw new Error('MemberExpressionLike' + ' should not appear in program buffer');
}

function deserializeLogicalExpression() {
  return {
    type: 'LogicalExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}

function deserializeConditionalExpression() {
  return {
    type: 'ConditionalExpression',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    alternate: this.deserializeNode(),
    consequent: this.deserializeNode()
  };
}

function deserializeBinaryExpression() {
  return {
    type: 'BinaryExpression',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    operator: this.deserializeString()
  };
}

function deserializeDirective() {
  return {
    type: 'Directive',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode()
  };
}

function deserializeDirectiveLiteral() {
  return {
    type: 'DirectiveLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeString()
  };
}

function deserializeIdentifier() {
  return {
    type: 'Identifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}

function deserializePrivateName() {
  return {
    type: 'PrivateName',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}

function deserializeMetaProperty() {
  return {
    type: 'MetaProperty',
    loc: this.addEmptyLoc(),
    meta: this.deserializeNode(),
    property: this.deserializeNode()
  };
}

function deserializeSwitchCase() {
  return {
    type: 'SwitchCase',
    loc: this.addEmptyLoc(),
    test: this.deserializeNode(),
    consequent: this.deserializeNodeList()
  };
}

function deserializeCatchClause() {
  return {
    type: 'CatchClause',
    loc: this.addEmptyLoc(),
    param: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeVariableDeclarator() {
  return {
    type: 'VariableDeclarator',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode(),
    id: this.deserializeNode()
  };
}

function deserializeVariableDeclaration() {
  return {
    type: 'VariableDeclaration',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString(),
    declarations: this.deserializeNodeList()
  };
}

function deserializeTemplateLiteral() {
  return {
    type: 'TemplateLiteral',
    loc: this.addEmptyLoc(),
    quasis: this.deserializeNodeList(),
    expressions: this.deserializeNodeList()
  };
}

function deserializeTaggedTemplateExpression() {
  return {
    type: 'TaggedTemplateExpression',
    loc: this.addEmptyLoc(),
    tag: this.deserializeNode(),
    quasi: this.deserializeNode()
  };
}

function deserializeTemplateElement() {
  return {
    type: 'TemplateElement',
    loc: this.addEmptyLoc(),
    tail: this.deserializeBoolean(),
    cooked: this.deserializeString(),
    raw: this.deserializeString()
  };
}

function deserializeProperty() {
  return {
    type: 'Property',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    kind: this.deserializeString(),
    computed: this.deserializeBoolean(),
    method: this.deserializeBoolean(),
    shorthand: this.deserializeBoolean()
  };
}

function deserializeClassDeclaration() {
  return {
    type: 'ClassDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    superClass: this.deserializeNode(),
    superTypeParameters: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    decorators: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeClassExpression() {
  return {
    type: 'ClassExpression',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    superClass: this.deserializeNode(),
    superTypeParameters: this.deserializeNode(),
    implements: this.deserializeNodeList(),
    decorators: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeClassBody() {
  return {
    type: 'ClassBody',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeClassProperty() {
  return {
    type: 'ClassProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    computed: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    declare: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    tsModifiers: this.deserializeNode()
  };
}

function deserializeClassPrivateProperty() {
  return {
    type: 'ClassPrivateProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean(),
    declare: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    tsModifiers: this.deserializeNode()
  };
}

function deserializeMethodDefinition() {
  return {
    type: 'MethodDefinition',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    kind: this.deserializeString(),
    computed: this.deserializeBoolean(),
    static: this.deserializeBoolean()
  };
}

function deserializeImportDeclaration() {
  return {
    type: 'ImportDeclaration',
    loc: this.addEmptyLoc(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    assertions: this.deserializeNodeList(),
    importKind: this.deserializeString()
  };
}

function deserializeImportSpecifier() {
  return {
    type: 'ImportSpecifier',
    loc: this.addEmptyLoc(),
    imported: this.deserializeNode(),
    local: this.deserializeNode(),
    importKind: this.deserializeString()
  };
}

function deserializeImportDefaultSpecifier() {
  return {
    type: 'ImportDefaultSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}

function deserializeImportNamespaceSpecifier() {
  return {
    type: 'ImportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    local: this.deserializeNode()
  };
}

function deserializeImportAttribute() {
  return {
    type: 'ImportAttribute',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode()
  };
}

function deserializeExportNamedDeclaration() {
  return {
    type: 'ExportNamedDeclaration',
    loc: this.addEmptyLoc(),
    declaration: this.deserializeNode(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    exportKind: this.deserializeString()
  };
}

function deserializeExportSpecifier() {
  return {
    type: 'ExportSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode(),
    local: this.deserializeNode()
  };
}

function deserializeExportNamespaceSpecifier() {
  return {
    type: 'ExportNamespaceSpecifier',
    loc: this.addEmptyLoc(),
    exported: this.deserializeNode()
  };
}

function deserializeExportDefaultDeclaration() {
  return {
    type: 'ExportDefaultDeclaration',
    loc: this.addEmptyLoc(),
    declaration: this.deserializeNode()
  };
}

function deserializeExportAllDeclaration() {
  return {
    type: 'ExportAllDeclaration',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode(),
    exportKind: this.deserializeString()
  };
}

function deserializePatternFirst() {
  throw new Error('Pattern' + ' should not appear in program buffer');
}

function deserializeObjectPattern() {
  return {
    type: 'ObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeArrayPattern() {
  return {
    type: 'ArrayPattern',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeRestElement() {
  return {
    type: 'RestElement',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeAssignmentPattern() {
  return {
    type: 'AssignmentPattern',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}

function deserializePatternLast() {
  throw new Error('Pattern' + ' should not appear in program buffer');
}

function deserializeMatchStatementCase() {
  return {
    type: 'MatchStatementCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}

function deserializeMatchExpression() {
  return {
    type: 'MatchExpression',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    cases: this.deserializeNodeList()
  };
}

function deserializeMatchExpressionCase() {
  return {
    type: 'MatchExpressionCase',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    body: this.deserializeNode(),
    guard: this.deserializeNode()
  };
}

function deserializeMatchPatternFirst() {
  throw new Error('MatchPattern' + ' should not appear in program buffer');
}

function deserializeMatchWildcardPattern() {
  return {
    type: 'MatchWildcardPattern',
    loc: this.addEmptyLoc()
  };
}

function deserializeMatchLiteralPattern() {
  return {
    type: 'MatchLiteralPattern',
    loc: this.addEmptyLoc(),
    literal: this.deserializeNode()
  };
}

function deserializeMatchUnaryPattern() {
  return {
    type: 'MatchUnaryPattern',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    operator: this.deserializeString()
  };
}

function deserializeMatchIdentifierPattern() {
  return {
    type: 'MatchIdentifierPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}

function deserializeMatchBindingPattern() {
  return {
    type: 'MatchBindingPattern',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    kind: this.deserializeString()
  };
}

function deserializeMatchObjectPattern() {
  return {
    type: 'MatchObjectPattern',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}

function deserializeMatchArrayPattern() {
  return {
    type: 'MatchArrayPattern',
    loc: this.addEmptyLoc(),
    elements: this.deserializeNodeList(),
    rest: this.deserializeNode()
  };
}

function deserializeMatchOrPattern() {
  return {
    type: 'MatchOrPattern',
    loc: this.addEmptyLoc(),
    patterns: this.deserializeNodeList()
  };
}

function deserializeMatchAsPattern() {
  return {
    type: 'MatchAsPattern',
    loc: this.addEmptyLoc(),
    pattern: this.deserializeNode(),
    target: this.deserializeNode()
  };
}

function deserializeMatchMemberPattern() {
  return {
    type: 'MatchMemberPattern',
    loc: this.addEmptyLoc(),
    base: this.deserializeNode(),
    property: this.deserializeNode()
  };
}

function deserializeMatchPatternLast() {
  throw new Error('MatchPattern' + ' should not appear in program buffer');
}

function deserializeMatchObjectPatternProperty() {
  return {
    type: 'MatchObjectPatternProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    pattern: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}

function deserializeMatchRestPattern() {
  return {
    type: 'MatchRestPattern',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeJSXFirst() {
  throw new Error('JSX' + ' should not appear in program buffer');
}

function deserializeJSXIdentifier() {
  return {
    type: 'JSXIdentifier',
    loc: this.addEmptyLoc(),
    name: this.deserializeString()
  };
}

function deserializeJSXMemberExpression() {
  return {
    type: 'JSXMemberExpression',
    loc: this.addEmptyLoc(),
    object: this.deserializeNode(),
    property: this.deserializeNode()
  };
}

function deserializeJSXNamespacedName() {
  return {
    type: 'JSXNamespacedName',
    loc: this.addEmptyLoc(),
    namespace: this.deserializeNode(),
    name: this.deserializeNode()
  };
}

function deserializeJSXEmptyExpression() {
  return {
    type: 'JSXEmptyExpression',
    loc: this.addEmptyLoc()
  };
}

function deserializeJSXExpressionContainer() {
  return {
    type: 'JSXExpressionContainer',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}

function deserializeJSXSpreadChild() {
  return {
    type: 'JSXSpreadChild',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}

function deserializeJSXOpeningElement() {
  return {
    type: 'JSXOpeningElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    attributes: this.deserializeNodeList(),
    selfClosing: this.deserializeBoolean(),
    typeArguments: this.deserializeNode()
  };
}

function deserializeJSXClosingElement() {
  return {
    type: 'JSXClosingElement',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode()
  };
}

function deserializeJSXAttribute() {
  return {
    type: 'JSXAttribute',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    value: this.deserializeNode()
  };
}

function deserializeJSXSpreadAttribute() {
  return {
    type: 'JSXSpreadAttribute',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeJSXStringLiteral() {
  return {
    type: 'JSXStringLiteral',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}

function deserializeJSXText() {
  return {
    type: 'JSXText',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}

function deserializeJSXElement() {
  return {
    type: 'JSXElement',
    loc: this.addEmptyLoc(),
    openingElement: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingElement: this.deserializeNode()
  };
}

function deserializeJSXFragment() {
  return {
    type: 'JSXFragment',
    loc: this.addEmptyLoc(),
    openingFragment: this.deserializeNode(),
    children: this.deserializeNodeList(),
    closingFragment: this.deserializeNode()
  };
}

function deserializeJSXOpeningFragment() {
  return {
    type: 'JSXOpeningFragment',
    loc: this.addEmptyLoc()
  };
}

function deserializeJSXClosingFragment() {
  return {
    type: 'JSXClosingFragment',
    loc: this.addEmptyLoc()
  };
}

function deserializeJSXLast() {
  throw new Error('JSX' + ' should not appear in program buffer');
}

function deserializeFlowFirst() {
  throw new Error('Flow' + ' should not appear in program buffer');
}

function deserializeExistsTypeAnnotation() {
  return {
    type: 'ExistsTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeEmptyTypeAnnotation() {
  return {
    type: 'EmptyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeStringTypeAnnotation() {
  return {
    type: 'StringTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeNumberTypeAnnotation() {
  return {
    type: 'NumberTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeStringLiteralTypeAnnotation() {
  return {
    type: 'StringLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeString(),
    raw: this.deserializeString()
  };
}

function deserializeNumberLiteralTypeAnnotation() {
  return {
    type: 'NumberLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeNumber(),
    raw: this.deserializeString()
  };
}

function deserializeBigIntLiteralTypeAnnotation() {
  return {
    type: 'BigIntLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    raw: this.deserializeString()
  };
}

function deserializeBooleanTypeAnnotation() {
  return {
    type: 'BooleanTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeBooleanLiteralTypeAnnotation() {
  return {
    type: 'BooleanLiteralTypeAnnotation',
    loc: this.addEmptyLoc(),
    value: this.deserializeBoolean(),
    raw: this.deserializeString()
  };
}

function deserializeNullLiteralTypeAnnotation() {
  return {
    type: 'NullLiteralTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeSymbolTypeAnnotation() {
  return {
    type: 'SymbolTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeAnyTypeAnnotation() {
  return {
    type: 'AnyTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeMixedTypeAnnotation() {
  return {
    type: 'MixedTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeBigIntTypeAnnotation() {
  return {
    type: 'BigIntTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeVoidTypeAnnotation() {
  return {
    type: 'VoidTypeAnnotation',
    loc: this.addEmptyLoc()
  };
}

function deserializeFunctionTypeAnnotation() {
  return {
    type: 'FunctionTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    this: this.deserializeNode(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeHookTypeAnnotation() {
  return {
    type: 'HookTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeFunctionTypeParam() {
  return {
    type: 'FunctionTypeParam',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}

function deserializeComponentTypeAnnotation() {
  return {
    type: 'ComponentTypeAnnotation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    rendersType: this.deserializeNode()
  };
}

function deserializeComponentTypeParameter() {
  return {
    type: 'ComponentTypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}

function deserializeNullableTypeAnnotation() {
  return {
    type: 'NullableTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeQualifiedTypeIdentifier() {
  return {
    type: 'QualifiedTypeIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}

function deserializeTypeofTypeAnnotation() {
  return {
    type: 'TypeofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode(),
    typeArguments: this.deserializeNode()
  };
}

function deserializeKeyofTypeAnnotation() {
  return {
    type: 'KeyofTypeAnnotation',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeTypeOperator() {
  return {
    type: 'TypeOperator',
    loc: this.addEmptyLoc(),
    operator: this.deserializeString(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeQualifiedTypeofIdentifier() {
  return {
    type: 'QualifiedTypeofIdentifier',
    loc: this.addEmptyLoc(),
    qualification: this.deserializeNode(),
    id: this.deserializeNode()
  };
}

function deserializeTupleTypeAnnotation() {
  return {
    type: 'TupleTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList(),
    inexact: this.deserializeBoolean()
  };
}

function deserializeTupleTypeSpreadElement() {
  return {
    type: 'TupleTypeSpreadElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTupleTypeLabeledElement() {
  return {
    type: 'TupleTypeLabeledElement',
    loc: this.addEmptyLoc(),
    label: this.deserializeNode(),
    elementType: this.deserializeNode(),
    optional: this.deserializeBoolean(),
    variance: this.deserializeNode()
  };
}

function deserializeArrayTypeAnnotation() {
  return {
    type: 'ArrayTypeAnnotation',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode()
  };
}

function deserializeInferTypeAnnotation() {
  return {
    type: 'InferTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeParameter: this.deserializeNode()
  };
}

function deserializeUnionTypeAnnotation() {
  return {
    type: 'UnionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}

function deserializeIntersectionTypeAnnotation() {
  return {
    type: 'IntersectionTypeAnnotation',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}

function deserializeGenericTypeAnnotation() {
  return {
    type: 'GenericTypeAnnotation',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeIndexedAccessType() {
  return {
    type: 'IndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode()
  };
}

function deserializeOptionalIndexedAccessType() {
  return {
    type: 'OptionalIndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}

function deserializeConditionalTypeAnnotation() {
  return {
    type: 'ConditionalTypeAnnotation',
    loc: this.addEmptyLoc(),
    checkType: this.deserializeNode(),
    extendsType: this.deserializeNode(),
    trueType: this.deserializeNode(),
    falseType: this.deserializeNode()
  };
}

function deserializeTypePredicate() {
  return {
    type: 'TypePredicate',
    loc: this.addEmptyLoc(),
    parameterName: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    kind: this.deserializeString()
  };
}

function deserializeInterfaceTypeAnnotation() {
  return {
    type: 'InterfaceTypeAnnotation',
    loc: this.addEmptyLoc(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeTypeAlias() {
  return {
    type: 'TypeAlias',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    right: this.deserializeNode()
  };
}

function deserializeOpaqueType() {
  return {
    type: 'OpaqueType',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    impltype: this.deserializeNode(),
    supertype: this.deserializeNode()
  };
}

function deserializeInterfaceDeclaration() {
  return {
    type: 'InterfaceDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareTypeAlias() {
  return {
    type: 'DeclareTypeAlias',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    right: this.deserializeNode()
  };
}

function deserializeDeclareOpaqueType() {
  return {
    type: 'DeclareOpaqueType',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    impltype: this.deserializeNode(),
    supertype: this.deserializeNode()
  };
}

function deserializeDeclareInterface() {
  return {
    type: 'DeclareInterface',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareClass() {
  return {
    type: 'DeclareClass',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    implements: this.deserializeNodeList(),
    mixins: this.deserializeNodeList(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareFunction() {
  return {
    type: 'DeclareFunction',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    predicate: this.deserializeNode()
  };
}

function deserializeDeclareHook() {
  return {
    type: 'DeclareHook',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}

function deserializeDeclareComponent() {
  return {
    type: 'DeclareComponent',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    params: this.deserializeNodeList(),
    rest: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    rendersType: this.deserializeNode()
  };
}

function deserializeDeclareVariable() {
  return {
    type: 'DeclareVariable',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    kind: this.deserializeString()
  };
}

function deserializeDeclareEnum() {
  return {
    type: 'DeclareEnum',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareExportDeclaration() {
  return {
    type: 'DeclareExportDeclaration',
    loc: this.addEmptyLoc(),
    declaration: this.deserializeNode(),
    specifiers: this.deserializeNodeList(),
    source: this.deserializeNode(),
    default: this.deserializeBoolean()
  };
}

function deserializeDeclareExportAllDeclaration() {
  return {
    type: 'DeclareExportAllDeclaration',
    loc: this.addEmptyLoc(),
    source: this.deserializeNode()
  };
}

function deserializeDeclareModule() {
  return {
    type: 'DeclareModule',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareNamespace() {
  return {
    type: 'DeclareNamespace',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeDeclareModuleExports() {
  return {
    type: 'DeclareModuleExports',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeInterfaceExtends() {
  return {
    type: 'InterfaceExtends',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeClassImplements() {
  return {
    type: 'ClassImplements',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTypeAnnotation() {
  return {
    type: 'TypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeObjectTypeAnnotation() {
  return {
    type: 'ObjectTypeAnnotation',
    loc: this.addEmptyLoc(),
    properties: this.deserializeNodeList(),
    indexers: this.deserializeNodeList(),
    callProperties: this.deserializeNodeList(),
    internalSlots: this.deserializeNodeList(),
    inexact: this.deserializeBoolean(),
    exact: this.deserializeBoolean()
  };
}

function deserializeObjectTypeProperty() {
  return {
    type: 'ObjectTypeProperty',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    method: this.deserializeBoolean(),
    optional: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    proto: this.deserializeBoolean(),
    variance: this.deserializeNode(),
    kind: this.deserializeString()
  };
}

function deserializeObjectTypeSpreadProperty() {
  return {
    type: 'ObjectTypeSpreadProperty',
    loc: this.addEmptyLoc(),
    argument: this.deserializeNode()
  };
}

function deserializeObjectTypeInternalSlot() {
  return {
    type: 'ObjectTypeInternalSlot',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    value: this.deserializeNode(),
    optional: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    method: this.deserializeBoolean()
  };
}

function deserializeObjectTypeCallProperty() {
  return {
    type: 'ObjectTypeCallProperty',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean()
  };
}

function deserializeObjectTypeIndexer() {
  return {
    type: 'ObjectTypeIndexer',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    key: this.deserializeNode(),
    value: this.deserializeNode(),
    static: this.deserializeBoolean(),
    variance: this.deserializeNode()
  };
}

function deserializeObjectTypeMappedTypeProperty() {
  return {
    type: 'ObjectTypeMappedTypeProperty',
    loc: this.addEmptyLoc(),
    keyTparam: this.deserializeNode(),
    propType: this.deserializeNode(),
    sourceType: this.deserializeNode(),
    variance: this.deserializeNode(),
    optional: this.deserializeString()
  };
}

function deserializeVariance() {
  return {
    type: 'Variance',
    loc: this.addEmptyLoc(),
    kind: this.deserializeString()
  };
}

function deserializeTypeParameterDeclaration() {
  return {
    type: 'TypeParameterDeclaration',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}

function deserializeTypeParameter() {
  return {
    type: 'TypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeString(),
    const: this.deserializeBoolean(),
    bound: this.deserializeNode(),
    variance: this.deserializeNode(),
    default: this.deserializeNode(),
    usesExtendsBound: this.deserializeBoolean()
  };
}

function deserializeTypeParameterInstantiation() {
  return {
    type: 'TypeParameterInstantiation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}

function deserializeTypeCastExpression() {
  return {
    type: 'TypeCastExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeAsExpression() {
  return {
    type: 'AsExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeAsConstExpression() {
  return {
    type: 'AsConstExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode()
  };
}

function deserializeInferredPredicate() {
  return {
    type: 'InferredPredicate',
    loc: this.addEmptyLoc()
  };
}

function deserializeDeclaredPredicate() {
  return {
    type: 'DeclaredPredicate',
    loc: this.addEmptyLoc(),
    value: this.deserializeNode()
  };
}

function deserializeEnumDeclaration() {
  return {
    type: 'EnumDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeEnumStringBody() {
  return {
    type: 'EnumStringBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}

function deserializeEnumNumberBody() {
  return {
    type: 'EnumNumberBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}

function deserializeEnumBigIntBody() {
  return {
    type: 'EnumBigIntBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}

function deserializeEnumBooleanBody() {
  return {
    type: 'EnumBooleanBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    explicitType: this.deserializeBoolean(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}

function deserializeEnumSymbolBody() {
  return {
    type: 'EnumSymbolBody',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList(),
    hasUnknownMembers: this.deserializeBoolean()
  };
}

function deserializeEnumDefaultedMember() {
  return {
    type: 'EnumDefaultedMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode()
  };
}

function deserializeEnumStringMember() {
  return {
    type: 'EnumStringMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}

function deserializeEnumNumberMember() {
  return {
    type: 'EnumNumberMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}

function deserializeEnumBigIntMember() {
  return {
    type: 'EnumBigIntMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}

function deserializeEnumBooleanMember() {
  return {
    type: 'EnumBooleanMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    init: this.deserializeNode()
  };
}

function deserializeComponentParameter() {
  return {
    type: 'ComponentParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    local: this.deserializeNode(),
    shorthand: this.deserializeBoolean()
  };
}

function deserializeFlowLast() {
  throw new Error('Flow' + ' should not appear in program buffer');
}

function deserializeTSFirst() {
  throw new Error('TS' + ' should not appear in program buffer');
}

function deserializeTSTypeAnnotation() {
  return {
    type: 'TSTypeAnnotation',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTSAnyKeyword() {
  return {
    type: 'TSAnyKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSNumberKeyword() {
  return {
    type: 'TSNumberKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSBooleanKeyword() {
  return {
    type: 'TSBooleanKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSStringKeyword() {
  return {
    type: 'TSStringKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSSymbolKeyword() {
  return {
    type: 'TSSymbolKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSVoidKeyword() {
  return {
    type: 'TSVoidKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSUndefinedKeyword() {
  return {
    type: 'TSUndefinedKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSUnknownKeyword() {
  return {
    type: 'TSUnknownKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSNeverKeyword() {
  return {
    type: 'TSNeverKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSBigIntKeyword() {
  return {
    type: 'TSBigIntKeyword',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSThisType() {
  return {
    type: 'TSThisType',
    loc: this.addEmptyLoc()
  };
}

function deserializeTSLiteralType() {
  return {
    type: 'TSLiteralType',
    loc: this.addEmptyLoc(),
    literal: this.deserializeNode()
  };
}

function deserializeTSIndexedAccessType() {
  return {
    type: 'TSIndexedAccessType',
    loc: this.addEmptyLoc(),
    objectType: this.deserializeNode(),
    indexType: this.deserializeNode()
  };
}

function deserializeTSArrayType() {
  return {
    type: 'TSArrayType',
    loc: this.addEmptyLoc(),
    elementType: this.deserializeNode()
  };
}

function deserializeTSTypeReference() {
  return {
    type: 'TSTypeReference',
    loc: this.addEmptyLoc(),
    typeName: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTSQualifiedName() {
  return {
    type: 'TSQualifiedName',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode()
  };
}

function deserializeTSFunctionType() {
  return {
    type: 'TSFunctionType',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTSConstructorType() {
  return {
    type: 'TSConstructorType',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTSTypePredicate() {
  return {
    type: 'TSTypePredicate',
    loc: this.addEmptyLoc(),
    parameterName: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTSTupleType() {
  return {
    type: 'TSTupleType',
    loc: this.addEmptyLoc(),
    elementTypes: this.deserializeNodeList()
  };
}

function deserializeTSTypeAssertion() {
  return {
    type: 'TSTypeAssertion',
    loc: this.addEmptyLoc(),
    typeAnnotation: this.deserializeNode(),
    expression: this.deserializeNode()
  };
}

function deserializeTSAsExpression() {
  return {
    type: 'TSAsExpression',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTSParameterProperty() {
  return {
    type: 'TSParameterProperty',
    loc: this.addEmptyLoc(),
    parameter: this.deserializeNode(),
    accessibility: this.deserializeString(),
    readonly: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    export: this.deserializeBoolean()
  };
}

function deserializeTSTypeAliasDeclaration() {
  return {
    type: 'TSTypeAliasDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    typeParameters: this.deserializeNode(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTSInterfaceDeclaration() {
  return {
    type: 'TSInterfaceDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode(),
    extends: this.deserializeNodeList(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTSInterfaceHeritage() {
  return {
    type: 'TSInterfaceHeritage',
    loc: this.addEmptyLoc(),
    expression: this.deserializeNode(),
    typeParameters: this.deserializeNode()
  };
}

function deserializeTSInterfaceBody() {
  return {
    type: 'TSInterfaceBody',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeTSEnumDeclaration() {
  return {
    type: 'TSEnumDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    members: this.deserializeNodeList()
  };
}

function deserializeTSEnumMember() {
  return {
    type: 'TSEnumMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    initializer: this.deserializeNode()
  };
}

function deserializeTSModuleDeclaration() {
  return {
    type: 'TSModuleDeclaration',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    body: this.deserializeNode()
  };
}

function deserializeTSModuleBlock() {
  return {
    type: 'TSModuleBlock',
    loc: this.addEmptyLoc(),
    body: this.deserializeNodeList()
  };
}

function deserializeTSModuleMember() {
  return {
    type: 'TSModuleMember',
    loc: this.addEmptyLoc(),
    id: this.deserializeNode(),
    initializer: this.deserializeNode()
  };
}

function deserializeTSTypeParameterDeclaration() {
  return {
    type: 'TSTypeParameterDeclaration',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}

function deserializeTSTypeParameter() {
  return {
    type: 'TSTypeParameter',
    loc: this.addEmptyLoc(),
    name: this.deserializeNode(),
    constraint: this.deserializeNode(),
    default: this.deserializeNode()
  };
}

function deserializeTSTypeParameterInstantiation() {
  return {
    type: 'TSTypeParameterInstantiation',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList()
  };
}

function deserializeTSUnionType() {
  return {
    type: 'TSUnionType',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}

function deserializeTSIntersectionType() {
  return {
    type: 'TSIntersectionType',
    loc: this.addEmptyLoc(),
    types: this.deserializeNodeList()
  };
}

function deserializeTSTypeQuery() {
  return {
    type: 'TSTypeQuery',
    loc: this.addEmptyLoc(),
    exprName: this.deserializeNode()
  };
}

function deserializeTSConditionalType() {
  return {
    type: 'TSConditionalType',
    loc: this.addEmptyLoc(),
    checkType: this.deserializeNode(),
    extendsType: this.deserializeNode(),
    trueType: this.deserializeNode(),
    falseType: this.deserializeNode()
  };
}

function deserializeTSTypeLiteral() {
  return {
    type: 'TSTypeLiteral',
    loc: this.addEmptyLoc(),
    members: this.deserializeNodeList()
  };
}

function deserializeTSPropertySignature() {
  return {
    type: 'TSPropertySignature',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    typeAnnotation: this.deserializeNode(),
    initializer: this.deserializeNode(),
    optional: this.deserializeBoolean(),
    computed: this.deserializeBoolean(),
    readonly: this.deserializeBoolean(),
    static: this.deserializeBoolean(),
    export: this.deserializeBoolean()
  };
}

function deserializeTSMethodSignature() {
  return {
    type: 'TSMethodSignature',
    loc: this.addEmptyLoc(),
    key: this.deserializeNode(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode(),
    computed: this.deserializeBoolean()
  };
}

function deserializeTSIndexSignature() {
  return {
    type: 'TSIndexSignature',
    loc: this.addEmptyLoc(),
    parameters: this.deserializeNodeList(),
    typeAnnotation: this.deserializeNode()
  };
}

function deserializeTSCallSignatureDeclaration() {
  return {
    type: 'TSCallSignatureDeclaration',
    loc: this.addEmptyLoc(),
    params: this.deserializeNodeList(),
    returnType: this.deserializeNode()
  };
}

function deserializeTSModifiers() {
  return {
    type: 'TSModifiers',
    loc: this.addEmptyLoc(),
    accessibility: this.deserializeString(),
    readonly: this.deserializeBoolean()
  };
}

function deserializeTSLast() {
  throw new Error('TS' + ' should not appear in program buffer');
}

function deserializeCoverFirst() {
  throw new Error('Cover' + ' should not appear in program buffer');
}

function deserializeCoverEmptyArgs() {
  return {
    type: 'CoverEmptyArgs',
    loc: this.addEmptyLoc()
  };
}

function deserializeCoverTrailingComma() {
  return {
    type: 'CoverTrailingComma',
    loc: this.addEmptyLoc()
  };
}

function deserializeCoverInitializer() {
  return {
    type: 'CoverInitializer',
    loc: this.addEmptyLoc(),
    init: this.deserializeNode()
  };
}

function deserializeCoverRestElement() {
  return {
    type: 'CoverRestElement',
    loc: this.addEmptyLoc(),
    rest: this.deserializeNode()
  };
}

function deserializeCoverTypedIdentifier() {
  return {
    type: 'CoverTypedIdentifier',
    loc: this.addEmptyLoc(),
    left: this.deserializeNode(),
    right: this.deserializeNode(),
    optional: this.deserializeBoolean()
  };
}

function deserializeCoverLast() {
  throw new Error('Cover' + ' should not appear in program buffer');
}

module.exports = [deserializeEmpty, deserializeMetadata, deserializeFunctionLikeFirst, deserializeProgram, deserializeFunctionExpression, deserializeArrowFunctionExpression, deserializeFunctionDeclaration, deserializeComponentDeclaration, deserializeHookDeclaration, deserializeFunctionLikeLast, deserializeStatementFirst, deserializeMatchStatement, deserializeLoopStatementFirst, deserializeWhileStatement, deserializeDoWhileStatement, deserializeForInStatement, deserializeForOfStatement, deserializeForStatement, deserializeLoopStatementLast, deserializeDebuggerStatement, deserializeEmptyStatement, deserializeBlockStatement, deserializeStaticBlock, deserializeBreakStatement, deserializeContinueStatement, deserializeThrowStatement, deserializeReturnStatement, deserializeWithStatement, deserializeSwitchStatement, deserializeLabeledStatement, deserializeExpressionStatement, deserializeTryStatement, deserializeIfStatement, deserializeStatementLast, deserializeNullLiteral, deserializeBooleanLiteral, deserializeStringLiteral, deserializeNumericLiteral, deserializeRegExpLiteral, deserializeBigIntLiteral, deserializeThisExpression, deserializeSuper, deserializeSequenceExpression, deserializeObjectExpression, deserializeArrayExpression, deserializeSpreadElement, deserializeNewExpression, deserializeYieldExpression, deserializeAwaitExpression, deserializeImportExpression, deserializeCallExpressionLikeFirst, deserializeCallExpression, deserializeOptionalCallExpression, deserializeCallExpressionLikeLast, deserializeAssignmentExpression, deserializeUnaryExpression, deserializeUpdateExpression, deserializeMemberExpressionLikeFirst, deserializeMemberExpression, deserializeOptionalMemberExpression, deserializeMemberExpressionLikeLast, deserializeLogicalExpression, deserializeConditionalExpression, deserializeBinaryExpression, deserializeDirective, deserializeDirectiveLiteral, deserializeIdentifier, deserializePrivateName, deserializeMetaProperty, deserializeSwitchCase, deserializeCatchClause, deserializeVariableDeclarator, deserializeVariableDeclaration, deserializeTemplateLiteral, deserializeTaggedTemplateExpression, deserializeTemplateElement, deserializeProperty, deserializeClassDeclaration, deserializeClassExpression, deserializeClassBody, deserializeClassProperty, deserializeClassPrivateProperty, deserializeMethodDefinition, deserializeImportDeclaration, deserializeImportSpecifier, deserializeImportDefaultSpecifier, deserializeImportNamespaceSpecifier, deserializeImportAttribute, deserializeExportNamedDeclaration, deserializeExportSpecifier, deserializeExportNamespaceSpecifier, deserializeExportDefaultDeclaration, deserializeExportAllDeclaration, deserializePatternFirst, deserializeObjectPattern, deserializeArrayPattern, deserializeRestElement, deserializeAssignmentPattern, deserializePatternLast, deserializeMatchStatementCase, deserializeMatchExpression, deserializeMatchExpressionCase, deserializeMatchPatternFirst, deserializeMatchWildcardPattern, deserializeMatchLiteralPattern, deserializeMatchUnaryPattern, deserializeMatchIdentifierPattern, deserializeMatchBindingPattern, deserializeMatchObjectPattern, deserializeMatchArrayPattern, deserializeMatchOrPattern, deserializeMatchAsPattern, deserializeMatchMemberPattern, deserializeMatchPatternLast, deserializeMatchObjectPatternProperty, deserializeMatchRestPattern, deserializeJSXFirst, deserializeJSXIdentifier, deserializeJSXMemberExpression, deserializeJSXNamespacedName, deserializeJSXEmptyExpression, deserializeJSXExpressionContainer, deserializeJSXSpreadChild, deserializeJSXOpeningElement, deserializeJSXClosingElement, deserializeJSXAttribute, deserializeJSXSpreadAttribute, deserializeJSXStringLiteral, deserializeJSXText, deserializeJSXElement, deserializeJSXFragment, deserializeJSXOpeningFragment, deserializeJSXClosingFragment, deserializeJSXLast, deserializeFlowFirst, deserializeExistsTypeAnnotation, deserializeEmptyTypeAnnotation, deserializeStringTypeAnnotation, deserializeNumberTypeAnnotation, deserializeStringLiteralTypeAnnotation, deserializeNumberLiteralTypeAnnotation, deserializeBigIntLiteralTypeAnnotation, deserializeBooleanTypeAnnotation, deserializeBooleanLiteralTypeAnnotation, deserializeNullLiteralTypeAnnotation, deserializeSymbolTypeAnnotation, deserializeAnyTypeAnnotation, deserializeMixedTypeAnnotation, deserializeBigIntTypeAnnotation, deserializeVoidTypeAnnotation, deserializeFunctionTypeAnnotation, deserializeHookTypeAnnotation, deserializeFunctionTypeParam, deserializeComponentTypeAnnotation, deserializeComponentTypeParameter, deserializeNullableTypeAnnotation, deserializeQualifiedTypeIdentifier, deserializeTypeofTypeAnnotation, deserializeKeyofTypeAnnotation, deserializeTypeOperator, deserializeQualifiedTypeofIdentifier, deserializeTupleTypeAnnotation, deserializeTupleTypeSpreadElement, deserializeTupleTypeLabeledElement, deserializeArrayTypeAnnotation, deserializeInferTypeAnnotation, deserializeUnionTypeAnnotation, deserializeIntersectionTypeAnnotation, deserializeGenericTypeAnnotation, deserializeIndexedAccessType, deserializeOptionalIndexedAccessType, deserializeConditionalTypeAnnotation, deserializeTypePredicate, deserializeInterfaceTypeAnnotation, deserializeTypeAlias, deserializeOpaqueType, deserializeInterfaceDeclaration, deserializeDeclareTypeAlias, deserializeDeclareOpaqueType, deserializeDeclareInterface, deserializeDeclareClass, deserializeDeclareFunction, deserializeDeclareHook, deserializeDeclareComponent, deserializeDeclareVariable, deserializeDeclareEnum, deserializeDeclareExportDeclaration, deserializeDeclareExportAllDeclaration, deserializeDeclareModule, deserializeDeclareNamespace, deserializeDeclareModuleExports, deserializeInterfaceExtends, deserializeClassImplements, deserializeTypeAnnotation, deserializeObjectTypeAnnotation, deserializeObjectTypeProperty, deserializeObjectTypeSpreadProperty, deserializeObjectTypeInternalSlot, deserializeObjectTypeCallProperty, deserializeObjectTypeIndexer, deserializeObjectTypeMappedTypeProperty, deserializeVariance, deserializeTypeParameterDeclaration, deserializeTypeParameter, deserializeTypeParameterInstantiation, deserializeTypeCastExpression, deserializeAsExpression, deserializeAsConstExpression, deserializeInferredPredicate, deserializeDeclaredPredicate, deserializeEnumDeclaration, deserializeEnumStringBody, deserializeEnumNumberBody, deserializeEnumBigIntBody, deserializeEnumBooleanBody, deserializeEnumSymbolBody, deserializeEnumDefaultedMember, deserializeEnumStringMember, deserializeEnumNumberMember, deserializeEnumBigIntMember, deserializeEnumBooleanMember, deserializeComponentParameter, deserializeFlowLast, deserializeTSFirst, deserializeTSTypeAnnotation, deserializeTSAnyKeyword, deserializeTSNumberKeyword, deserializeTSBooleanKeyword, deserializeTSStringKeyword, deserializeTSSymbolKeyword, deserializeTSVoidKeyword, deserializeTSUndefinedKeyword, deserializeTSUnknownKeyword, deserializeTSNeverKeyword, deserializeTSBigIntKeyword, deserializeTSThisType, deserializeTSLiteralType, deserializeTSIndexedAccessType, deserializeTSArrayType, deserializeTSTypeReference, deserializeTSQualifiedName, deserializeTSFunctionType, deserializeTSConstructorType, deserializeTSTypePredicate, deserializeTSTupleType, deserializeTSTypeAssertion, deserializeTSAsExpression, deserializeTSParameterProperty, deserializeTSTypeAliasDeclaration, deserializeTSInterfaceDeclaration, deserializeTSInterfaceHeritage, deserializeTSInterfaceBody, deserializeTSEnumDeclaration, deserializeTSEnumMember, deserializeTSModuleDeclaration, deserializeTSModuleBlock, deserializeTSModuleMember, deserializeTSTypeParameterDeclaration, deserializeTSTypeParameter, deserializeTSTypeParameterInstantiation, deserializeTSUnionType, deserializeTSIntersectionType, deserializeTSTypeQuery, deserializeTSConditionalType, deserializeTSTypeLiteral, deserializeTSPropertySignature, deserializeTSMethodSignature, deserializeTSIndexSignature, deserializeTSCallSignatureDeclaration, deserializeTSModifiers, deserializeTSLast, deserializeCoverFirst, deserializeCoverEmptyArgs, deserializeCoverTrailingComma, deserializeCoverInitializer, deserializeCoverRestElement, deserializeCoverTypedIdentifier, deserializeCoverLast];