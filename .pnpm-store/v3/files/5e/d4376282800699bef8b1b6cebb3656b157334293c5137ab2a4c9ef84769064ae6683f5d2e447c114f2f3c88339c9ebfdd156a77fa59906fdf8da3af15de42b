/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

/**
 * Transform match expressions and statements.
 */

import type {ParserOptions} from '../ParserOptions';
import type {
  BinaryExpression,
  BreakStatement,
  ESNode,
  Expression,
  Identifier,
  Literal,
  MatchExpression,
  MatchMemberPattern,
  MatchPattern,
  MatchStatement,
  MemberExpression,
  ObjectPattern,
  Program,
  Statement,
  Super,
  UnaryExpression,
  VariableDeclaration,
} from 'hermes-estree';

import {SimpleTransform} from '../transform/SimpleTransform';
import {
  deepCloneNode,
  shallowCloneNode,
} from '../transform/astNodeMutationHelpers';
import {createSyntaxError} from '../utils/createSyntaxError';
import {
  EMPTY_PARENT,
  callExpression,
  conjunction,
  disjunction,
  etc,
  ident,
  iife,
  nullLiteral,
  numberLiteral,
  stringLiteral,
  throwStatement,
  variableDeclaration,
} from '../utils/Builders';
import {createGenID} from '../utils/GenID';

/**
 * Generated identifiers.
 * `GenID` is initialized in the transform.
 */
let GenID: ?ReturnType<typeof createGenID> = null;
function genIdent(): Identifier {
  if (GenID == null) {
    throw Error('GenID must be initialized at the start of the transform.');
  }
  return ident(GenID.genID());
}

/**
 * A series of properties.
 * When combined with the match argument (the root expression), provides the
 * location of to be tested against, or location to be extracted to a binding.
 */
type Key = Array<Identifier | Literal>;

/**
 * The conditional aspect of a match pattern for a single location.
 */
type Condition =
  | {type: 'eq', key: Key, arg: Expression}
  | {type: 'is-nan', key: Key}
  | {type: 'array', key: Key, length: number, lengthOp: 'eq' | 'gte'}
  | {type: 'object', key: Key}
  | {type: 'prop-exists', key: Key, propName: string}
  | {type: 'or', orConditions: Array<Array<Condition>>};

/**
 * A binding introduced by a match pattern.
 */
type Binding =
  | {type: 'id', key: Key, kind: BindingKind, id: Identifier}
  | {
      type: 'array-rest',
      key: Key,
      kind: BindingKind,
      id: Identifier,
      exclude: number,
    }
  | {
      type: 'object-rest',
      key: Key,
      kind: BindingKind,
      id: Identifier,
      exclude: Array<Identifier | Literal>,
    };
type BindingKind = VariableDeclaration['kind'];

function objKeyToString(node: Identifier | Literal): string {
  switch (node.type) {
    case 'Identifier':
      return node.name;
    case 'Literal': {
      const {value} = node;
      if (typeof value === 'number') {
        return String(value);
      } else if (typeof value === 'string') {
        return value;
      } else {
        return node.raw;
      }
    }
  }
}

function convertMemberPattern(pattern: MatchMemberPattern): MemberExpression {
  const {base, property, loc, range} = pattern;
  const object =
    base.type === 'MatchIdentifierPattern'
      ? base.id
      : convertMemberPattern(base);
  if (property.type === 'Identifier') {
    return {
      type: 'MemberExpression',
      object,
      property,
      computed: false,
      optional: false,
      ...etc({loc, range}),
    };
  } else {
    return {
      type: 'MemberExpression',
      object,
      property,
      computed: true,
      optional: false,
      ...etc({loc, range}),
    };
  }
}

function checkDuplicateBindingName(
  seenBindingNames: Set<string>,
  node: MatchPattern,
  name: string,
): void {
  if (seenBindingNames.has(name)) {
    throw createSyntaxError(
      node,
      `Duplicate variable name '${name}' in match case pattern.`,
    );
  }
  seenBindingNames.add(name);
}

