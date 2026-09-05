#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * CI gate for component API-contract drift — `node scripts/check-contract.mjs`.
 *
 * `{Name}.doc.mjs` `props[]` is what agents and consumers read. The truth is
 * the component's `{Name}Props` type. A test written in the same PR as the
 * doc it asserts only proves the author typed both (#5382). This derives the
 * public prop names from the TypeScript checker and fails when a source prop
 * is missing from the doc, the way `themingTargets.test.ts` derives
 * `themeProps()` classes (#3741 / #4163 / #5421).
 *
 * Policy is SUBSET, not equality:
 *
 *   1. Source ⊆ docs. Every component-declared public prop must appear in
 *      `props[]`.
 *   2. Docs MAY list more — forwarded subcomponent props, extras the author
 *      wants in the table. Extra documented names are not drift.
 *
 * Deliberately NOT checked (v1): required/optional mismatch, phantom-in-doc
 * names, prop *types*, or prose. Those are later classes.
 *
 * Public = a property on the entry's prop bag whose declaration is not
 * BaseProps, `@types/react`, `csstype`, or the TypeScript libs. Inherited
 * HTML / `aria-*` / `data-*` passthrough is the shared platform surface and
 * must not be enumerated. The rest of node_modules IS public: a third-party
 * component re-exported under a core name has that library's bag as its
 * whole API. A handler *redeclared* on the component (TextInput `onKeyDown`,
 * Button `onClick` / `href` / `as`) is component API and MUST be documented
 * — filtering by name regex would hide it.
 *
 * The bag comes from one of two routes, ranked by proximity to the doc
 * (`createResolver`): an exported, top-level `{Name}Props` declaration, or
 * the signatures of the exported `{Name}` value — every bag parameter of
 * every overload, a class's constructor parameter, aliases followed. Plenty
 * of public entries only have the second: the three indicators share one
 * generic `IndicatorProps<F>`, `ContextMenuItem` is `DropdownMenuItem`
 * re-exported under another name, every Table plugin hook takes a
 * `{...}Config`. A file-private or nested lookalike never counts, and the
 * verdict does not depend on directory read order. What will not resolve —
 * no exported declaration or value, or a bag typed `any` — FAILS the run:
 * an entry that publishes a `props[]` contract nothing checked is the #5382
 * problem wearing a green tick.
 *
 * Key lookup uses one `ts.Program` over the source tree so `extends` /
 * `Omit` / `Pick` resolve. A program-per-file is correct but ~40× slower.
 * A union `{Name}Props` (`SliderSingleProps | SliderRangeProps`) is walked
 * per member, since the union's own property list holds only the common
 * props; an overloaded signature is walked the same way, every overload
 * being public API. A prop is platform passthrough only when every
 * declaration behind it is platform — an intersection redeclaring `onClick`
 * over BaseProps carries both declarations and stays public.
 *
 * The scan itself is gated: zero `.doc.mjs` found, a program that cannot
 * resolve `react` (every passthrough verdict rests on `@types/react`; without
 * it each `Omit<…>` over BaseProps collapses to nothing), a doc that cannot
 * be imported, exports no `docs`, or publishes `props[]` without a `name`,
 * or an entry whose props could not be resolved at all — each fails the run
 * instead of passing vacuously. A doc's `docs` export is what is checked
 * (a lone default export is accepted as a fallback), because `docs` is what
 * `astryx component <Name>` serves.
 *
 * Not yet in `check:repo`: core still has pre-existing drift this gate
 * reports. Wire it next to `check:i18n-catalog` once that count is zero
 * (#4163). Until then: `pnpm check:contract`.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const ts = require('typescript');

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CORE_SRC = path.join(ROOT, 'packages/core/src');

/**
 * Props ComponentPropDoc tells authors to omit, even when a component
 * redeclares them (`ref` on Button). Sibling of UNIVERSAL_PROPS in
 * `docPropReferences.test.ts`.
 */
export const SKIPPED_PROPS = new Set([
  'xstyle',
  'className',
  'style',
  'ref',
  'data-testid',
]);

/** True when `name` is platform surface, not component-authored API. */
export function isSkippedProp(name) {
  return SKIPPED_PROPS.has(name);
}

/**
 * Every prop name a doc file lists — top-level `props[]` plus inline
 * `components[].props`. Name-only ComponentRefs contribute nothing; those
 * names live in the sibling `{Name}.doc.mjs`.
 *
 * @param {{props?: {name: string}[], components?: {props?: {name: string}[]}[]}} docs
 * @returns {Set<string>}
 */
export function documentedPropNames(docs) {
  const names = new Set();
  for (const prop of docs?.props ?? []) {
    if (prop?.name) names.add(prop.name);
  }
  for (const entry of docs?.components ?? []) {
    for (const prop of entry?.props ?? []) {
      if (prop?.name) names.add(prop.name);
    }
  }
  return names;
}

/**
 * Source names that do not appear in the documented set. Extra documented
 * names are ignored (subset policy).
 *
 * @param {Iterable<string>} sourceNames
 * @param {Iterable<string>} documentedNames
 * @returns {string[]}
 */
export function findUndocumented(sourceNames, documentedNames) {
  const documented = new Set(documentedNames);
  return [...sourceNames].filter(name => !documented.has(name)).sort();
}

/**
 * Source files only — no tests, stories, docs, or perf fixtures. Neither
 * walker follows a directory symlink (a `Dirent` reports it as a link, not a
 * directory), which is also what keeps a symlink loop harmless.
 */
function walkSource(dir, out = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '__tests__' || entry.name === 'node_modules') continue;
      walkSource(full, out);
    } else if (
      /\.[jt]sx?$/.test(entry.name) &&
      !entry.name.includes('.test.') &&
      !entry.name.includes('.stories.') &&
      !entry.name.includes('.doc.') &&
      !entry.name.includes('.perf.') &&
      !entry.name.endsWith('.d.ts')
    ) {
      out.push(full);
    }
  }
  return out;
}

