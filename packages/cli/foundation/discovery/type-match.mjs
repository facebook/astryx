// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Does a documented prop type name the type the code declares?
 *
 * The documented text is parsed by the project's TypeScript as a type and
 * matched against the compiler's type for the prop, structure by structure:
 * - a union matches when every documented member matches some member of the
 *   code's type and every member of the code's type is matched, in any order
 *   (`boolean` covers `true` and `false`, and a string or number literal the
 *   code widens to `string` or `number` is absorbed by it);
 * - a name matches the code's alias or interface of that name, or the type the
 *   name resolves to where the prop is declared, or its expansion; a name
 *   written without type arguments matches any arguments; a type parameter
 *   also matches its default or constraint;
 * - an object type matches an object type or interface with the same props,
 *   the same optional marks, and matching prop types;
 * - a function type matches a call signature: parameters by position, their
 *   names ignored, an untyped parameter matching anything, an optional
 *   parameter's `undefined` implied, and the doc may leave out trailing
 *   parameters; the return types must match;
 * - an intersection matches an intersection with the same parts, in any
 *   order;
 * - `T[]`, `Array<T>` and `ReadonlyArray<T>` are one array type, and
 *   `readonly` and `Readonly<T>` are ignored;
 * - on an optional prop, `undefined` is ignored.
 * Anything else (indexed access, conditional, mapped, template literal and
 * similar types) is compared as text after type-text.mjs normalizes it.
 *
 * @input A documented type string, the prop's types per member of the props
 *   type, and the compiler that read them.
 * @output A boolean.
 * @position Used by the prop-drift comparison (prop-drift.mjs).
 */

import {normalizeTypeText} from './type-text.mjs';

/**
 * @typedef {object} MatchContext
 * @property {any} ts
 * @property {any} checker
 * @property {any} location where names in the documented type resolve (the
 *   prop's declaration, else the component's source file)
 * @property {Map<any, Map<string, any[] | null>>} cache resolved names, per location
 */

const MAX_DEPTH = 8;

/**
 * A function type whose return type is a union holding function types,
 * reread as a union of callbacks (`((a: A) => void) | ((b: B) => void)`), or
 * null.
 * @param {any} ts
 * @param {any} node
 * @returns {string | null}
 */
function callbackUnionReading(ts, node) {
  if (!ts.isFunctionTypeNode(node) || !ts.isUnionTypeNode(node.type)) {
    return null;
  }
  const members = node.type.types;
  const first = members.findIndex(
    /** @param {any} m */ m => ts.isFunctionTypeNode(m),
  );
  if (first <= 0) return null;
  const sf = node.getSourceFile();
  const head = sf.text.slice(node.getStart(sf), members[first - 1].end);
  const tail = members
    .slice(first)
    .map(/** @param {any} m */ m => sf.text.slice(m.getStart(sf), m.end));
  return [head, ...tail].map(text => `(${text})`).join(' | ');
}

/**
 * Parse a type expression with the project's TypeScript.
 * @param {any} ts
 * @param {string} text
 * @param {boolean} [loose]
 * @returns {any | null} the TypeNode, or null when it does not parse as one type
 */
