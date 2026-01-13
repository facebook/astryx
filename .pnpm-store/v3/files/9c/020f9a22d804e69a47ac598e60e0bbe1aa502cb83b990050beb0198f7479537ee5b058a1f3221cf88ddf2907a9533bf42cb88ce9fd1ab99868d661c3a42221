/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

import type {HermesNode} from './HermesAST';
import type {ParserOptions} from './ParserOptions';

import HermesASTAdapter from './HermesASTAdapter';
import {getModuleDocblock} from './getModuleDocblock';

declare var BigInt: ?(value: $FlowFixMe) => mixed;

export default class HermesToESTreeAdapter extends HermesASTAdapter {
  +code: string;

  constructor(options: ParserOptions, code: string) {
    super(options);
    this.code = code;
  }

  fixSourceLocation(node: HermesNode): void {
    const loc = node.loc;
    if (loc == null) {
      return;
    }

    node.loc = {
      source: this.sourceFilename ?? null,
      start: loc.start,
      end: loc.end,
    };

    node.range = [loc.rangeStart, loc.rangeEnd];

    delete node.start;
    delete node.end;
  }

  mapNode(node: HermesNode): HermesNode {
    this.fixSourceLocation(node);
    switch (node.type) {
      case 'Program':
        return this.mapProgram(node);
      case 'NullLiteral':
        return this.mapNullLiteral(node);
      case 'BooleanLiteral':
      case 'StringLiteral':
      case 'NumericLiteral':
      case 'JSXStringLiteral':
        return this.mapSimpleLiteral(node);
      case 'BigIntLiteral':
        return this.mapBigIntLiteral(node);
      case 'RegExpLiteral':
        return this.mapRegExpLiteral(node);
      case 'Empty':
        return this.mapEmpty(node);
      case 'TemplateElement':
        return this.mapTemplateElement(node);
      case 'BigIntLiteralTypeAnnotation':
        return this.mapBigIntLiteralTypeAnnotation(node);
      case 'GenericTypeAnnotation':
        return this.mapGenericTypeAnnotation(node);
      case 'ImportDeclaration':
        return this.mapImportDeclaration(node);
      case 'ImportSpecifier':
        return this.mapImportSpecifier(node);
      case 'ExportDefaultDeclaration':
        return this.mapExportDefaultDeclaration(node);
      case 'ExportNamedDeclaration':
        return this.mapExportNamedDeclaration(node);
      case 'ExportAllDeclaration':
        return this.mapExportAllDeclaration(node);
      case 'Property':
        return this.mapProperty(node);
      case 'FunctionDeclaration':
      case 'FunctionExpression':
      case 'ArrowFunctionExpression':
        return this.mapFunction(node);
      case 'PrivateName':
        return this.mapPrivateName(node);
      case 'ClassProperty':
      case 'ClassPrivateProperty':
        return this.mapClassProperty(node);
      case 'MemberExpression':
      case 'OptionalMemberExpression':
      case 'CallExpression':
      case 'OptionalCallExpression':
        return this.mapChainExpression(node);
      default:
        return this.mapNodeDefault(node);
    }
  }

  mapProgram(node: HermesNode): HermesNode {
    const nodeDefault = this.mapNodeDefault(node);
    node.sourceType = this.getSourceType();

    node.docblock = getModuleDocblock(nodeDefault);

    return nodeDefault;
  }

  mapSimpleLiteral(node: HermesNode): HermesNode {
    return {
      type: 'Literal',
      loc: node.loc,
      range: node.range,
      value: node.value,
      raw: this.code.slice(node.range[0], node.range[1]),
      literalType: (() => {
        switch (node.type) {
          case 'NullLiteral':
            return 'null';

          case 'BooleanLiteral':
            return 'boolean';

          case 'StringLiteral':
          case 'JSXStringLiteral':
            return 'string';

          case 'NumericLiteral':
            return 'numeric';

          case 'BigIntLiteral':
            return 'bigint';

          case 'RegExpLiteral':
            return 'regexp';
        }
        return null;
      })(),
    };
  }