function walkDocs(dir, out = []) {
  for (const entry of fs.readdirSync(dir, {withFileTypes: true})) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules') continue;
      walkDocs(full, out);
    } else if (entry.name.endsWith('.doc.mjs')) {
      out.push(full);
    }
  }
  return out;
}

/**
 * One program over `filePaths` so `extends`/`Omit`/`Pick` resolve.
 *
 * @param {string[]} filePaths
 * @returns {{program: import('typescript').Program, checker: import('typescript').TypeChecker}}
 */
export function buildProgram(filePaths) {
  const program = ts.createProgram(
    filePaths,
    COMPILER_OPTIONS,
    libCachingHost(),
  );
  return {program, checker: program.getTypeChecker()};
}

const COMPILER_OPTIONS = {
  jsx: ts.JsxEmit.Preserve,
  target: ts.ScriptTarget.Latest,
  module: ts.ModuleKind.ESNext,
  moduleResolution: ts.ModuleResolutionKind.Bundler,
  noEmit: true,
  skipLibCheck: true,
  strict: true,
};

/** Parsed TypeScript lib files, shared by every program this process builds. */
const libFiles = new Map();

/**
 * The default host, except that `lib.*.d.ts` parse once per process. The
 * gate builds one program, so this changes nothing for it; the test suite
 * builds one per fixture, and re-parsing ~90 lib files each time was most of
 * its wall time. Lib files are immutable and every program here uses the
 * same options, so sharing them is safe.
 */
function libCachingHost() {
  const host = ts.createCompilerHost(COMPILER_OPTIONS);
  const getSourceFile = host.getSourceFile;
  host.getSourceFile = (fileName, ...rest) => {
    if (!/\/typescript\/lib\//.test(fileName)) {
      return getSourceFile.call(host, fileName, ...rest);
    }
    if (!libFiles.has(fileName)) {
      libFiles.set(fileName, getSourceFile.call(host, fileName, ...rest));
    }
    return libFiles.get(fileName);
  };
  return host;
}