function checkBindingKind(node: MatchPattern, kind: BindingKind): void {
  if (kind === 'var') {
    throw createSyntaxError(
      node,
      `'var' bindings are not allowed. Use 'const' or 'let'.`,
    );
  }
}

/**
 * Analyzes a match pattern, and produced both the conditions and bindings
 * produced by that pattern.
 */
function analyzePattern(
  pattern: MatchPattern,
  key: Key,
  seenBindingNames: Set<string>,
): {
  conditions: Array<Condition>,
  bindings: Array<Binding>,
} {
  switch (pattern.type) {
    case 'MatchWildcardPattern': {
      return {conditions: [], bindings: []};
    }
    case 'MatchLiteralPattern': {
      const {literal} = pattern;
      const condition: Condition = {type: 'eq', key, arg: literal};
      return {conditions: [condition], bindings: []};
    }
    case 'MatchUnaryPattern': {
      const {operator, argument, loc, range} = pattern;
      if (argument.value === 0) {
        // We haven't decided whether we will compare these using `===` or `Object.is`
        throw createSyntaxError(
          pattern,
          `'+0' and '-0' are not yet supported in match unary patterns.`,
        );
      }
      const arg: UnaryExpression = {
        type: 'UnaryExpression',
        operator,
        argument,
        prefix: true,
        ...etc({loc, range}),
      };
      const condition: Condition = {type: 'eq', key, arg};
      return {conditions: [condition], bindings: []};
    }
    case 'MatchIdentifierPattern': {
      const {id} = pattern;
      const condition: Condition =
        id.name === 'NaN' ? {type: 'is-nan', key} : {type: 'eq', key, arg: id};
      return {conditions: [condition], bindings: []};
    }
    case 'MatchMemberPattern': {
      const arg = convertMemberPattern(pattern);
      const condition: Condition = {type: 'eq', key, arg};
      return {conditions: [condition], bindings: []};
    }
    case 'MatchBindingPattern': {
      const {id, kind} = pattern;
      checkDuplicateBindingName(seenBindingNames, pattern, id.name);
      checkBindingKind(pattern, kind);
      const binding: Binding = {type: 'id', key, kind, id};
      return {conditions: [], bindings: [binding]};
    }
    case 'MatchAsPattern': {
      const {pattern: asPattern, target} = pattern;
      if (asPattern.type === 'MatchBindingPattern') {
        throw createSyntaxError(
          pattern,
          `Match 'as' patterns are not allowed directly on binding patterns.`,
        );
      }
      const {conditions, bindings} = analyzePattern(
        asPattern,
        key,
        seenBindingNames,
      );
      const [id, kind] =
        target.type === 'MatchBindingPattern'
          ? [target.id, target.kind]
          : [target, 'const'];
      checkDuplicateBindingName(seenBindingNames, pattern, id.name);
      checkBindingKind(pattern, kind);
      const binding: Binding = {type: 'id', key, kind, id};
      return {conditions, bindings: bindings.concat(binding)};
    }
    case 'MatchArrayPattern': {
      const {elements, rest} = pattern;
      const lengthOp = rest == null ? 'eq' : 'gte';
      const conditions: Array<Condition> = [
        {type: 'array', key, length: elements.length, lengthOp},
      ];
      const bindings: Array<Binding> = [];
      elements.forEach((element, i) => {
        const elementKey = key.concat(numberLiteral(i));
        const {conditions: childConditions, bindings: childBindings} =
          analyzePattern(element, elementKey, seenBindingNames);
        conditions.push(...childConditions);
        bindings.push(...childBindings);
      });
      if (rest != null && rest.argument != null) {
        const {id, kind} = rest.argument;
        checkDuplicateBindingName(seenBindingNames, rest.argument, id.name);
        checkBindingKind(pattern, kind);
        bindings.push({
          type: 'array-rest',
          key,
          exclude: elements.length,
          kind,
          id,
        });
      }
      return {conditions, bindings};
    }
    case 'MatchObjectPattern': {
      const {properties, rest} = pattern;
      const conditions: Array<Condition> = [{type: 'object', key}];
      const bindings: Array<Binding> = [];
      const objKeys: Array<Identifier | Literal> = [];
      const seenNames = new Set<string>();
      properties.forEach(prop => {
        const {key: objKey, pattern: propPattern} = prop;
        objKeys.push(objKey);
        const name = objKeyToString(objKey);
        if (seenNames.has(name)) {
          throw createSyntaxError(
            propPattern,
            `Duplicate property name '${name}' in match object pattern.`,
          );
        }
        seenNames.add(name);
        const propKey: Key = key.concat(objKey);
        switch (propPattern.type) {
          case 'MatchWildcardPattern':
          case 'MatchBindingPattern':
            conditions.push({
              type: 'prop-exists',
              key,
              propName: name,
            });
            break;
        }
        const {conditions: childConditions, bindings: childBindings} =
          analyzePattern(propPattern, propKey, seenBindingNames);
        conditions.push(...childConditions);
        bindings.push(...childBindings);
      });
      if (rest != null && rest.argument != null) {
        const {id, kind} = rest.argument;
        checkDuplicateBindingName(seenBindingNames, rest.argument, id.name);
        checkBindingKind(pattern, kind);
        bindings.push({
          type: 'object-rest',
          key,
          exclude: objKeys,
          kind,
          id,
        });
      }
      return {conditions, bindings};
    }
    case 'MatchOrPattern': {
      const {patterns} = pattern;
      let hasWildcard = false;
      const orConditions = patterns.map(subpattern => {
        const {conditions, bindings} = analyzePattern(
          subpattern,
          key,
          seenBindingNames,
        );
        if (bindings.length > 0) {
          // We will implement this in the future.
          throw createSyntaxError(
            pattern,
            `Bindings in match 'or' patterns are not yet supported.`,
          );
        }
        if (conditions.length === 0) {
          hasWildcard = true;
        }
        return conditions;
      });
      if (hasWildcard) {
        return {conditions: [], bindings: []};
      }
      return {
        conditions: [{type: 'or', orConditions}],
        bindings: [],
      };
    }
  }
}

