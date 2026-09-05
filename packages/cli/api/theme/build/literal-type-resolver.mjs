// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Resolve finite literal domains with TypeScript's own binding graph.
 *
 * Theme validation reads prop types from component docs. Inline literal unions
 * are handled directly; named types are resolved in the lexical scope of the
 * component source that owns the prop. TypeScript therefore owns import,
 * re-export, package-entrypoint, extension-substitution, and shadowing rules.
 * Any ambiguous, generic, open, or otherwise non-literal type resolves to null.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/**
 * Find the source module that owns a component's documented props.
 *
 * Most docs sit beside their implementation. A few aggregate docs reference a
 * component in another top-level directory (for example Text/Heading.doc.mjs
 * documents core/src/Heading/Heading.tsx), so exact component files are checked
 * in both locations before considering a barrel.
 *
 * @param {string} coreSrc
 * @param {string} componentName
 * @param {string} docFile
 * @returns {string|null}
 */
export function findComponentSourceFile(coreSrc, componentName, docFile) {
  const docDir = path.dirname(docFile);
  const componentDir = path.join(coreSrc, componentName);
  const exactCandidates = [
    path.join(docDir, `${componentName}.ts`),
    path.join(docDir, `${componentName}.tsx`),
    path.join(componentDir, `${componentName}.ts`),
    path.join(componentDir, `${componentName}.tsx`),
  ];
  const exact = exactCandidates.find(candidate => fs.existsSync(candidate));
  if (exact) return exact;

  const barrelCandidates = [
    path.join(componentDir, 'index.ts'),
    path.join(componentDir, 'index.tsx'),
  ];
  if (path.basename(docDir) === componentName) {
    barrelCandidates.push(
      path.join(docDir, 'index.ts'),
      path.join(docDir, 'index.tsx'),
    );
  }
  return barrelCandidates.find(candidate => fs.existsSync(candidate)) ?? null;
}

/**
 * @param {any} ts
 * @param {any} type
 * @returns {string[]|null}
 */
function valuesFromCheckedType(ts, type) {
  if (!type) return null;
  const members = type.isUnion?.() ? type.types : [type];
  const values = new Set();
  for (const member of members) {
    if ((member.flags & ts.TypeFlags.StringLiteral) !== 0) {
      values.add(String(member.value));
    } else if ((member.flags & ts.TypeFlags.NumberLiteral) !== 0) {
      values.add(String(member.value));
    } else {
      return null;
    }
  }
  return values.size > 0 ? [...values] : null;
}

/**
 * Create a resolver backed by one incrementally-expanded TypeScript program.
 * TypeScript is loaded lazily because non-theme CLI commands never need it.
 *
 * @param {string[]} [initialRootFiles]
 * @returns {Promise<{resolve(type: string, ownerFile: string|null): string[]|null}>}
 */
export async function createLiteralTypeResolver(initialRootFiles = []) {
  const {default: ts} = await import('typescript');
  const rootFiles = new Set(
    initialRootFiles.filter(Boolean).map(file => path.resolve(file)),
  );
  /** @type {any|null} */
  let program = null;
  /** @type {any|null} */
  let checker = null;
  const cache = new Map();

  /** @param {string} ownerFile */
  const ensureContext = ownerFile => {
    const normalized = path.resolve(ownerFile);
    if (!rootFiles.has(normalized)) {
      rootFiles.add(normalized);
      program = null;
      checker = null;
      cache.clear();
    }
    if (!program) {
      program = ts.createProgram([...rootFiles], {
        target: ts.ScriptTarget.ESNext,
        module: ts.ModuleKind.ESNext,
        moduleResolution: ts.ModuleResolutionKind.Bundler,
        jsx: ts.JsxEmit.Preserve,
        noEmit: true,
        skipLibCheck: true,
      });
      checker = program.getTypeChecker();
    }
    return {sourceFile: program.getSourceFile(normalized), checker};
  };

  /**
   * @param {string} name
   * @param {string|null} ownerFile
   * @returns {string[]|null}
   */
  const resolveName = (name, ownerFile) => {
    if (!ownerFile) return null;
    const {sourceFile, checker: activeChecker} = ensureContext(ownerFile);
    if (!sourceFile || !activeChecker) return null;

    let symbol = activeChecker.resolveName(
      name,
      sourceFile,
      ts.SymbolFlags.Type,
      false,
    );
    if (!symbol || symbol.declarations?.length !== 1) return null;
    if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
      symbol = activeChecker.getAliasedSymbol(symbol);
      if (!symbol || symbol.declarations?.length !== 1) return null;
    }
    return valuesFromCheckedType(
      ts,
      activeChecker.getDeclaredTypeOfSymbol(symbol),
    );
  };

  /**
   * @param {any} node
   * @param {string|null} ownerFile
   * @returns {string[]|null}
   */
  const resolveNode = (node, ownerFile) => {
    if (!node) return null;
    if (ts.isParenthesizedTypeNode(node)) {
      return resolveNode(node.type, ownerFile);
    }
    if (ts.isLiteralTypeNode(node)) {
      if (
        ts.isStringLiteral(node.literal) ||
        ts.isNumericLiteral(node.literal)
      ) {
        return [String(node.literal.text)];
      }
      if (
        ts.isPrefixUnaryExpression(node.literal) &&
        node.literal.operator === ts.SyntaxKind.MinusToken &&
        ts.isNumericLiteral(node.literal.operand)
      ) {
        return [String(-Number(node.literal.operand.text))];
      }
      return null;
    }
    if (ts.isUnionTypeNode(node)) {
      const values = new Set();
      for (const member of node.types) {
        const resolved = resolveNode(member, ownerFile);
        if (!resolved) return null;
        for (const value of resolved) values.add(value);
      }
      return values.size > 0 ? [...values] : null;
    }
    if (
      ts.isTypeReferenceNode(node) &&
      ts.isIdentifier(node.typeName) &&
      !node.typeArguments?.length
    ) {
      return resolveName(node.typeName.text, ownerFile);
    }
    return null;
  };

  return {
    /**
     * @param {string} type
     * @param {string|null} ownerFile
     * @returns {string[]|null}
     */
    resolve(type, ownerFile) {
      const normalizedOwner = ownerFile ? path.resolve(ownerFile) : null;
      const cacheKey = `${normalizedOwner ?? ''}\0${type}`;
      if (cache.has(cacheKey)) return cache.get(cacheKey) ?? null;

      let node;
      try {
        const source = ts.createSourceFile(
          '__astryx_doc_type.ts',
          `type __AstryxLiteralDomain = ${type};`,
          ts.ScriptTarget.Latest,
          true,
          ts.ScriptKind.TS,
        );
        if (
          /** @type {any} */ (source).parseDiagnostics.length > 0 ||
          source.statements.length !== 1 ||
          !ts.isTypeAliasDeclaration(source.statements[0])
        ) {
          cache.set(cacheKey, null);
          return null;
        }
        node = source.statements[0].type;
      } catch {
        cache.set(cacheKey, null);
        return null;
      }
      const result = resolveNode(node, normalizedOwner);
      cache.set(cacheKey, result);
      return result;
    },
  };
}