/**
 * Property symbols of `type`. On a union (`SliderSingleProps |
 * SliderRangeProps`) `getProperties()` reports only the members' common
 * props, so a variant-only prop (`minStepsBetweenThumbs`) would never be
 * required. Walk each member instead.
 *
 * @param {import('typescript').Type} type
 * @returns {import('typescript').Symbol[]}
 */
function propertySymbols(type) {
  return type.isUnion()
    ? type.types.flatMap(propertySymbols)
    : type.getProperties();
}

/**
 * Platform surface: BaseProps, the DOM / ES libs, `@types/react` (and
 * `@types/react-dom`), and `csstype` behind React's style types. Not the rest
 * of node_modules — a third-party component's bag re-exported under a core
 * name IS that component's API. TS file names are always `/`-separated.
 */
function isInheritedPlatformDecl(declFile) {
  return /\/BaseProps\.ts$|\/typescript\/lib\/|\/@types\/react|\/csstype\//.test(
    declFile,
  );
}

/**
 * Add every component-declared prop name on `type` to `into`.
 *
 * An intersection (`BaseProps & {onClick}`) yields one synthetic symbol
 * carrying every constituent's declaration, so a prop is passthrough only
 * when all of them are platform. A declaration-less (key-remapped) prop is
 * component API.
 *
 * @param {import('typescript').Type} type
 * @param {Set<string>} into
 * @returns {Set<string>}
 */
function collectPublicProps(type, into) {
  for (const symbol of propertySymbols(type)) {
    const name = symbol.getName();
    if (name.startsWith('__')) continue;
    if (isSkippedProp(name)) continue;
    const declFiles = (symbol.getDeclarations() ?? []).map(
      decl => decl.getSourceFile().fileName,
    );
    if (declFiles.length > 0 && declFiles.every(isInheritedPlatformDecl)) {
      continue;
    }
    into.add(name);
  }
  return into;
}

/** A parameter typed so loosely that no contract can be read off it. */
const UNDERIVABLE = Symbol('underivable');

/**
 * The type whose properties are a parameter's prop bag; `null` when the
 * parameter is not a bag at all (`useThing(id: string)`, a bare callback —
 * a function type's only members come from lib and are filtered, a tuple or
 * array's are positions); or UNDERIVABLE for `any`, `unknown`, `object`, and
 * an unconstrained type parameter. A constrained type parameter
 * (`<P extends SharedProps>(props: P)`) reads as its constraint, so a union
 * constraint is still walked per member. A union or intersection is a bag
 * when any member is.
 *
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Type} type
 * @returns {import('typescript').Type | null | typeof UNDERIVABLE}
 */
function asPropBag(checker, type) {
  if (
    type.flags &
    (ts.TypeFlags.Any | ts.TypeFlags.Unknown | ts.TypeFlags.NonPrimitive)
  ) {
    return UNDERIVABLE;
  }
  // A tuple or array's members (`0`, `length`) are not props.
  if (checker.isTupleType(type) || checker.isArrayType(type)) return null;
  if (type.isTypeParameter()) {
    const constraint = checker.getBaseConstraintOfType(type);
    if (!constraint) return UNDERIVABLE;
    return asPropBag(checker, constraint);
  }
  if (type.isUnion() || type.isIntersection()) {
    const members = type.types.map(member => asPropBag(checker, member));
    if (members.some(member => member && member !== UNDERIVABLE)) return type;
    return members.includes(UNDERIVABLE) ? UNDERIVABLE : null;
  }
  return type.flags & ts.TypeFlags.Object ? type : null;
}

/**
 * Prop names of an exported value, read off its signatures: every parameter
 * of every overload that is a bag. A component's one parameter is its props;
 * a hook's parameters are its config — `useThing(id, options)` reads
 * `options`. A class component has construct signatures instead of call
 * signatures, and its constructor parameter is the same bag. A rest tuple
 * (`...args: [Opts]`) contributes its elements, not the tuple. `null` when
 * the value is not callable, or when the only bag it takes is untyped
 * (`props: any`): an entry the checker cannot read is UNDERIVABLE — unresolved,
 * not empty, and not something a farther candidate may paper over.
 *
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Symbol} symbol
 * @returns {Set<string> | null | typeof UNDERIVABLE}
 */