function expressionOfKey(root: Expression, key: Key): Expression {
  return key.reduce(
    (acc, prop) =>
      prop.type === 'Identifier'
        ? {
            type: 'MemberExpression',
            object: acc,
            property: shallowCloneNode(prop),
            computed: false,
            optional: false,
            ...etc(),
          }
        : {
            type: 'MemberExpression',
            object: acc,
            property: shallowCloneNode(prop),
            computed: true,
            optional: false,
            ...etc(),
          },
    deepCloneNode(root),
  );
}

function testsOfCondition(
  root: Expression,
  condition: Condition,
): Array<Expression> {
  switch (condition.type) {
    case 'eq': {
      // <x> === <arg>
      const {key, arg} = condition;
      return [
        {
          type: 'BinaryExpression',
          left: expressionOfKey(root, key),
          right: arg,
          operator: '===',
          ...etc(),
        },
      ];
    }
    case 'is-nan': {
      // Number.isNaN(<x>)
      const {key} = condition;
      const callee: MemberExpression = {
        type: 'MemberExpression',
        object: ident('Number'),
        property: ident('isNaN'),
        computed: false,
        optional: false,
        ...etc(),
      };
      return [callExpression(callee, [expressionOfKey(root, key)])];
    }
    case 'array': {
      // Array.isArray(<x>) && <x>.length === <length>
      const {key, length, lengthOp} = condition;
      const operator = lengthOp === 'eq' ? '===' : '>=';
      const isArray = callExpression(
        {
          type: 'MemberExpression',
          object: ident('Array'),
          property: ident('isArray'),
          computed: false,
          optional: false,
          ...etc(),
        },
        [expressionOfKey(root, key)],
      );
      const lengthCheck: BinaryExpression = {
        type: 'BinaryExpression',
        left: {
          type: 'MemberExpression',
          object: expressionOfKey(root, key),
          property: ident('length'),
          computed: false,
          optional: false,
          ...etc(),
        },
        right: numberLiteral(length),
        operator,
        ...etc(),
      };
      return [isArray, lengthCheck];
    }
    case 'object': {
      // typeof <x> === 'object' && <x> !== null
      const {key} = condition;
      const typeofObject: BinaryExpression = {
        type: 'BinaryExpression',
        left: {
          type: 'UnaryExpression',
          operator: 'typeof',
          argument: expressionOfKey(root, key),
          prefix: true,
          ...etc(),
        },
        right: stringLiteral('object'),
        operator: '===',
        ...etc(),
      };
      const notNull = {
        type: 'BinaryExpression',
        left: expressionOfKey(root, key),
        right: nullLiteral(),
        operator: '!==',
        ...etc(),
      };
      return [typeofObject, notNull];
    }
    case 'prop-exists': {
      // <propName> in <x>
      const {key, propName} = condition;
      const inObject: BinaryExpression = {
        type: 'BinaryExpression',
        left: stringLiteral(propName),
        right: expressionOfKey(root, key),
        operator: 'in',
        ...etc(),
      };
      return [inObject];
    }
    case 'or': {
      // <a> || <b> || ...
      const {orConditions} = condition;
      const tests = orConditions.map(conditions =>
        conjunction(testsOfConditions(root, conditions)),
      );
      return [disjunction(tests)];
    }
  }
}

