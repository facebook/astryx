// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Generate @astryxdesign/core's public theme visual-prop contract.
 * @input Core source files and component docs in packages/core/src.
 * @output packages/core/theme-visual-props.json, a deterministic public JSON
 *   contract with no local paths, source locations, or commit hashes.
 */

import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const CORE_ROOT = path.join(REPO_ROOT, 'packages/core');
const CORE_SRC = path.join(CORE_ROOT, 'src');
const OUTPUT_FILE = path.join(CORE_ROOT, 'theme-visual-props.json');
const require = createRequire(import.meta.url);
const ts = require(path.join(REPO_ROOT, 'node_modules/typescript'));

function parseArgs(argv) {
  const flags = new Set(argv);
  const unknown = argv.filter(
    arg => arg !== '--check' && arg !== '--write' && arg !== '--help',
  );
  if (flags.has('--help')) {
    console.log(
      'Usage: node scripts/generate-theme-visual-props.mjs [--check|--write]',
    );
    process.exit(0);
  }
  if (unknown.length > 0) {
    throw new Error(`Unknown option(s): ${unknown.join(', ')}`);
  }
  if (flags.has('--check') && flags.has('--write')) {
    throw new Error('--check and --write are mutually exclusive');
  }
  return {check: flags.has('--check')};
}

function stableClassName(name) {
  return `astryx-${name}`;
}

function targetKey(className) {
  return className.replace(/^astryx-/, '');
}

function toPascalCase(value) {
  return value
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function staticName(name) {
  if (!name) return null;
  if (
    ts.isIdentifier(name) ||
    ts.isStringLiteralLike(name) ||
    ts.isNumericLiteral(name)
  )
    return name.text;
  if (
    ts.isComputedPropertyName(name) &&
    (ts.isStringLiteralLike(name.expression) ||
      ts.isNumericLiteral(name.expression))
  ) {
    return name.expression.text;
  }
  return null;
}

function unwrapExpression(node) {
  let current = node;
  while (
    current &&
    (ts.isParenthesizedExpression(current) ||
      ts.isAsExpression(current) ||
      ts.isTypeAssertionExpression(current) ||
      ts.isNonNullExpression(current) ||
      ts.isSatisfiesExpression(current))
  ) {
    current = current.expression;
  }
  return current;
}

function isStringCoercion(expression) {
  const value = unwrapExpression(expression);
  return (
    ts.isCallExpression(value) &&
    ts.isIdentifier(value.expression) &&
    value.expression.text === 'String' &&
    value.arguments.length === 1
  );
}

function stringList(value) {
  return Array.isArray(value) ? value.filter(v => typeof v === 'string') : [];
}

function compareStrings(a, b) {
  return a.localeCompare(b);
}

function uniqSorted(values) {
  return [...new Set(values)].sort(compareStrings);
}

function canonicalJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function walkFiles(root, predicate, out = []) {
  for (const entry of fs.readdirSync(root, {withFileTypes: true})) {
    if (
      entry.name === 'node_modules' ||
      entry.name === 'dist' ||
      entry.name === '__tests__'
    )
      continue;
    const full = path.join(root, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, predicate, out);
    } else if (predicate(full)) {
      out.push(full);
    }
  }
  return out.sort(compareStrings);
}

function isProductionCoreSource(sourceFile) {
  const file = sourceFile.fileName;
  return (
    file.startsWith(`${CORE_SRC}${path.sep}`) &&
    !file.endsWith('.d.ts') &&
    !/(^|\/)(?:__tests__|__fixtures__)(?:\/|$)/.test(
      file.split(path.sep).join('/'),
    ) &&
    !/\.(?:test|stories)\.[cm]?[jt]sx?$/.test(file) &&
    /\.[cm]?[jt]sx?$/.test(file)
  );
}

function createCoreProgram() {
  const configPath = path.join(CORE_ROOT, 'tsconfig.json');
  const readConfig = ts.readConfigFile(configPath, ts.sys.readFile);
  if (readConfig.error) {
    throw new Error(
      ts.flattenDiagnosticMessageText(readConfig.error.messageText, '\n'),
    );
  }
  const parsedConfig = ts.parseJsonConfigFileContent(
    readConfig.config,
    ts.sys,
    path.dirname(configPath),
    {noEmit: true},
    configPath,
  );
  const rootNames = parsedConfig.fileNames.filter(fileName =>
    isProductionCoreSource({fileName}),
  );
  return ts.createProgram({
    rootNames,
    options: parsedConfig.options,
    projectReferences: parsedConfig.projectReferences,
  });
}