function parseType(ts, text, loose = false) {
  const source = ts.createSourceFile(
    '__documented_type__.ts',
    `type __Documented = ${text};`,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  const [statement, ...rest] = source.statements;
  // Loosely: only "function type notation must be parenthesized" (1385, and
  // 1386 for a constructor type) is let through.
  const errors = (source.parseDiagnostics ?? []).filter(
    /** @param {any} d */ d => !(loose && (d.code === 1385 || d.code === 1386)),
  );
  if (
    errors.length > 0 ||
    rest.length > 0 ||
    !statement ||
    !ts.isTypeAliasDeclaration(statement) ||
    statement.type.end !== source.text.length - 1
  ) {
    return null;
  }
  return statement.type;
}

/**
 * The members of a code type's union, or the type itself.
 * @param {any} type
 * @returns {any[]}
 */
function constituents(type) {
  return type.isUnion() ? [...type.types] : [type];
}

/**
 * @param {MatchContext} ctx
 * @param {any} type
 * @returns {string}
 */
function printed(ctx, type) {
  return ctx.checker.typeToString(
    type,
    undefined,
    ctx.ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType,
  );
}

/**
 * The names a code type answers to: its alias and its own symbol.
 * @param {any} type
 * @returns {string[]}
 */
function namesOf(type) {
  return [type.aliasSymbol?.name, type.symbol?.name].filter(
    name => typeof name === 'string' && !name.startsWith('__'),
  );
}

/**
 * The text of a type reference's name, without a `React.` qualifier.
 * @param {any} ts
 * @param {any} typeName
 * @returns {string}
 */
function referenceName(ts, typeName) {
  if (ts.isIdentifier(typeName)) return typeName.text;
  /** @type {string} */
  const left = referenceName(ts, typeName.left);
  return left === 'React'
    ? typeName.right.text
    : `${left}.${typeName.right.text}`;
}

/**
 * Resolve a name the documented type uses, where the prop is declared.
 * @param {MatchContext} ctx
 * @param {string} name
 * @returns {any[] | null} the members of the named type
 */
function resolveName(ctx, name) {
  let names = ctx.cache.get(ctx.location);
  if (!names) {
    names = new Map();
    ctx.cache.set(ctx.location, names);
  }
  if (names.has(name)) return names.get(name) ?? null;
  const {ts, checker} = ctx;
  /** @type {any[] | null} */
  let result = null;
  try {
    const meaning =
      ts.SymbolFlags.Type | ts.SymbolFlags.Alias | ts.SymbolFlags.Namespace;
    const scope = checker.getSymbolsInScope(ctx.location, meaning);
    const [head, ...tail] = name.split('.');
    // A module's own declarations can come back as local symbols without
    // flags: take the export symbol, and the first one that names a type or
    // namespace.
    let symbol = scope
      .filter(/** @param {any} s */ s => s.name === head)
      .map(/** @param {any} s */ s => checker.getExportSymbolOfSymbol(s))
      .find(/** @param {any} s */ s => (s.flags & meaning) !== 0);
    if (!symbol && tail.length === 0) {
      // `ReactNode` where the source writes `React.ReactNode`.
      const react = scope.find(/** @param {any} s */ s => s.name === 'React');
      if (react) {
        const target =
          react.flags & ts.SymbolFlags.Alias
            ? checker.getAliasedSymbol(react)
            : react;
        symbol = checker
          .getExportsOfModule(target)
          .find(/** @param {any} s */ s => s.name === head);
      }
    }
    for (const part of tail) {
      if (!symbol) break;
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      symbol = checker
        .getExportsOfModule(target)
        .find(/** @param {any} s */ s => s.name === part);
    }
    if (symbol) {
      const target =
        symbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(symbol)
          : symbol;
      if (target.flags & ts.SymbolFlags.Type) {
        result = constituents(checker.getDeclaredTypeOfSymbol(target));
      }
    }
  } catch {
    result = null;
  }
  names.set(name, result);
  return result;
}

/**
 * The same context, resolving names where `symbol` is declared.
 * @param {MatchContext} ctx
 * @param {any} symbol
 * @returns {MatchContext}
 */
function at(ctx, symbol) {
  const location = symbol?.valueDeclaration ?? symbol?.declarations?.[0];
  return location ? {...ctx, location} : ctx;
}

/**
 * A type parameter's default and constraint, the ones that exist.
 * @param {MatchContext} ctx
 * @param {any} type
 * @returns {any[]}
 */
function parameterFallbacks(ctx, type) {
  return [
    ctx.checker.getDefaultFromTypeParameter(type),
    ctx.checker.getBaseConstraintOfType(type),
  ].filter(t => t != null && t !== type);
}

/**
 * The names a declared type reaches through plain alias declarations
 * (`type LinkComponentType = ElementType` reaches `ElementType`).
 * @param {any} ts
 * @param {any} checker
 * @param {any} typeNode
 * @returns {Set<string>}
 */
export function aliasChainNames(ts, checker, typeNode) {
  /** @type {Set<string>} */
  const names = new Set();
  let node = typeNode;
  for (let hop = 0; hop < 6 && node && ts.isTypeReferenceNode(node); hop++) {
    names.add(referenceName(ts, node.typeName));
    names.add(referenceName(ts, node.typeName).split('.').pop() ?? '');
    let symbol = checker.getSymbolAtLocation(node.typeName);
    if (symbol && symbol.flags & ts.SymbolFlags.Alias)
      symbol = checker.getAliasedSymbol(symbol);
    const declaration = symbol?.declarations?.find(
      /** @param {any} d */ d => ts.isTypeAliasDeclaration(d),
    );
    node = declaration?.type;
  }
  names.delete('');
  return names;
}

/**
 * Flatten a documented union (and parentheses around members).
 * @param {any} ts
 * @param {any} node
 * @returns {any[]}
 */
function docMembers(ts, node) {
  if (ts.isParenthesizedTypeNode(node)) return docMembers(ts, node.type);
  if (ts.isUnionTypeNode(node))
    return node.types.flatMap(/** @param {any} t */ t => docMembers(ts, t));
  return [node];
}

/**
 * @param {MatchContext} ctx
 * @param {any} type
 * @param {'string' | 'number' | 'boolean'} primitive
 * @returns {boolean}
 */
function isPrimitive(ctx, type, primitive) {
  const {TypeFlags} = ctx.ts;
  // `string & {}` (or `number & {}`) is any string: the idiom that keeps a
  // union's literals in autocomplete without narrowing the type.
  if (primitive !== 'boolean' && type.flags & TypeFlags.Intersection) {
    const parts = /** @type {any[]} */ (type.types);
    return (
      parts.some(part => isPrimitive(ctx, part, primitive)) &&
      parts.every(
        part => isPrimitive(ctx, part, primitive) || isEmptyObject(ctx, part),
      )
    );
  }
  if (primitive === 'string') return (type.flags & TypeFlags.String) !== 0;
  if (primitive === 'number') return (type.flags & TypeFlags.Number) !== 0;
  return (type.flags & TypeFlags.BooleanLiteral) !== 0;
}

/**
 * Is a type `{}`: an object type with no members?
 * @param {MatchContext} ctx
 * @param {any} type
 */
function isEmptyObject(ctx, type) {
  const {checker, ts} = ctx;
  return (
    (type.flags & ts.TypeFlags.Object) !== 0 &&
    checker.getPropertiesOfType(type).length === 0 &&
    type.getCallSignatures().length === 0 &&
    type.getConstructSignatures().length === 0 &&
    (checker.getIndexInfosOfType?.(type) ?? []).length === 0
  );
}

/**
 * Match documented union members against code members, in any order. Beside
 * any string or any number, the code's literals and template literals of that
 * kind count as part of it, as they do for `'on' | 'off' | (string & {})`.
 * @param {MatchContext} ctx
 * @param {any[]} docs
 * @param {any[]} codes
 * @param {number} depth
 */
function matchUnion(ctx, docs, codes, depth) {
  const {ts} = ctx;
  const anyString = codes.some(code => isPrimitive(ctx, code, 'string'));
  const anyNumber = codes.some(code => isPrimitive(ctx, code, 'number'));
  const {TypeFlags} = ts;
  const stringParts =
    TypeFlags.StringLiteral |
    TypeFlags.TemplateLiteral |
    TypeFlags.StringMapping;
  const remaining = codes.filter(
    code =>
      !(anyString && code.flags & stringParts) &&
      !(anyNumber && code.flags & TypeFlags.NumberLiteral),
  );
  const take = (/** @type {(code: any) => boolean} */ test) => {
    const index = remaining.findIndex(test);
    if (index === -1) return false;
    remaining.splice(index, 1);
    return true;
  };
  for (const doc of docs) {
    if (doc.kind === ts.SyntaxKind.BooleanKeyword) {
      const t = take(
        code =>
          isPrimitive(ctx, code, 'boolean') && printed(ctx, code) === 'true',
      );
      const f = take(
        code =>
          isPrimitive(ctx, code, 'boolean') && printed(ctx, code) === 'false',
      );
      if (!t || !f) return false;
      continue;
    }
    if (ts.isTypeReferenceNode(doc) && !doc.typeArguments) {
      const named = resolveName(ctx, referenceName(ts, doc.typeName));
      if (
        named &&
        named.length > 1 &&
        named.every(
          member =>
            remaining.includes(member) ||
            (member.flags & ts.TypeFlags.Undefined) !== 0,
        )
      ) {
        for (const member of named) take(code => code === member);
        continue;
      }
    }
    if (take(code => matchOne(ctx, doc, code, depth + 1))) continue;
    // `'hug' | string`: the code's `string` already holds the literal.
    if (ts.isLiteralTypeNode(doc)) {
      if (
        (ts.isStringLiteral(doc.literal) &&
          remaining.some(code => isPrimitive(ctx, code, 'string'))) ||
        (ts.isNumericLiteral(doc.literal) &&
          remaining.some(code => isPrimitive(ctx, code, 'number'))) ||
        (codes.some(code => isPrimitive(ctx, code, 'string')) &&
          ts.isStringLiteral(doc.literal)) ||
        (codes.some(code => isPrimitive(ctx, code, 'number')) &&
          ts.isNumericLiteral(doc.literal))
      ) {
        continue;
      }
    }
    return false;
  }
  return remaining.length === 0;
}

/**
 * Match one documented type node against a code type (possibly a union).
 * @param {MatchContext} ctx
 * @param {any} node
 * @param {any[]} codes the code type's members
 * @param {number} depth
 */
function matchNode(ctx, node, codes, depth) {
  const {ts} = ctx;
  if (depth > MAX_DEPTH) return true;
  return matchMembers(ctx, docMembers(ts, node), codes, depth);
}

/**
 * Match documented members against code members.
 * @param {MatchContext} ctx
 * @param {any[]} docs
 * @param {any[]} codes
 * @param {number} depth
 */
function matchMembers(ctx, docs, codes, depth) {
  if (docs.length === 1 && codes.length === 1) {
    return matchOne(ctx, docs[0], codes[0], depth);
  }
  return matchUnion(ctx, docs, codes, depth);
}

/**
 * The element type of an array or readonly array, or null.
 * @param {MatchContext} ctx
 * @param {any} type
 */
function arrayElement(ctx, type) {
  const name = type.symbol?.name;
  if (
    (name === 'Array' || name === 'ReadonlyArray') &&
    type.aliasSymbol == null
  ) {
    const args = ctx.checker.getTypeArguments(type);
    return args.length === 1 ? args[0] : null;
  }
  return null;
}

/**
 * Match one documented, non-union type node against one code type.
 * @param {MatchContext} ctx
 * @param {any} node
 * @param {any} code
 * @param {number} depth
 * @returns {boolean}
 */
function matchOne(ctx, node, code, depth) {
  const {ts, checker} = ctx;
  const {SyntaxKind, TypeFlags} = ts;
  if (depth > MAX_DEPTH) return true;
  if (ts.isParenthesizedTypeNode(node))
    return matchNode(ctx, node.type, [code], depth);
  if (
    ts.isTypeOperatorNode(node) &&
    node.operator === SyntaxKind.ReadonlyKeyword
  ) {
    return matchOne(ctx, node.type, code, depth);
  }
  if (ts.isTypeReferenceNode(node)) {
    const name = referenceName(ts, node.typeName);
    const bare = name.split('.').pop();
    if (namesOf(code).some(own => own === name || own === bare)) {
      const args = node.typeArguments ?? [];
      if (args.length === 0) return true;
      const codeArgs =
        code.aliasSymbol?.name === bare
          ? (code.aliasTypeArguments ?? [])
          : code.flags & TypeFlags.Object
            ? checker.getTypeArguments(code)
            : [];
      return args.every(
        /** @param {any} arg @param {number} i */
        (arg, i) =>
          i >= codeArgs.length ||
          matchNode(ctx, arg, constituents(codeArgs[i]), depth + 1),
      );
    }
  }
  if (code.flags & TypeFlags.TypeParameter) {
    return parameterFallbacks(ctx, code).some(fallback =>
      matchOne(ctx, node, fallback, depth + 1),
    );
  }
  if (code.isUnion()) return matchNode(ctx, node, constituents(code), depth);

  // `A & B`: every documented part matches one part of the code's
  // intersection, in any order, and every part is matched.
  if (ts.isIntersectionTypeNode(node)) {
    const remaining =
      code.flags & TypeFlags.Intersection ? [...code.types] : [code];
    for (const part of node.types) {
      const index = remaining.findIndex(each =>
        matchOne(ctx, part, each, depth + 1),
      );
      if (index === -1) return false;
      remaining.splice(index, 1);
    }
    return remaining.length === 0;
  }

  switch (node.kind) {
    case SyntaxKind.StringKeyword:
      return isPrimitive(ctx, code, 'string');
    case SyntaxKind.NumberKeyword:
      return isPrimitive(ctx, code, 'number');
    case SyntaxKind.BooleanKeyword:
      return (code.flags & TypeFlags.Boolean) !== 0;
    case SyntaxKind.BigIntKeyword:
      return (code.flags & TypeFlags.BigInt) !== 0;
    case SyntaxKind.SymbolKeyword:
      return (code.flags & TypeFlags.ESSymbol) !== 0;
    case SyntaxKind.VoidKeyword:
      return (code.flags & TypeFlags.Void) !== 0;
    case SyntaxKind.UndefinedKeyword:
      return (code.flags & TypeFlags.Undefined) !== 0;
    case SyntaxKind.NeverKeyword:
      return (code.flags & TypeFlags.Never) !== 0;
    case SyntaxKind.UnknownKeyword:
      return (code.flags & TypeFlags.Unknown) !== 0;
    case SyntaxKind.AnyKeyword:
      return (code.flags & TypeFlags.Any) !== 0;
    case SyntaxKind.ObjectKeyword:
      return (code.flags & TypeFlags.NonPrimitive) !== 0;
    default:
      break;
  }

  if (ts.isLiteralTypeNode(node)) {
    const literal = node.literal;
    if (
      ts.isStringLiteral(literal) ||
      ts.isNoSubstitutionTemplateLiteral(literal)
    ) {
      // An enum member is not its value: TypeScript rejects `'red'` for an
      // enum `Color`, so the doc must name the enum or its member.
      return (
        code.isStringLiteral() &&
        !(code.flags & TypeFlags.EnumLiteral) &&
        code.value === literal.text
      );
    }
    if (ts.isNumericLiteral(literal)) {
      return (
        code.isNumberLiteral() &&
        !(code.flags & TypeFlags.EnumLiteral) &&
        code.value === Number(literal.text)
      );
    }
    if (
      ts.isPrefixUnaryExpression(literal) &&
      literal.operator === SyntaxKind.MinusToken &&
      ts.isNumericLiteral(literal.operand)
    ) {
      return (
        code.isNumberLiteral() && code.value === -Number(literal.operand.text)
      );
    }
    if (literal.kind === SyntaxKind.TrueKeyword)
      return printed(ctx, code) === 'true';
    if (literal.kind === SyntaxKind.FalseKeyword)
      return printed(ctx, code) === 'false';
    if (literal.kind === SyntaxKind.NullKeyword)
      return (code.flags & TypeFlags.Null) !== 0;
  }

  if (ts.isArrayTypeNode(node)) {
    const element = arrayElement(ctx, code);
    return (
      element != null &&
      matchNode(ctx, node.elementType, constituents(element), depth + 1)
    );
  }

  if (ts.isTypeReferenceNode(node)) {
    const name = referenceName(ts, node.typeName);
    const args = node.typeArguments ?? [];
    if ((name === 'Array' || name === 'ReadonlyArray') && args.length === 1) {
      const element = arrayElement(ctx, code);
      return (
        element != null &&
        matchNode(ctx, args[0], constituents(element), depth + 1)
      );
    }
    if (name === 'Readonly' && args.length === 1)
      return matchOne(ctx, args[0], code, depth);
    if (name === 'Record' && args.length === 2) {
      return matchRecord(ctx, args[0], args[1], code, depth);
    }
    if (args.length === 0) {
      const named = resolveName(ctx, name);
      if (named && named.length === 1) {
        if (named[0] === code) return true;
        // An alias of a structure: compare the structure.
        return sameStructure(ctx, named[0], code, depth + 1);
      }
    }
    return false;
  }

  if (ts.isFunctionTypeNode(node)) {
    return matchCallable(ctx, node, code, depth);
  }

  if (ts.isTypeLiteralNode(node)) {
    // An object type, or an intersection of object types, read as one.
    const objectLike =
      code.flags & TypeFlags.Object ||
      (code.flags & TypeFlags.Intersection &&
        code.types.every(
          /** @param {any} t */ t => t.flags & TypeFlags.Object,
        ));
    if (!objectLike || code.getCallSignatures().length > 0) return false;
    const codeProps = checker.getPropertiesOfType(code);
    const docProps = node.members.filter(
      /** @param {any} m */ m =>
        ts.isPropertySignature(m) || ts.isMethodSignature(m),
    );
    if (docProps.length !== codeProps.length) return false;
    const docIndexes = node.members.filter(
      /** @param {any} m */ m => ts.isIndexSignatureDeclaration(m),
    );
    if (!matchIndexes(ctx, docIndexes, code, depth)) return false;
    return docProps.every(
      /** @param {any} member */ member => {
        const key =
          member.name &&
          (ts.isIdentifier(member.name) || ts.isStringLiteral(member.name))
            ? member.name.text
            : null;
        const prop =
          key == null
            ? null
            : codeProps.find(/** @param {any} p */ p => p.name === key);
        if (!prop) return false;
        const optional = (prop.flags & ts.SymbolFlags.Optional) !== 0;
        if (optional !== (member.questionToken != null)) return false;
        const propType = checker.getTypeOfSymbolAtLocation(prop, ctx.location);
        const members = constituents(propType).filter(
          t => !(optional && t.flags & TypeFlags.Undefined),
        );
        if (ts.isMethodSignature(member)) {
          return members.some(each =>
            matchCallable(at(ctx, prop), member, each, depth + 1),
          );
        }
        return (
          member.type == null ||
          matchNode(at(ctx, prop), member.type, members, depth + 1)
        );
      },
    );
  }

  if (ts.isTupleTypeNode(node)) {
    const elements =
      code.flags & TypeFlags.Object ? checker.getTypeArguments(code) : [];
    /** @type {number[]} */
    const flags = code.target?.elementFlags ?? [];
    if (elements.length !== node.elements.length) return false;
    return node.elements.every(
      /** @param {any} element @param {number} i */
      (element, i) => {
        let inner = element;
        let optional = false;
        let rest = false;
        if (ts.isNamedTupleMember(inner)) {
          optional = inner.questionToken != null;
          rest = inner.dotDotDotToken != null;
          inner = inner.type;
        }
        if (ts.isOptionalTypeNode(inner)) {
          optional = true;
          inner = inner.type;
        }
        if (ts.isRestTypeNode(inner)) {
          rest = true;
          inner = inner.type;
        }
        const flag = flags[i] ?? 1;
        // ElementFlags: Optional 2, Rest 4, Variadic 8.
        if (optional !== Boolean(flag & 2) || rest !== Boolean(flag & 12)) {
          return false;
        }
        if (rest) {
          // `...T[]` holds the element type the code's rest element has.
          inner = ts.isArrayTypeNode(inner)
            ? inner.elementType
            : ts.isTypeReferenceNode(inner) && inner.typeArguments?.length === 1
              ? inner.typeArguments[0]
              : inner;
        }
        const types = constituents(elements[i]).filter(
          t => !(optional && t.flags & TypeFlags.Undefined),
        );
        return matchNode(ctx, inner, types, depth + 1);
      },
    );
  }

  // Indexed access, conditional, mapped, template literal and the like.
  const docText = normalizeTypeText(node.getText()).join('|');
  return docText === normalizeTypeText(printed(ctx, code)).join('|');
}

/**
 * A function type or method signature against a code type with call
 * signatures: parameters by position, an optional parameter's `undefined`
 * implied on either side, then the return type.
 * @param {MatchContext} ctx
 * @param {any} node a FunctionTypeNode or MethodSignature
 * @param {any} code
 * @param {number} depth
 */
function matchCallable(ctx, node, code, depth) {
  const {ts, checker} = ctx;
  const {TypeFlags} = ts;
  return code.getCallSignatures().some(
    /** @param {any} signature */ signature => {
      const params = signature.getParameters();
      if (node.parameters.length > params.length) return false;
      const paramsMatch = node.parameters.every(
        /** @param {any} param @param {number} i */
        (param, i) => {
          if (param.type == null) return true;
          const declaration = params[i].valueDeclaration;
          const optional =
            param.questionToken != null ||
            (declaration != null &&
              ts.isParameter(declaration) &&
              checker.isOptionalParameter(declaration));
          const types = constituents(
            checker.getTypeOfSymbolAtLocation(params[i], ctx.location),
          ).filter(t => !(optional && t.flags & TypeFlags.Undefined));
          return matchNode(at(ctx, params[i]), param.type, types, depth + 1);
        },
      );
      return (
        paramsMatch &&
        (node.type == null ||
          matchNode(
            ctx,
            node.type,
            constituents(checker.getReturnTypeOfSignature(signature)),
            depth + 1,
          ))
      );
    },
  );
}

/**
 * The index signatures an object type literal writes against the code's:
 * the same number, each key and value matching one of the code's.
 * @param {MatchContext} ctx
 * @param {any[]} docIndexes IndexSignatureDeclarations
 * @param {any} code
 * @param {number} depth
 */
function matchIndexes(ctx, docIndexes, code, depth) {
  const infos = ctx.checker.getIndexInfosOfType(code) ?? [];
  if (infos.length !== docIndexes.length) return false;
  return docIndexes.every(index => {
    const key = index.parameters[0]?.type;
    return infos.some(
      /** @param {any} info */ info =>
        key != null &&
        matchOne(ctx, key, info.keyType, depth + 1) &&
        matchNode(ctx, index.type, constituents(info.type), depth + 1),
    );
  });
}

/**
 * `Record<K, V>` against the code: literal keys as that object's props, each
 * of type V, or a `string`/`number` key as its one index signature.
 * @param {MatchContext} ctx
 * @param {any} keyNode
 * @param {any} valueNode
 * @param {any} code
 * @param {number} depth
 */
function matchRecord(ctx, keyNode, valueNode, code, depth) {
  const {ts, checker} = ctx;
  if (!(code.flags & ts.TypeFlags.Object)) return false;
  const props = checker.getPropertiesOfType(code);
  const infos = checker.getIndexInfosOfType(code) ?? [];
  if (props.length === 0 && infos.length === 1) {
    return (
      matchOne(ctx, keyNode, infos[0].keyType, depth + 1) &&
      matchNode(ctx, valueNode, constituents(infos[0].type), depth + 1)
    );
  }
  const keys = docMembers(ts, keyNode);
  if (
    infos.length > 0 ||
    !keys.every(
      key => ts.isLiteralTypeNode(key) && ts.isStringLiteral(key.literal),
    )
  ) {
    return false;
  }
  const names = keys.map(key => key.literal.text).sort();
  if (
    names.join('\0') !==
    props
      .map(/** @param {any} p */ p => p.name)
      .sort()
      .join('\0')
  ) {
    return false;
  }
  return props.every(
    /** @param {any} prop */ prop =>
      matchNode(
        at(ctx, prop),
        valueNode,
        constituents(checker.getTypeOfSymbolAtLocation(prop, ctx.location)),
        depth + 1,
      ),
  );
}

/**
 * Two object types with the same shape: the same props, each with the same
 * optional mark and the same type, and the same index signatures. That is how
 * `Partial<T>` of a T whose props are all optional reads as T.
 * @param {MatchContext} ctx
 * @param {any} a
 * @param {any} b
 */
function sameShape(ctx, a, b) {
  const {checker, ts} = ctx;
  const objectLike = (/** @type {any} */ t) =>
    (t.flags & ts.TypeFlags.Object) !== 0 && t.getCallSignatures().length === 0;
  if (!objectLike(a) || !objectLike(b)) return false;
  const propsOf = (/** @type {any} */ t) =>
    new Map(
      checker
        .getPropertiesOfType(t)
        .map(/** @param {any} p */ p => [p.name, p]),
    );
  const aProps = propsOf(a);
  const bProps = propsOf(b);
  if (aProps.size !== bProps.size) return false;
  for (const [name, aProp] of aProps) {
    const bProp = bProps.get(name);
    if (!bProp) return false;
    const optional = ts.SymbolFlags.Optional;
    if ((aProp.flags & optional) !== (bProp.flags & optional)) return false;
    const aType = checker.getTypeOfSymbolAtLocation(aProp, ctx.location);
    const bType = checker.getTypeOfSymbolAtLocation(bProp, ctx.location);
    if (aType !== bType && printed(ctx, aType) !== printed(ctx, bType)) {
      return false;
    }
  }
  const indexes = (/** @type {any} */ t) =>
    (checker.getIndexInfosOfType(t) ?? [])
      .map(
        /** @param {any} info */ info =>
          `${printed(ctx, info.keyType)}:${printed(ctx, info.type)}`,
      )
      .sort()
      .join('|');
  return indexes(a) === indexes(b);
}

/**
 * Two code types with the same structure (a named alias against the prop's
 * resolved type): same members, or same object props.
 * @param {MatchContext} ctx
 * @param {any} a
 * @param {any} b
 * @param {number} depth
 */
function sameStructure(ctx, a, b, depth) {
  if (a === b) return true;
  if (depth > MAX_DEPTH) return true;
  const as = constituents(a);
  const bs = constituents(b);
  if (as.length !== bs.length) return false;
  if (as.length > 1) return as.every(member => bs.includes(member));
  return printed(ctx, a) === printed(ctx, b) || sameShape(ctx, a, b);
}

/**
 * Does the documented type text match the code? It matches the union of the
 * prop's types across the props type's members, or any one member's type.
 * @param {string} docType
 * @param {any[]} codeTypes the prop's type in each member of the props type
 * @param {Omit<MatchContext, 'cache'> & {optional: boolean, chainNames?: Set<string>, cache?: MatchContext['cache']}} ctx
 * @returns {boolean | null} null when the documented text is not a type
 */
export function docTypeMatches(docType, codeTypes, ctx) {
  const node = parseType(ctx.ts, docType);
  if (!node) {
    // `(a: A) => void | (b: B) => void` is a union of callbacks written
    // without the parentheses TypeScript asks for, the way the compiler
    // prints it: read it with them.
    const loose = parseType(ctx.ts, docType, true);
    const callbacks = loose && callbackUnionReading(ctx.ts, loose);
    return callbacks ? docTypeMatches(callbacks, codeTypes, ctx) : null;
  }
  const {ts} = ctx;
  if (
    ts.isTypeReferenceNode(node) &&
    !node.typeArguments &&
    ctx.chainNames?.size
  ) {
    const name = referenceName(ts, node.typeName);
    if (
      ctx.chainNames.has(name) ||
      ctx.chainNames.has(name.split('.').pop() ?? '')
    ) {
      return true;
    }
  }
  /** @type {MatchContext} */
  const context = {
    ts,
    checker: ctx.checker,
    location: ctx.location,
    cache: ctx.cache ?? new Map(),
  };
  const strip = (/** @type {any[]} */ types) =>
    types.filter(
      t =>
        !(t.flags & ts.TypeFlags.Never) &&
        !(ctx.optional && t.flags & ts.TypeFlags.Undefined),
    );
  const union = [...new Set(codeTypes.flatMap(constituents))];
  const candidates = [
    union,
    ...(codeTypes.length > 1 ? codeTypes.map(constituents) : []),
  ];
  // An optional prop's `undefined` is dropped on both sides: a doc may write
  // it out (`'a' | 'b' | undefined`) or leave it implied.
  const docs = docMembers(ts, node).filter(
    doc => !(ctx.optional && doc.kind === ts.SyntaxKind.UndefinedKeyword),
  );
  if (docs.length === 0) return null;
  return candidates.some(codes => matchMembers(context, docs, strip(codes), 0));
}