function testsOfConditions(
  root: Expression,
  conditions: Array<Condition>,
): Array<Expression> {
  return conditions.flatMap(condition => testsOfCondition(root, condition));
}

function statementsOfBindings(
  root: Expression,
  bindings: Array<Binding>,
): Array<Statement> {
  return bindings.map(binding => {
    switch (binding.type) {
      case 'id': {
        // const <id> = <x>;
        const {key, kind, id} = binding;
        return variableDeclaration(kind, id, expressionOfKey(root, key));
      }
      case 'array-rest': {
        // const <id> = <x>.slice(<exclude>);
        const {key, kind, id, exclude} = binding;
        const init = callExpression(
          {
            type: 'MemberExpression',
            object: expressionOfKey(root, key),
            property: ident('slice'),
            computed: false,
            optional: false,
            ...etc(),
          },
          [numberLiteral(exclude)],
        );
        return variableDeclaration(kind, id, init);
      }
      case 'object-rest': {
        // const {a: _, b: _, ...<id>} = <x>;
        const {key, kind, id, exclude} = binding;
        const destructuring: ObjectPattern = {
          type: 'ObjectPattern',
          properties: exclude
            .map(prop =>
              prop.type === 'Identifier'
                ? {
                    type: 'Property',
                    key: shallowCloneNode(prop),
                    value: genIdent(),
                    kind: 'init',
                    computed: false,
                    method: false,
                    shorthand: false,
                    ...etc(),
                    parent: EMPTY_PARENT,
                  }
                : {
                    type: 'Property',
                    key: shallowCloneNode(prop),
                    value: genIdent(),
                    kind: 'init',
                    computed: true,
                    method: false,
                    shorthand: false,
                    ...etc(),
                    parent: EMPTY_PARENT,
                  },
            )
            .concat({
              type: 'RestElement',
              argument: id,
              ...etc(),
            }),
          typeAnnotation: null,
          ...etc(),
        };
        return variableDeclaration(
          kind,
          destructuring,
          expressionOfKey(root, key),
        );
      }
    }
  });
}

/**
 * For throwing an error if no cases are matched.
 */
const fallthroughErrorMsgText = `Match: No case succesfully matched. Make exhaustive or add a wildcard case using '_'.`;
function fallthroughErrorMsg(value: Expression): Expression {
  return {
    type: 'BinaryExpression',
    operator: '+',
    left: stringLiteral(`${fallthroughErrorMsgText} Argument: `),
    right: value,
    ...etc(),
  };
}
function fallthroughError(value: Expression): Statement {
  return throwStatement(fallthroughErrorMsg(value));
}