function emptyDomain() {
  return {
    strings: new Set(),
    numbers: new Set(),
    openString: false,
    openNumber: false,
    unresolved: new Set(),
  };
}

function mergeDomain(into, from) {
  for (const value of from.strings) into.strings.add(value);
  for (const value of from.numbers) into.numbers.add(value);
  into.openString ||= from.openString;
  into.openNumber ||= from.openNumber;
  for (const value of from.unresolved) into.unresolved.add(value);
  return into;
}

function domainFromCurrentKeys(keys) {
  const domain = emptyDomain();
  domain.openString = true;
  for (const key of keys) domain.strings.add(key);
  return domain;
}

function sortAugmentations(augmentations) {
  return [...augmentations].sort((a, b) =>
    `${a.module}:${a.interface}`.localeCompare(`${b.module}:${b.interface}`),
  );
}

function serializeDomain(domain) {
  const adjusted = emptyDomain();
  mergeDomain(adjusted, domain);

  const strings = [...adjusted.strings].sort(compareStrings);
  const numbers = [...adjusted.numbers].sort((a, b) => a - b);
  const knownLiterals =
    strings.length || numbers.length ? {strings, numbers} : undefined;
  const unresolved = [...adjusted.unresolved].sort(compareStrings);
  if (unresolved.length > 0) {
    return {
      kind: 'unresolved',
      reason: unresolved.some(value => /^<[^>]+>$/.test(value))
        ? 'missing-owner'
        : 'unsupported-type',
    };
  }
  if (adjusted.openString || adjusted.openNumber) {
    return {
      kind: 'open',
      primitives: [
        ...(adjusted.openString ? ['string'] : []),
        ...(adjusted.openNumber ? ['number'] : []),
      ],
      ...(knownLiterals ? {knownLiterals} : {}),
    };
  }
  if (knownLiterals) return {kind: 'finite', values: knownLiterals};
  return {kind: 'unresolved', types: ['<no-observable-value>']};
}

function classifyType(checker, type, location, seen = new Set()) {
  const result = emptyDomain();
  if (!type || seen.has(type)) {
    result.unresolved.add(
      type ? checker.typeToString(type, location) : '<missing-type>',
    );
    return result;
  }
  seen.add(type);
  const flags = type.flags;
  if (
    (flags &
      (ts.TypeFlags.Null |
        ts.TypeFlags.Undefined |
        ts.TypeFlags.Void |
        ts.TypeFlags.Never)) !==
    0
  )
    return result;
  if ((flags & ts.TypeFlags.StringLiteral) !== 0) {
    result.strings.add(String(type.value));
    return result;
  }
  if ((flags & ts.TypeFlags.NumberLiteral) !== 0) {
    result.numbers.add(Number(type.value));
    return result;
  }
  if (
    (flags &
      (ts.TypeFlags.String |
        ts.TypeFlags.TemplateLiteral |
        ts.TypeFlags.StringMapping)) !==
    0
  ) {
    result.openString = true;
    return result;
  }
  if ((flags & ts.TypeFlags.Number) !== 0) {
    result.openNumber = true;
    return result;
  }
  if ((flags & ts.TypeFlags.TypeParameter) !== 0) {
    const constraint =
      checker.getBaseConstraintOfType(type) ?? type.getConstraint?.();
    if (constraint && constraint !== type)
      return classifyType(checker, constraint, location, seen);
    result.unresolved.add(
      checker.typeToString(type, location, ts.TypeFormatFlags.NoTruncation),
    );
    return result;
  }
  if (type.isUnion?.() || type.isIntersection?.()) {
    for (const member of type.types)
      mergeDomain(result, classifyType(checker, member, location, seen));
    return result;
  }
  const apparent = checker.getApparentType(type);
  if (apparent && apparent !== type) {
    const classified = classifyType(checker, apparent, location, seen);
    if (
      classified.openString ||
      classified.openNumber ||
      classified.strings.size ||
      classified.numbers.size
    )
      return classified;
  }
  result.unresolved.add(
    checker.typeToString(type, location, ts.TypeFormatFlags.NoTruncation),
  );
  return result;
}