function propsFromSignature(checker, symbol) {
  const declaration = symbol.valueDeclaration ?? symbol.getDeclarations()?.[0];
  if (!declaration) return null;
  const type = checker.getTypeOfSymbolAtLocation(symbol, declaration);
  const signatures =
    type.getCallSignatures().length > 0
      ? type.getCallSignatures()
      : type.getConstructSignatures();
  if (signatures.length === 0) return null;

  const props = new Set();
  let underivable = false;
  for (const signature of signatures) {
    for (const parameter of signature.getParameters()) {
      const decl =
        parameter.valueDeclaration ?? parameter.getDeclarations()?.[0];
      if (!decl) continue;
      const declared = checker.getTypeOfSymbolAtLocation(parameter, decl);
      const types =
        decl.dotDotDotToken && checker.isTupleType(declared)
          ? checker.getTypeArguments(declared)
          : [declared];
      for (const candidate of types) {
        const bag = asPropBag(checker, candidate);
        if (bag === UNDERIVABLE) underivable = true;
        else if (bag) collectPublicProps(bag, props);
      }
    }
  }
  return props.size === 0 && underivable ? UNDERIVABLE : props;
}

/**
 * Prop names of an exported `{Name}Props` declaration: `null` when the alias
 * is not a bag at all (`type WidgetProps = string` — the next candidate may
 * be), UNDERIVABLE when it is `any` / `unknown` / `object`. That alias IS the
 * published contract, so nothing else may stand in for it.
 *
 * @param {import('typescript').TypeChecker} checker
 * @param {import('typescript').Node} node
 * @returns {Set<string> | null | typeof UNDERIVABLE}
 */
function propsFromDeclaration(checker, node) {
  const bag = asPropBag(checker, checker.getTypeAtLocation(node));
  return bag && bag !== UNDERIVABLE ? collectPublicProps(bag, new Set()) : bag;
}

/**
 * A TypeScript file name is `/`-separated on every platform; a Node path is
 * not. Compare like with like.
 */
function toTsPath(file) {
  return file.split(path.sep).join('/');
}

/** Path depth, so a nested internal copy never outranks the file beside the doc. */
function depth(file) {
  return file.split('/').length;
}

/**
 * Builds the resolver that maps a documented entry to its prop bag. Two
 * routes, indexed once per program: an exported, top-level `{Name}Props`
 * declaration, or the signatures of an exported `{Name}` value (the checker
 * resolves `export {X as Y}` aliases). Candidates rank by proximity — in or
 * under the doc's own directory first, then the shallower path, then a
 * declaration over a signature, then path order — so the file beside the
 * doc wins, a nested internal copy does not shadow it, a file-private
 * lookalike never counts, and the verdict does not depend on directory
 * read order. The first candidate that yields a bag is the contract.
 *
 * @param {import('typescript').Program} program
 * @param {import('typescript').TypeChecker} checker
 * @returns {(name: string, preferDir: string) => {props: Set<string>, route: 'declaration' | 'signature', file: string} | null}
 */