/**
 * If the argument has no side-effects (ignoring getters). Either an identifier
 * or member expression with identifier root and non-computed/literal properties.
 */
function calculateSimpleArgument(node: Expression | Super): boolean {
  switch (node.type) {
    case 'Identifier':
    case 'Super':
      return true;
    case 'MemberExpression': {
      const {object, property, computed} = node;
      if (computed && property.type !== 'Literal') {
        return false;
      }
      return calculateSimpleArgument(object);
    }
    default:
      return false;
  }
}

/**
 * Analyze the match cases and return information we will use to build the result.
 */
type CaseAnalysis<T> = {
  +conditions: Array<Condition>,
  +bindings: Array<Binding>,
  +guard: Expression | null,
  +body: T,
};

interface MatchCase<T> {
  +pattern: MatchPattern;
  +guard: Expression | null;
  +body: T;
}

function analyzeCases<T>(cases: $ReadOnlyArray<MatchCase<T>>): {
  hasBindings: boolean,
  hasWildcard: boolean,
  analyses: Array<CaseAnalysis<T>>,
} {
  let hasBindings = false;
  let hasWildcard = false;
  const analyses: Array<CaseAnalysis<T>> = [];
  for (let i = 0; i < cases.length; i++) {
    const {pattern, guard, body} = cases[i];
    const {conditions, bindings} = analyzePattern(
      pattern,
      [],
      new Set<string>(),
    );
    hasBindings = hasBindings || bindings.length > 0;
    analyses.push({
      conditions,
      bindings,
      guard,
      body,
    });
    // This case catches everything, no reason to continue.
    if (conditions.length === 0 && guard == null) {
      hasWildcard = true;
      break;
    }
  }
  return {
    hasBindings,
    hasWildcard,
    analyses,
  };
}

/**
 * Match expression transform entry point.
 */
function mapMatchExpression(node: MatchExpression): Expression {
  const {argument, cases} = node;
  const {hasBindings, hasWildcard, analyses} = analyzeCases(cases);

  const isSimpleArgument = calculateSimpleArgument(argument);
  const genRoot: Identifier | null = !isSimpleArgument ? genIdent() : null;
  const root: Expression = genRoot == null ? argument : genRoot;

  // No bindings and a simple argument means we can use nested conditional
  // expressions.
  if (!hasBindings && isSimpleArgument) {
    const wildcardAnalaysis = hasWildcard ? analyses.pop() : null;
    const lastBody =
      wildcardAnalaysis != null
        ? wildcardAnalaysis.body
        : iife([fallthroughError(shallowCloneNode(root))]);

    return analyses.reverse().reduce((acc, analysis) => {
      const {conditions, guard, body} = analysis;
      const tests = testsOfConditions(root, conditions);
      if (guard != null) {
        tests.push(guard);
      }
      // <tests> ? <body> : <acc>
      return {
        type: 'ConditionalExpression',
        test: conjunction(tests),
        consequent: body,
        alternate: acc,
        ...etc(),
      };
    }, lastBody);
  }

  // There are bindings, so we produce an immediately invoked arrow expression.

  // If the original argument is simple, no need for a new variable.
  const statements: Array<Statement> = analyses.map(
    ({conditions, bindings, guard, body}) => {
      const returnNode = {
        type: 'ReturnStatement',
        argument: body,
        ...etc(),
      };
      // If we have a guard, then we use a nested if statement
      // `if (<guard>) return <body>`
      const bodyNode: Statement =
        guard == null
          ? returnNode
          : {
              type: 'IfStatement',
              test: guard,
              consequent: returnNode,
              ...etc(),
            };
      const bindingNodes = statementsOfBindings(root, bindings);
      const caseBody: Array<Statement> = bindingNodes.concat(bodyNode);
      if (conditions.length > 0) {
        const tests = testsOfConditions(root, conditions);
        return {
          type: 'IfStatement',
          test: conjunction(tests),
          consequent: {
            type: 'BlockStatement',
            body: caseBody,
            ...etc(),
          },
          ...etc(),
        };
      } else {
        // No conditions, so no if statement
        if (bindingNodes.length > 0) {
          // Bindings require a block to introduce a new scope
          return {
            type: 'BlockStatement',
            body: caseBody,
            ...etc(),
          };
        } else {
          return bodyNode;
        }
      }
    },
  );

  if (!hasWildcard) {
    statements.push(fallthroughError(shallowCloneNode(root)));
  }

  const [params, args] = genRoot == null ? [[], []] : [[genRoot], [argument]];

  // `((<params>) => { ... })(<args>)`, or
  // `(() => { ... })()` if is simple argument.
  return iife(statements, params, args);
}