function createExtractor(program) {
  const checker = program.getTypeChecker();
  const sourceFiles = program.getSourceFiles().filter(isProductionCoreSource);

  function unalias(symbol) {
    let current = symbol;
    const seen = new Set();
    while (
      current &&
      (current.flags & ts.SymbolFlags.Alias) !== 0 &&
      !seen.has(current)
    ) {
      seen.add(current);
      const next = checker.getAliasedSymbol(current);
      if (!next || next === current) break;
      current = next;
    }
    return current;
  }

  const publicAugmentationsBySymbol = new Map();
  for (const sourceFile of sourceFiles) {
    for (const statement of sourceFile.statements) {
      if (!ts.isInterfaceDeclaration(statement)) continue;
      const symbol = checker.getSymbolAtLocation(statement.name);
      if (!symbol) continue;
      const relative = path
        .relative(CORE_SRC, sourceFile.fileName)
        .split(path.sep)
        .join('/');
      const componentMatch = /^([^/]+)\/index\.tsx?$/.exec(relative);
      const exported =
        statement.modifiers?.some(
          m => m.kind === ts.SyntaxKind.ExportKeyword,
        ) ?? false;
      if (exported && componentMatch && statement.name.text.endsWith('Map')) {
        const declared = checker.getDeclaredTypeOfSymbol(symbol);
        publicAugmentationsBySymbol.set(symbol, {
          module: `@astryxdesign/core/${componentMatch[1]}`,
          interface: statement.name.text,
          currentKeys: checker
            .getPropertiesOfType(declared)
            .map(s => s.getName())
            .sort(compareStrings),
        });
      } else if (
        exported &&
        relative === 'theme/types.ts' &&
        statement.name.text === 'CustomTextTypes'
      ) {
        publicAugmentationsBySymbol.set(symbol, {
          module: '@astryxdesign/core/theme',
          interface: 'CustomTextTypes',
          currentKeys: [],
        });
      }
    }
  }

  function mapsForTypeNode(node, seenSymbols = new Set()) {
    const found = new Set();
    if (!node) return found;
    const visit = child => {
      if (ts.isTypeReferenceNode(child)) {
        let symbol = checker.getSymbolAtLocation(child.typeName);
        if (symbol) {
          symbol = unalias(symbol);
          for (const map of mapsForSymbol(symbol, seenSymbols)) found.add(map);
        }
      }
      ts.forEachChild(child, visit);
    };
    visit(node);
    return found;
  }

  function mapsForSymbol(symbol, seenSymbols = new Set()) {
    if (!symbol) return new Set();
    symbol = unalias(symbol);
    if (publicAugmentationsBySymbol.has(symbol))
      return new Set([publicAugmentationsBySymbol.get(symbol)]);
    if (seenSymbols.has(symbol)) return new Set();
    seenSymbols.add(symbol);
    const found = new Set();
    for (const declaration of symbol.declarations ?? []) {
      if (ts.isTypeAliasDeclaration(declaration)) {
        for (const map of mapsForTypeNode(declaration.type, seenSymbols))
          found.add(map);
      } else if (
        ts.isPropertySignature(declaration) ||
        ts.isPropertyDeclaration(declaration) ||
        ts.isParameter(declaration) ||
        ts.isVariableDeclaration(declaration)
      ) {
        if (declaration.type) {
          for (const map of mapsForTypeNode(declaration.type, seenSymbols))
            found.add(map);
        }
        if (declaration.initializer) {
          for (const map of mapsForExpression(
            declaration.initializer,
            seenSymbols,
          ))
            found.add(map);
        }
      }
    }
    seenSymbols.delete(symbol);
    return new Set(found);
  }

  function mapsForCheckedType(type, out = new Set(), seenTypes = new Set()) {
    if (!type || seenTypes.has(type)) return out;
    seenTypes.add(type);
    if (type.aliasSymbol)
      for (const map of mapsForSymbol(type.aliasSymbol)) out.add(map);
    if (type.symbol) for (const map of mapsForSymbol(type.symbol)) out.add(map);
    for (const member of type.types ?? [])
      mapsForCheckedType(member, out, seenTypes);
    const constraint = type.getConstraint?.();
    if (constraint && constraint !== type)
      mapsForCheckedType(constraint, out, seenTypes);
    return out;
  }

  function mapsForExpression(expression, seenSymbols = new Set()) {
    const expr = unwrapExpression(expression);
    const found = mapsForCheckedType(checker.getTypeAtLocation(expr));
    let symbol = checker.getSymbolAtLocation(expr);
    if (!symbol && ts.isPropertyAccessExpression(expr))
      symbol = checker.getSymbolAtLocation(expr.name);
    if (symbol)
      for (const map of mapsForSymbol(symbol, seenSymbols)) found.add(map);
    if (ts.isConditionalExpression(expr)) {
      for (const map of mapsForExpression(expr.whenTrue, seenSymbols))
        found.add(map);
      for (const map of mapsForExpression(expr.whenFalse, seenSymbols))
        found.add(map);
    } else if (ts.isBinaryExpression(expr)) {
      for (const map of mapsForExpression(expr.left, seenSymbols))
        found.add(map);
      for (const map of mapsForExpression(expr.right, seenSymbols))
        found.add(map);
    }
    return found;
  }

  function augmentationList(maps) {
    const byKey = new Map();
    for (const map of maps) byKey.set(`${map.module}:${map.interface}`, map);
    return [...byKey.values()].sort((a, b) =>
      `${a.module}:${a.interface}`.localeCompare(`${b.module}:${b.interface}`),
    );
  }

  const ownerProps = new Map();
  function addOwnerProp(owner, prop, domain, augmentations) {
    const key = `${owner}\0${prop}`;
    const current = ownerProps.get(key) ?? {
      domain: emptyDomain(),
      augmentations: new Map(),
    };
    mergeDomain(current.domain, domain);
    for (const augmentation of augmentations)
      current.augmentations.set(
        `${augmentation.module}:${augmentation.interface}`,
        augmentation,
      );
    ownerProps.set(key, current);
  }

  for (const sourceFile of sourceFiles) {
    const owner = path
      .relative(CORE_SRC, sourceFile.fileName)
      .split(path.sep)[0];
    if (!owner) continue;
    const visit = node => {
      if (ts.isInterfaceDeclaration(node) && node.name.text.endsWith('Props')) {
        for (const member of node.members) {
          if (!ts.isPropertySignature(member) || !member.type) continue;
          const prop = staticName(member.name);
          if (!prop) continue;
          const type = checker.getTypeAtLocation(member.type);
          addOwnerProp(
            owner,
            prop,
            classifyType(checker, type, member.type),
            augmentationList([
              ...mapsForTypeNode(member.type),
              ...mapsForCheckedType(type),
              ...mapsForSymbol(checker.getSymbolAtLocation(member.name)),
            ]),
          );
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  function ownerProp(component, prop) {
    return ownerProps.get(`${component}\0${prop}`) ?? null;
  }

  function propertyRecordsFromType(expression) {
    const type = checker.getTypeAtLocation(expression);
    if ((type.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown)) !== 0)
      return [];
    return checker
      .getPropertiesOfType(checker.getApparentType(type))
      .map(symbol => {
        const valueType = checker.getTypeOfSymbolAtLocation(symbol, expression);
        return {
          key: symbol.getName(),
          domain: classifyType(checker, valueType, expression),
          augmentations: augmentationList([
            ...mapsForCheckedType(valueType),
            ...mapsForSymbol(symbol),
          ]),
          stringCoercion: false,
        };
      });
  }

  function collectPropRecords(expression) {
    const expr = unwrapExpression(expression);
    if (
      expr.kind === ts.SyntaxKind.NullKeyword ||
      (ts.isIdentifier(expr) && expr.text === 'undefined')
    )
      return [];
    if (ts.isObjectLiteralExpression(expr)) {
      const records = [];
      for (const property of expr.properties) {
        if (ts.isPropertyAssignment(property)) {
          const key = staticName(property.name);
          if (key == null) continue;
          const value = property.initializer;
          const type = checker.getTypeAtLocation(value);
          records.push({
            key,
            domain: classifyType(checker, type, value),
            augmentations: augmentationList(mapsForExpression(value)),
            stringCoercion: isStringCoercion(value),
          });
        } else if (ts.isShorthandPropertyAssignment(property)) {
          const value = property.name;
          const type = checker.getTypeAtLocation(value);
          records.push({
            key: value.text,
            domain: classifyType(checker, type, value),
            augmentations: augmentationList(mapsForExpression(value)),
            stringCoercion: false,
          });
        } else if (ts.isSpreadAssignment(property)) {
          const spread = unwrapExpression(property.expression);
          if (ts.isObjectLiteralExpression(spread)) {
            records.push(...collectPropRecords(spread));
          } else if (ts.isConditionalExpression(spread)) {
            records.push(
              ...collectPropRecords(spread.whenTrue),
              ...collectPropRecords(spread.whenFalse),
            );
          } else if (
            ts.isBinaryExpression(spread) &&
            (spread.operatorToken.kind ===
              ts.SyntaxKind.AmpersandAmpersandToken ||
              spread.operatorToken.kind === ts.SyntaxKind.BarBarToken ||
              spread.operatorToken.kind === ts.SyntaxKind.QuestionQuestionToken)
          ) {
            records.push(...collectPropRecords(spread.right));
          } else {
            records.push(...propertyRecordsFromType(spread));
          }
        }
      }
      return records;
    }
    if (ts.isConditionalExpression(expr))
      return [
        ...collectPropRecords(expr.whenTrue),
        ...collectPropRecords(expr.whenFalse),
      ];
    return propertyRecordsFromType(expr);
  }

  function collectLegacyNames(optionsArg) {
    if (!optionsArg) return [];
    const expr = unwrapExpression(optionsArg);
    if (!ts.isObjectLiteralExpression(expr)) return [];
    const names = [];
    for (const property of expr.properties) {
      if (
        !ts.isPropertyAssignment(property) ||
        staticName(property.name) !== 'legacyNames'
      )
        continue;
      const value = unwrapExpression(property.initializer);
      if (!ts.isArrayLiteralExpression(value)) continue;
      for (const element of value.elements)
        if (ts.isStringLiteralLike(element)) names.push(element.text);
    }
    return names;
  }

  const themePropsFile = program.getSourceFile(
    path.join(CORE_SRC, 'utils/themeProps.ts'),
  );
  let canonicalThemeProps = null;
  if (themePropsFile) {
    for (const statement of themePropsFile.statements) {
      if (
        ts.isFunctionDeclaration(statement) &&
        statement.name?.text === 'themeProps'
      ) {
        canonicalThemeProps = checker.getSymbolAtLocation(statement.name);
      }
    }
  }
  if (!canonicalThemeProps)
    throw new Error('Could not bind canonical themeProps export');

  const runtimeTargets = new Map();
  for (const sourceFile of sourceFiles) {
    const visit = node => {
      if (
        ts.isCallExpression(node) &&
        ts.isIdentifier(node.expression) &&
        node.expression.text === 'themeProps'
      ) {
        const bound = unalias(checker.getSymbolAtLocation(node.expression));
        if (bound === canonicalThemeProps) {
          const [targetArg, propsArg, optionsArg] = node.arguments;
          const unwrappedTarget = targetArg
            ? unwrapExpression(targetArg)
            : null;
          if (unwrappedTarget && ts.isStringLiteralLike(unwrappedTarget)) {
            const className = stableClassName(unwrappedTarget.text);
            const target = runtimeTargets.get(className) ?? {
              className,
              aliases: new Set(),
              props: new Map(),
            };
            const owner = path
              .relative(CORE_SRC, sourceFile.fileName)
              .split(path.sep)[0];
            for (const alias of collectLegacyNames(optionsArg)) {
              target.aliases.add(stableClassName(alias));
            }
            for (const record of propsArg ? collectPropRecords(propsArg) : []) {
              const aggregate = target.props.get(record.key) ?? {
                domain: emptyDomain(),
                augmentations: new Map(),
              };
              const ownerSource = ownerProp(owner, record.key);
              const domain =
                record.stringCoercion &&
                ownerSource &&
                ownerSource.domain.unresolved.size === 0
                  ? ownerSource.domain
                  : record.domain;
              mergeDomain(aggregate.domain, domain);
              for (const augmentation of [
                ...record.augmentations,
                ...(ownerSource?.augmentations.values() ?? []),
              ]) {
                aggregate.augmentations.set(
                  `${augmentation.module}:${augmentation.interface}`,
                  augmentation,
                );
              }
              target.props.set(record.key, aggregate);
            }
            runtimeTargets.set(className, target);
          }
        }
      }
      ts.forEachChild(node, visit);
    };
    visit(sourceFile);
  }

  return {
    ownerProp,
    runtimeTargets,
    publicAugmentations: [...publicAugmentationsBySymbol.values()].sort(
      (a, b) =>
        `${a.module}:${a.interface}`.localeCompare(
          `${b.module}:${b.interface}`,
        ),
    ),
  };
}

async function loadDocs() {
  const targets = [];
  const docFiles = walkFiles(CORE_SRC, file => file.endsWith('.doc.mjs'));
  for (const file of docFiles) {
    const mod = await import(
      `${pathToFileURL(file).href}?themeVisualProps=${Date.now()}`
    );
    const docs =
      mod.docs ?? (mod.default?.type === 'component' ? mod.default : null);
    if (!docs) continue;
    const component =
      typeof docs.name === 'string'
        ? docs.name
        : path.basename(path.dirname(file));
    for (const target of docs.theming?.targets ?? []) {
      if (!target || typeof target.className !== 'string') continue;
      targets.push({
        className: target.className,
        key: targetKey(target.className),
        component,
        visualProps: stringList(target.visualProps),
        states: stringList(target.states),
        deprecatedFor:
          typeof target.deprecatedFor === 'string'
            ? target.deprecatedFor
            : null,
      });
    }
  }
  return targets;
}

function canonicalDocTargets(docTargets) {
  const byClass = new Map();
  for (const doc of docTargets) {
    const current = byClass.get(doc.className) ?? {
      key: doc.key,
      className: doc.className,
      components: new Set(),
      visualProps: new Set(),
      states: new Set(),
      deprecatedFor: new Set(),
    };
    current.components.add(doc.component);
    for (const prop of doc.visualProps) current.visualProps.add(prop);
    for (const state of doc.states) current.states.add(state);
    if (doc.deprecatedFor) current.deprecatedFor.add(doc.deprecatedFor);
    byClass.set(doc.className, current);
  }
  return [...byClass.values()].sort(
    (a, b) =>
      a.key.localeCompare(b.key) || a.className.localeCompare(b.className),
  );
}

function sourceForDocProp(doc, prop, role, runtimeTargets, ownerProp) {
  const direct = runtimeTargets.get(doc.className)?.props.get(prop);
  if (direct) return direct;

  for (const deprecatedFor of doc.deprecatedFor) {
    const aliasDirect = runtimeTargets
      .get(stableClassName(deprecatedFor))
      ?.props.get(prop);
    if (aliasDirect) return aliasDirect;
  }

  const ownerSources = [...doc.components]
    .map(component => ownerProp(component, prop))
    .filter(Boolean);
  if (ownerSources.length > 0) {
    const fingerprints = new Set(
      ownerSources.map(source =>
        JSON.stringify({
          domain: serializeDomain(source.domain),
          augmentations: sortAugmentations(source.augmentations.values()).map(
            augmentation => ({
              module: augmentation.module,
              interface: augmentation.interface,
            }),
          ),
        }),
      ),
    );
    if (fingerprints.size > 1) {
      throw new Error(
        `Conflicting checked owner types for ${doc.key}.${prop}: ${[
          ...doc.components,
        ]
          .sort(compareStrings)
          .join(', ')}`,
      );
    }
    return ownerSources[0];
  }

  const unresolved = emptyDomain();
  unresolved.unresolved.add(`<${role}:${prop}>`);
  return {domain: unresolved, augmentations: new Map()};
}

export async function generateThemeVisualProps() {
  const program = createCoreProgram();
  const syntactic = program
    .getSyntacticDiagnostics()
    .filter(d => d.file && isProductionCoreSource(d.file));
  const semantic = program
    .getSemanticDiagnostics()
    .filter(d => d.file && isProductionCoreSource(d.file));
  if (syntactic.length || semantic.length) {
    throw new Error(
      `Core TypeScript program has diagnostics (syntactic=${syntactic.length}, semantic=${semantic.length})`,
    );
  }

  const extractor = createExtractor(program);
  const docTargets = canonicalDocTargets(await loadDocs());
  const targets = docTargets.map(doc => {
    const props = [];
    for (const name of [...doc.visualProps].sort(compareStrings)) {
      const source = sourceForDocProp(
        doc,
        name,
        'visualProp',
        extractor.runtimeTargets,
        extractor.ownerProp,
      );
      const augmentations =
        source.augmentations instanceof Map
          ? [...source.augmentations.values()]
          : (source.augmentations ?? []);
      props.push({
        name,
        role: 'visualProp',
        domain: serializeDomain(source.domain),
        ...(augmentations.length > 0
          ? {augmentationInterfaces: sortAugmentations(augmentations)}
          : {}),
      });
    }
    for (const name of [...doc.states].sort(compareStrings)) {
      const source = sourceForDocProp(
        doc,
        name,
        'state',
        extractor.runtimeTargets,
        extractor.ownerProp,
      );
      const augmentations =
        source.augmentations instanceof Map
          ? [...source.augmentations.values()]
          : (source.augmentations ?? []);
      props.push({
        name,
        role: 'state',
        ...(augmentations.length > 0
          ? {augmentationInterfaces: sortAugmentations(augmentations)}
          : {}),
      });
    }

    const aliases = [];
    for (const runtime of extractor.runtimeTargets.values()) {
      if (runtime.aliases.has(doc.className)) aliases.push(runtime.className);
    }

    return {
      key: doc.key,
      className: doc.className,
      ...(doc.deprecatedFor.size > 0
        ? {deprecatedFor: [...doc.deprecatedFor].sort(compareStrings)}
        : {}),
      ...(aliases.length > 0 ? {aliasOf: aliases.sort(compareStrings)} : {}),
      props,
    };
  });

  const targetPropCount = targets.reduce(
    (sum, target) => sum + target.props.length,
    0,
  );
  const domainCounts = {finite: 0, open: 0, unresolved: 0};
  const augmentationInterfaces = new Map();
  for (const target of targets) {
    for (const prop of target.props) {
      if (prop.domain) domainCounts[prop.domain.kind]++;
      for (const augmentation of prop.augmentationInterfaces ?? []) {
        augmentationInterfaces.set(
          `${augmentation.module}:${augmentation.interface}`,
          augmentation,
        );
      }
    }
  }

  return {
    schemaVersion: 1,
    packageName: '@astryxdesign/core',
    summary: {
      targetCount: targets.length,
      targetPropCount,
      deprecatedAliasCount: targets.filter(target => target.deprecatedFor)
        .length,
      domainCounts,
      augmentationInterfaceCount: augmentationInterfaces.size,
    },
    augmentationInterfaces: sortAugmentations(augmentationInterfaces.values()),
    targets,
  };
}

export async function renderThemeVisualProps() {
  return canonicalJson(await generateThemeVisualProps());
}

async function main() {
  const {check} = parseArgs(process.argv.slice(2));
  const rendered = await renderThemeVisualProps();
  if (check) {
    const current = fs.existsSync(OUTPUT_FILE)
      ? fs.readFileSync(OUTPUT_FILE, 'utf8')
      : null;
    if (current !== rendered) {
      console.error(
        '✗ packages/core/theme-visual-props.json is stale. Run `node scripts/generate-theme-visual-props.mjs` and commit the result.',
      );
      process.exitCode = 1;
      return;
    }
    console.log('✓ packages/core/theme-visual-props.json is up to date.');
    return;
  }
  fs.writeFileSync(OUTPUT_FILE, rendered);
  const manifest = JSON.parse(rendered);
  console.log(
    `✓ Wrote packages/core/theme-visual-props.json (${manifest.summary.targetCount} targets, ${manifest.summary.targetPropCount} props).`,
  );
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch(error => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