  mapBigIntLiteral(node: HermesNode): HermesNode {
    const newNode = this.mapSimpleLiteral(node);
    return {
      ...newNode,
      ...this.getBigIntLiteralValue(node.bigint),
    };
  }

  mapNullLiteral(node: HermesNode): HermesNode {
    return {
      ...this.mapSimpleLiteral(node),
      value: null,
    };
  }

  mapRegExpLiteral(node: HermesNode): HermesNode {
    const {pattern, flags} = node;

    // Create RegExp value if possible. This can fail when the flags are invalid.
    let value;
    try {
      value = new RegExp(pattern, flags);
    } catch (e) {
      value = null;
    }

    return {
      ...this.mapSimpleLiteral(node),
      value,
      regex: {
        pattern,
        flags,
      },
    };
  }

  mapBigIntLiteralTypeAnnotation(node: HermesNode): HermesNode {
    return {
      ...node,
      ...this.getBigIntLiteralValue(node.raw),
    };
  }

  mapTemplateElement(node: HermesNode): HermesNode {
    return {
      type: 'TemplateElement',
      loc: node.loc,
      range: node.range,
      tail: node.tail,
      value: {
        cooked: node.cooked,
        raw: node.raw,
      },
    };
  }

  mapGenericTypeAnnotation(node: HermesNode): HermesNode {
    // Convert simple `this` generic type to ThisTypeAnnotation
    if (
      node.typeParameters == null &&
      node.id.type === 'Identifier' &&
      node.id.name === 'this'
    ) {
      return {
        type: 'ThisTypeAnnotation',
        loc: node.loc,
        range: node.range,
      };
    }

    return this.mapNodeDefault(node);
  }

  mapProperty(nodeUnprocessed: HermesNode): HermesNode {
    const node = this.mapNodeDefault(nodeUnprocessed);

    if (
      node.value.type === 'FunctionExpression' &&
      (node.method || node.kind !== 'init')
    ) {
      node.value.loc.start = node.key.loc.end;
      node.value.range[0] = node.key.range[1];
    }

    return node;
  }

  mapComment(node: HermesNode): HermesNode {
    if (node.type === 'CommentBlock') {
      node.type = 'Block';
    } else if (node.type === 'CommentLine') {
      node.type = 'Line';
    }

    return node;
  }

  mapFunction(nodeUnprocessed: HermesNode): HermesNode {
    const node = this.mapNodeDefault(nodeUnprocessed);

    switch (node.type) {
      // This prop should ideally only live on `ArrowFunctionExpression` but to
      // match espree output we place it on all functions types.
      case 'FunctionDeclaration':
      case 'FunctionExpression':
        node.expression = false;
        return node;

      case 'ArrowFunctionExpression':
        node.expression = node.body.type !== 'BlockStatement';
        return node;
    }

    return node;
  }