export function createResolver(program, checker) {
  const declarations = new Map();
  const values = new Map();
  const add = (index, name, entry) => {
    if (!index.has(name)) index.set(name, []);
    index.get(name).push(entry);
  };
  for (const sourceFile of program.getSourceFiles()) {
    if (sourceFile.isDeclarationFile) continue;
    if (sourceFile.fileName.includes('/node_modules/')) continue;
    const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!moduleSymbol) continue;
    const exported = new Map(
      checker
        .getExportsOfModule(moduleSymbol)
        .map(symbol => [symbol.getName(), symbol]),
    );
    for (const statement of sourceFile.statements) {
      if (
        !ts.isInterfaceDeclaration(statement) &&
        !ts.isTypeAliasDeclaration(statement)
      ) {
        continue;
      }
      // The export carrying this name must be THIS declaration — a file that
      // `export *`s a module with the same name still keeps its own private
      // lookalike private.
      const exportedSymbol = exported.get(statement.name.text);
      if (!exportedSymbol) continue;
      const owner =
        exportedSymbol.flags & ts.SymbolFlags.Alias
          ? checker.getAliasedSymbol(exportedSymbol)
          : exportedSymbol;
      if (!(owner.getDeclarations() ?? []).includes(statement)) continue;
      add(declarations, statement.name.text, {
        file: sourceFile.fileName,
        node: statement,
      });
    }
    for (const [name, symbol] of exported) {
      add(values, name, {file: sourceFile.fileName, symbol});
    }
  }

  return function resolve(name, preferDir) {
    const prefix = toTsPath(preferDir).replace(/\/?$/, '/');
    const candidates = [
      ...(declarations.get(`${name}Props`) ?? []).map(entry => ({
        ...entry,
        route: 'declaration',
      })),
      ...(values.get(name) ?? []).map(entry => ({
        ...entry,
        route: 'signature',
      })),
    ].sort(
      (a, b) =>
        Number(b.file.startsWith(prefix)) - Number(a.file.startsWith(prefix)) ||
        depth(a.file) - depth(b.file) ||
        Number(a.route === 'signature') - Number(b.route === 'signature') ||
        a.file.localeCompare(b.file),
    );
    for (const candidate of candidates) {
      const props =
        candidate.route === 'declaration'
          ? propsFromDeclaration(checker, candidate.node)
          : propsFromSignature(checker, candidate.symbol);
      if (props === UNDERIVABLE) return null;
      if (props) return {props, route: candidate.route, file: candidate.file};
    }
    return null;
  };
}

/** Bare specifiers the platform filter cannot do without. */
const REQUIRED_MODULES = ['react'];

/**
 * Which of `specifiers` some source file imports but the program could not
 * resolve. Every passthrough verdict rests on `@types/react` being in the
 * program: without it the `Omit<HTMLAttributes…>` base of BaseProps degrades
 * to a string index signature, every `Omit<{Name}Props, …>` over it collapses
 * to zero named props, and the tree passes unchecked. A tree that never
 * imports the module is not asked for it.
 *
 * @param {import('typescript').Program} program
 * @param {string} srcDir
 * @param {string[]} specifiers
 * @returns {string[]} one message per unresolvable import
 */
function unresolvableImports(program, srcDir, specifiers) {
  const options = program.getCompilerOptions();
  const problems = [];
  for (const specifier of specifiers) {
    const importer = program
      .getSourceFiles()
      .find(
        sourceFile =>
          !sourceFile.isDeclarationFile &&
          sourceFile.statements.some(
            statement =>
              ts.isImportDeclaration(statement) &&
              ts.isStringLiteral(statement.moduleSpecifier) &&
              statement.moduleSpecifier.text === specifier,
          ),
      );
    if (!importer) continue;
    const {resolvedModule} = ts.resolveModuleName(
      specifier,
      importer.fileName,
      options,
      ts.sys,
    );
    const importedBy = path.relative(srcDir, importer.fileName);
    if (!resolvedModule) {
      problems.push(
        `'${specifier}' (imported by ${importedBy}) could not be resolved`,
      );
    } else if (!/\.[cm]?tsx?$/.test(resolvedModule.resolvedFileName)) {
      // `react` installed but `@types/react` absent: the checker sees JS and
      // every React type is `any` — the same collapse as no react at all.
      problems.push(
        `'${specifier}' (imported by ${importedBy}) could not be resolved to types; found untyped ${path.relative(srcDir, resolvedModule.resolvedFileName)}`,
      );
    }
  }
  return problems;
}

/**
 * Why `docs` cannot be checked, or `null` when its shape is usable. A doc
 * that throws mid-scan would abort the run with a stack and hide every doc
 * after it; a shape problem is reported like any other unreadable doc.
 *
 * @param {unknown} docs
 * @returns {string | null}
 */