/**
 * Match statement transform entry point.
 */
function mapMatchStatement(node: MatchStatement): Statement {
  const {argument, cases} = node;
  const {hasWildcard, analyses} = analyzeCases(cases);

  const topLabel: Identifier = genIdent();
  const isSimpleArgument = calculateSimpleArgument(argument);
  const genRoot: Identifier | null = !isSimpleArgument ? genIdent() : null;
  const root: Expression = genRoot == null ? argument : genRoot;

  const statements: Array<Statement> = [];
  if (genRoot != null) {
    statements.push(variableDeclaration('const', genRoot, argument));
  }
  analyses.forEach(({conditions, bindings, guard, body}) => {
    const breakNode: BreakStatement = {
      type: 'BreakStatement',
      label: shallowCloneNode(topLabel),
      ...etc(),
    };
    const bodyStatements = body.body.concat(breakNode);
    // If we have a guard, then we use a nested if statement
    // `if (<guard>) return <body>`
    const guardedBodyStatements: Array<Statement> =
      guard == null
        ? bodyStatements
        : [
            {
              type: 'IfStatement',
              test: guard,
              consequent: {
                type: 'BlockStatement',
                body: bodyStatements,
                ...etc(),
              },
              ...etc(),
            },
          ];
    const bindingNodes = statementsOfBindings(root, bindings);
    const caseBody: Array<Statement> = bindingNodes.concat(
      guardedBodyStatements,
    );
    if (conditions.length > 0) {
      const tests = testsOfConditions(root, conditions);
      statements.push({
        type: 'IfStatement',
        test: conjunction(tests),
        consequent: {
          type: 'BlockStatement',
          body: caseBody,
          ...etc(),
        },
        ...etc(),
      });
    } else {
      // No conditions, so no if statement
      statements.push({
        type: 'BlockStatement',
        body: caseBody,
        ...etc(),
      });
    }
  });

  if (!hasWildcard) {
    statements.push(fallthroughError(shallowCloneNode(root)));
  }

  return {
    type: 'LabeledStatement',
    label: topLabel,
    body: {
      type: 'BlockStatement',
      body: statements,
      ...etc(),
    },
    ...etc(),
  };
}

export function transformProgram(
  program: Program,
  _options: ParserOptions,
): Program {
  // Initialize so each file transformed starts freshly incrementing the
  // variable name counter, and has its own usage tracking.
  GenID = createGenID('m');
  return SimpleTransform.transformProgram(program, {
    transform(node: ESNode) {
      switch (node.type) {
        case 'MatchExpression': {
          return mapMatchExpression(node);
        }
        case 'MatchStatement': {
          return mapMatchStatement(node);
        }
        case 'Identifier': {
          // A rudimentary check to avoid some collisions with our generated
          // variable names. Ideally, we would have access a scope analyzer
          // inside the transform instead.
          if (GenID == null) {
            throw Error(
              'GenID must be initialized at the start of the transform.',
            );
          }
          GenID.addUsage(node.name);
          return node;
        }
        default: {
          return node;
        }
      }
    },
  });
}