  mapChainExpression(nodeUnprocessed: HermesNode): HermesNode {
    /*
    NOTE - In the below comments `MemberExpression` and `CallExpression`
           are completely interchangable. For terseness we just reference
           one each time.
    */

    /*
    Hermes uses the old babel-style AST:
    ```
    (one?.two).three?.four;
    ^^^^^^^^^^^^^^^^^^^^^^ OptionalMemberExpression
    ^^^^^^^^^^^^^^^^ MemberExpression
     ^^^^^^^^ OptionalMemberExpression
    ```

    We need to convert it to the ESTree representation:
    ```
    (one?.two).three?.four;
    ^^^^^^^^^^^^^^^^^^^^^^ ChainExpression
    ^^^^^^^^^^^^^^^^^^^^^^ MemberExpression[optional = true]
    ^^^^^^^^^^^^^^^^ MemberExpression[optional = false]
     ^^^^^^^^ ChainExpression
     ^^^^^^^^ MemberExpression[optional = true]
    ```

    We do this by converting the AST and its children (depth first), and then unwrapping
    the resulting AST as appropriate.

    Put another way:
    1) traverse to the leaf
    2) if the current node is an `OptionalMemberExpression`:
      a) if the `.object` is a `ChainExpression`:
        i)   unwrap the child (`node.object = child.expression`)
      b) convert this node to a `MemberExpression[optional = true]`
      c) wrap this node (`node = ChainExpression[expression = node]`)
    3) if the current node is a `MemberExpression`:
      a) convert this node to a `MemberExpression[optional = true]`
    */

    const node = this.mapNodeDefault(nodeUnprocessed);

    const {child, childKey, isOptional} = ((): {
      child: HermesNode,
      childKey: string,
      isOptional: boolean,
    } => {
      const isOptional: boolean = node.optional === true;
      if (node.type.endsWith('MemberExpression')) {
        return {
          child: node.object,
          childKey: 'object',
          isOptional,
        };
      } else if (node.type.endsWith('CallExpression')) {
        return {
          child: node.callee,
          childKey: 'callee',
          isOptional,
        };
      } else {
        return {
          child: node.expression,
          childKey: 'expression',
          isOptional: false,
        };
      }
    })();

    const isChildUnwrappable =
      child.type === 'ChainExpression' &&
      // (x?.y).z is semantically different to `x?.y.z`.
      // In the un-parenthesised case `.z` is only executed if and only if `x?.y` returns a non-nullish value.
      // In the parenthesised case, `.z` is **always** executed, regardless of the return of `x?.y`.
      // As such the AST is different between the two cases.
      //
      // In the hermes AST - any member part of a non-short-circuited optional chain is represented with `OptionalMemberExpression`
      // so if we see a `MemberExpression`, then we know we've hit a parenthesis boundary.
      node.type !== 'MemberExpression' &&
      node.type !== 'CallExpression';

    if (node.type.startsWith('Optional')) {
      node.type = node.type.replace('Optional', '');
      node.optional = isOptional;
    } else {
      node.optional = false;
    }

    if (!isChildUnwrappable && !isOptional) {
      return node;
    }

    if (isChildUnwrappable) {
      const newChild = child.expression;
      node[childKey] = newChild;
    }

    return {
      type: 'ChainExpression',
      expression: node,
      loc: node.loc,
      range: node.range,
    };
  }

  mapClassProperty(nodeUnprocessed: HermesNode): HermesNode {
    const node = this.mapNodeDefault(nodeUnprocessed);

    const key = (() => {
      if (node.type === 'ClassPrivateProperty') {
        const key = this.mapNodeDefault(node.key);
        return {
          type: 'PrivateIdentifier',
          name: key.name,
          range: key.range,
          loc: key.loc,
        };
      }

      return node.key;
    })();

    return {
      ...node,
      computed: node.type === 'ClassPrivateProperty' ? false : node.computed,
      key,
      type: 'PropertyDefinition',
    };
  }

  mapPrivateName(node: HermesNode): HermesNode {
    return {
      type: 'PrivateIdentifier',
      name: node.id.name,
      // estree the location refers to the entire string including the hash token
      range: node.range,
      loc: node.loc,
    };
  }

  mapExportNamedDeclaration(nodeUnprocessed: HermesNode): HermesNode {
    const node = super.mapExportNamedDeclaration(nodeUnprocessed);

    const namespaceSpecifier = node.specifiers.find(
      spec => spec.type === 'ExportNamespaceSpecifier',
    );
    if (namespaceSpecifier != null) {
      if (node.specifiers.length !== 1) {
        // this should already a hermes parser error - but let's be absolutely sure we're aligned with the spec
        throw new Error('Cannot use an export all with any other specifiers');
      }
      return {
        type: 'ExportAllDeclaration',
        source: node.source,
        exportKind: node.exportKind ?? 'value',
        exported: namespaceSpecifier.exported,
        range: node.range,
        loc: node.loc,
      };
    }

    return node;
  }

  mapExportAllDeclaration(nodeUnprocessed: HermesNode): HermesNode {
    const node = super.mapExportAllDeclaration(nodeUnprocessed);
    node.exported = node.exported ?? null;
    return node;
  }
}