function docShapeProblem(docs) {
  const isObject = value => typeof value === 'object' && value !== null;
  const nonObject = list => list?.some(item => !isObject(item));
  if (!isObject(docs)) return '`docs` is not an object';
  if (docs.name !== undefined && typeof docs.name !== 'string') {
    return '`name` is not a string';
  }
  if (docs.props !== undefined && !Array.isArray(docs.props)) {
    return '`props` is not an array';
  }
  if (nonObject(docs.props)) return '`props[]` holds a non-object entry';
  if (docs.components !== undefined && !Array.isArray(docs.components)) {
    return '`components` is not an array';
  }
  for (const entry of docs.components ?? []) {
    if (!isObject(entry)) return '`components[]` holds a non-object entry';
    if (entry.name !== undefined && typeof entry.name !== 'string') {
      return '`components[].name` is not a string';
    }
    if (entry.props !== undefined && !Array.isArray(entry.props)) {
      return '`components[].props` is not an array';
    }
    if (nonObject(entry.props)) {
      return '`components[].props[]` holds a non-object entry';
    }
  }
  return null;
}

/**
 * Entries this doc file is the source of truth for: the top-level component
 * when it has `props[]`, plus any inline `components[]` entry that carries
 * its own `props[]`.
 *
 * @param {{name?: string, props?: {name: string}[], components?: {name?: string, props?: {name: string}[]}[]}} docs
 * @returns {{name: string, documented: string[]}[]}
 */
function contractEntries(docs) {
  const entries = [];
  if (Array.isArray(docs.props) && docs.name) {
    entries.push({
      name: docs.name,
      documented: docs.props.map(prop => prop.name).filter(Boolean),
    });
  }
  for (const entry of docs.components ?? []) {
    if (Array.isArray(entry.props) && entry.name) {
      entries.push({
        name: entry.name,
        documented: entry.props.map(prop => prop.name).filter(Boolean),
      });
    }
  }
  return entries;
}

/**
 * Compare every `{Name}.doc.mjs` under `srcDir` to the prop bag source
 * declares for it — see `createResolver` for which bag wins. An entry no
 * route resolves is `unresolved`, which fails the run.
 *
 * @param {string} srcDir
 * @returns {Promise<{missing: {component: string, prop: string, file: string}[], unresolved: {component: string, file: string}[], unreadable: {file: string, reason: string}[], unresolvable: string[], docCount: number}>}
 */
export async function checkContract(srcDir) {
  const sourceFiles = walkSource(srcDir);
  const {program, checker} = buildProgram(sourceFiles);
  const unresolvable = unresolvableImports(program, srcDir, REQUIRED_MODULES);
  const resolve = createResolver(program, checker);
  const missing = [];
  const unresolved = [];
  const unreadable = [];
  const docFiles = walkDocs(srcDir);

  for (const docFile of docFiles) {
    let mod;
    try {
      mod = await import(pathToFileURL(docFile).href);
    } catch (err) {
      unreadable.push({
        file: docFile,
        reason: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
    // What `astryx component <Name>` serves: `loadDocs` reads `mod.docs`.
    const docs = mod.docs ?? mod.default;
    if (!docs) {
      unreadable.push({
        file: docFile,
        reason: 'exports neither `docs` nor a default export',
      });
      continue;
    }
    const shapeProblem = docShapeProblem(docs);
    if (shapeProblem) {
      unreadable.push({file: docFile, reason: shapeProblem});
      continue;
    }
    if (!docs.name && Array.isArray(docs.props)) {
      unreadable.push({
        file: docFile,
        reason:
          'publishes props[] but has no `name`, so nothing can be checked against it',
      });
      continue;
    }
    // Hooks document params/returns, not props.
    if (docs.name?.startsWith('use') && !Array.isArray(docs.props)) continue;

    const entries = contractEntries(docs);
    if (entries.length === 0) continue;

    const preferDir = path.dirname(docFile);
    for (const {name, documented} of entries) {
      const resolved = resolve(name, preferDir);
      if (!resolved) {
        unresolved.push({component: name, file: docFile});
        continue;
      }
      for (const prop of findUndocumented(resolved.props, documented)) {
        missing.push({component: name, prop, file: docFile});
      }
    }
  }

  missing.sort(
    (a, b) =>
      a.component.localeCompare(b.component) || a.prop.localeCompare(b.prop),
  );
  unresolved.sort(
    (a, b) =>
      a.component.localeCompare(b.component) || a.file.localeCompare(b.file),
  );
  unreadable.sort((a, b) => a.file.localeCompare(b.file));
  return {
    missing,
    unresolved,
    unreadable,
    unresolvable,
    docCount: docFiles.length,
  };
}

/**
 * Scan `srcDir`, print the report through `io`, return the exit code. The
 * CLI entry below passes `console`; tests pass a capturing `io` instead of
 * spawning a process.
 *
 * @param {string} [srcDir]
 * @param {{log?: (line: string) => void, error?: (line: string) => void}} [io]
 * @returns {Promise<0 | 1>}
 */
export async function run(
  srcDir = CORE_SRC,
  {log = console.log, error = console.error} = {},
) {
  const {missing, unresolved, unreadable, unresolvable, docCount} =
    await checkContract(srcDir);

  if (docCount === 0) {
    error(
      `\n✗ check:contract found no .doc.mjs under ${path.relative(ROOT, srcDir) || '.'} — nothing was checked, so this is not a pass.\n`,
    );
    return 1;
  }

  if (unresolvable.length > 0) {
    error('\n✗ check:contract cannot trust this program:\n');
    for (const problem of unresolvable) error(`  ${problem}`);
    error(
      '\n    → Every platform-passthrough verdict depends on those types. Install dependencies (pnpm install) and rerun; an unchecked tree is not a pass.\n',
    );
    return 1;
  }

  if (unreadable.length > 0 || unresolved.length > 0 || missing.length > 0) {
    if (unreadable.length > 0) {
      error(
        `\n✗ check:contract could not load ${unreadable.length} doc file(s):\n`,
      );
      for (const {file, reason} of unreadable) {
        error(`  ${path.relative(ROOT, file)}`);
        error(`    ${reason}`);
      }
      error(
        '\n    → Fix the syntax, import, `docs` export, shape, or missing `name` of that .doc.mjs. A broken doc is not skipped.\n',
      );
    }
    if (unresolved.length > 0) {
      error(
        `\n✗ check:contract could not resolve the public props of ${unresolved.length} documented entr${unresolved.length === 1 ? 'y' : 'ies'}:\n`,
      );
      for (const {component, file} of unresolved) {
        error(`  ${component}  (${path.relative(ROOT, file)})`);
      }
      error(
        '\n    → The doc claims a props[] contract, but source offers nothing to check it against: no exported {Name}Props type, and no exported {Name} whose parameters are typed. Export the component or its Props type, type the bag (not any / unknown), or drop props[] from the doc. An unchecked entry is not a pass.\n',
      );
    }
    if (missing.length > 0) {
      error(
        `\n✗ check:contract found ${missing.length} undocumented public prop(s):\n`,
      );
      for (const {component, prop, file} of missing) {
        const rel = path.relative(ROOT, file);
        error(`  ${component}.${prop}  (${rel})`);
      }
      error(
        "\n    → Document the prop in that component's .doc.mjs `props[]`, or it is not part of the public contract.\n",
      );
    }
    return 1;
  }

  log(
    `✓ check:contract — ${docCount} doc(s) checked, 0 undocumented public props`,
  );
  return 0;
}

/**
 * True when this file is the script node was asked to run. Both sides are
 * real paths: node resolves symlinks for `import.meta.url`, argv[1] keeps
 * whatever was typed, and a mismatch would silently run nothing.
 */
function isCliEntry() {
  try {
    return (
      process.argv[1] !== undefined &&
      fs.realpathSync(process.argv[1]) === fileURLToPath(import.meta.url)
    );
  } catch {
    return false;
  }
}

if (isCliEntry()) {
  run().then(
    code => {
      process.exitCode = code;
    },
    err => {
      console.error(err);
      process.exitCode = 2;
    },
  );
}
