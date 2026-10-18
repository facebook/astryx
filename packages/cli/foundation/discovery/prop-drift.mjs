// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compare the props a component doc documents with the props its
 * TypeScript source declares.
 *
 * The compiler is the project's own `typescript`, resolved from the
 * directories the caller names. Without it the comparison is skipped and the
 * report says why: it never passes silently. Every finding is a warning.
 *
 * For each documented prop table (a component doc's `props`, or a
 * multi-component doc's entry), against the props type of the export it
 * documents:
 * - `not_in_code`: a documented prop the props type does not have (a
 *   `data-*`-style name an index signature accepts counts as present);
 * - `not_in_doc`: a prop declared in the package's own source that the table
 *   does not list. Props declared outside the package (React, the DOM,
 *   another package) are never required, and neither are `className`,
 *   `style`, `xstyle`, `data-testid`, `ref`, `key`, or a prop whose
 *   declaration carries a `deprecated` or `internal` JSDoc tag;
 * - `required_mismatch`: `required` disagrees with whether the prop is
 *   required in every member of the props type (a prop required in only
 *   some members of a union is not compared).
 * Hook entries (`use…`) document parameters and returns, not props, and are
 * not compared.
 *
 * @input Component records (name, docPath, sourcePath), the package root, and
 *   the directories to resolve `typescript` from.
 * @output A PropDriftReport.
 * @position Shared by `astryx doctor integration components` and the Astryx
 *   repository's test over Core's own component docs.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {loadComponentDoc} from './component-loader.mjs';
import {resolveProjectTypeScript} from './project-typescript.mjs';

/**
 * @typedef {'not_in_code' | 'not_in_doc' | 'required_mismatch'} PropDriftKind
 */

/**
 * @typedef {object} PropDriftFinding
 * @property {string} component the documented component (export) name
 * @property {string} prop
 * @property {PropDriftKind} kind
 * @property {'warning'} severity
 * @property {string} message
 * @property {string} doc the doc file, relative to the package root
 * @property {string} source the source file, relative to the package root
 * @property {string} [docType] the documented type, as written
 * @property {string} [codeType] the type as the source declares it
 * @property {boolean} [docRequired]
 * @property {boolean} [codeRequired]
 */

/**
 * @typedef {object} PropDriftUnchecked
 * @property {string} component
 * @property {string} doc the doc file, relative to the package root
 * @property {string} reason why its props could not be read
 */

/**
 * @typedef {object} PropDriftReport
 * @property {'checked' | 'skipped'} status `skipped` means nothing was
 *   compared, and `reason` says why
 * @property {string} [reason]
 * @property {string} [typescript] the version of the compiler that read the props
 * @property {number} components how many documented prop tables were compared
 * @property {PropDriftFinding[]} findings
 * @property {PropDriftUnchecked[]} unchecked documented components whose props
 *   could not be read from the source
 */

/**
 * @typedef {object} PropDriftComponent
 * @property {string} name
 * @property {string} docPath absolute path to the component's `.doc.*` file
 * @property {string} sourcePath absolute path to its same-stem source
 */

/** Props a doc never needs to list (the authoring guidance skips them). */
export const PROPS_NOT_DOCUMENTED = Object.freeze([
  'className',
  'style',
  'xstyle',
  'data-testid',
  'ref',
  'key',
]);

const SKIP_TAGS = new Set(['deprecated', 'internal']);
const HOOK_NAME = /^use[A-Z0-9]/;

/** The line both surfaces print when the compiler is missing. */
export const TYPESCRIPT_MISSING_REASON =
  'TypeScript is not installed in this project, so documented props were not compared with the code. Install typescript and run this check again.';

/**
 * Compiler options for reading one package: its nearest tsconfig.json when it
 * parses, else defaults that read TSX the way bundlers do.
 * @param {any} ts
 * @param {string} packageDir
 */
function compilerOptionsFor(ts, packageDir) {
  const defaults = {
    jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    allowJs: true,
    esModuleInterop: true,
    resolveJsonModule: true,
    allowImportingTsExtensions: true,
  };
  /** @type {Record<string, unknown>} */
  let options = defaults;
  try {
    const configPath = ts.findConfigFile(
      packageDir,
      ts.sys.fileExists,
      'tsconfig.json',
    );
    if (configPath) {
      const read = ts.readConfigFile(configPath, ts.sys.readFile);
      if (!read.error) {
        const parsed = ts.parseJsonConfigFileContent(
          read.config,
          ts.sys,
          path.dirname(configPath),
          undefined,
          configPath,
        );
        options = {...parsed.options};
        if (options.jsx == null) options.jsx = defaults.jsx;
      }
    }
  } catch {
    options = defaults;
  }
  return {
    ...options,
    noEmit: true,
    skipLibCheck: true,
    incremental: false,
    composite: false,
  };
}

/**
 * @template T
 * @param {() => T} compute
 * @returns {() => T}
 */
function memo(compute) {
  /** @type {{value: T} | null} */
  let cached = null;
  return () => {
    if (cached == null) cached = {value: compute()};
    return cached.value;
  };
}

/**
 * A memoized "is this file part of the package's own source?" test.
 * @param {string} root realpath of the package root
 */
function ownFileTest(root) {
  /** @type {Map<string, boolean>} */
  const cache = new Map();
  return (/** @type {string} */ file) => {
    let own = cache.get(file);
    if (own !== undefined) return own;
    let real = file;
    try {
      real = fs.realpathSync(file);
    } catch {
      // A lib or virtual file: compare as given.
    }
    const rel = path.relative(root, real);
    own =
      rel !== '' &&
      !rel.startsWith('..') &&
      !path.isAbsolute(rel) &&
      !rel.split(path.sep).includes('node_modules');
    cache.set(file, own);
    return own;
  };
}

/**
 * @typedef {object} CodeProp
 * @property {string} name
 * @property {boolean | null} required null when union members disagree
 * @property {boolean} own declared in the package's own source
 * @property {boolean} skipTagged its declaration carries a deprecated or internal JSDoc tag
 * @property {string[]} declared the type as written, per own declaration
 * @property {() => string[]} renderings the compiler's renderings, computed on demand
 * @property {() => any[]} types the prop's type in each member of the props type
 */

/**
 * Read the props of one export.
 * @param {any} ts
 * @param {any} program
 * @param {any} checker
 * @param {string} sourcePath
 * @param {string} exportName
 * @param {(file: string) => boolean} isOwnFile
 * @returns {{ok: true, props: Map<string, CodeProp>, accepts: (name: string) => boolean} | {ok: false, reason: string}}
 */
function readCodeProps(
  ts,
  program,
  checker,
  sourcePath,
  exportName,
  isOwnFile,
) {
  const sourceFile = program.getSourceFile(sourcePath);
  const sourceName = path.basename(sourcePath);
  if (!sourceFile) {
    return {ok: false, reason: `the compiler could not read ${sourceName}`};
  }
  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  const exports = moduleSymbol ? checker.getExportsOfModule(moduleSymbol) : [];
  const stem = sourceName.replace(/\.[cm]?[jt]sx?$/, '');
  let symbol =
    exports.find(/** @param {any} s */ s => s.name === exportName) ??
    (stem === exportName
      ? exports.find(/** @param {any} s */ s => s.name === 'default')
      : undefined);
  if (!symbol) {
    return {
      ok: false,
      reason: `${sourceName} has no export named ${exportName}`,
    };
  }
  if (symbol.flags & ts.SymbolFlags.Alias) {
    symbol = checker.getAliasedSymbol(symbol);
  }
  const type = checker.getTypeOfSymbolAtLocation(symbol, sourceFile);
  const signatures = [
    ...type.getCallSignatures(),
    ...type.getConstructSignatures(),
  ];
  if (signatures.length === 0) {
    return {
      ok: false,
      reason: `${exportName} in ${sourceName} is not a component (it cannot be called with props)`,
    };
  }
  // Every overload: its props type joins the others as a member, as a
  // union's members do. An overload that takes no props makes every prop
  // optional.
  /** @type {any[]} */
  const propsTypes = [];
  let propless = false;
  for (const signature of signatures) {
    const parameter = signature.getParameters()[0];
    if (parameter) {
      propsTypes.push(checker.getTypeOfSymbolAtLocation(parameter, sourceFile));
    } else {
      propless = true;
    }
  }
  /** @type {Map<string, CodeProp>} */
  const props = new Map();
  if (propsTypes.length === 0) return {ok: true, props, accepts: () => false};

  if (
    propsTypes.some(propsType =>
      hasUnresolvedPart(ts, checker, propsType, 0, new Set()),
    )
  ) {
    return {
      ok: false,
      reason: `${exportName}'s props type includes a type the compiler could not resolve, usually an import whose package is not installed. Install the package's dependencies and run this check again`,
    };
  }
  const members = propsTypes
    .flatMap(propsType => (propsType.isUnion() ? propsType.types : [propsType]))
    .filter(
      /** @param {any} t */
      t => !(t.flags & (ts.TypeFlags.Undefined | ts.TypeFlags.Null)),
    );
  // Each member of a prop's type is printed on its own, and long prints are
  // truncated: a type that expands to a huge structure (StyleX styles, say)
  // never matches a documented type anyway, and printing it whole can take
  // gigabytes.
  const flags =
    ts.TypeFormatFlags.UseSingleQuotesForStringLiteralType |
    ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope;

  /** @type {Map<string, {symbols: any[], optional: number}>} */
  const byName = new Map();
  for (const member of members) {
    for (const prop of checker.getPropertiesOfType(member)) {
      const entry = byName.get(prop.name) ?? {symbols: [], optional: 0};
      entry.symbols.push(prop);
      if (prop.flags & ts.SymbolFlags.Optional) entry.optional++;
      byName.set(prop.name, entry);
    }
  }

  for (const [name, {symbols, optional}] of byName) {
    const ownDeclarations = symbols
      .flatMap(/** @param {any} s */ s => s.declarations ?? [])
      .filter(/** @param {any} d */ d => isOwnFile(d.getSourceFile().fileName));
    const required =
      !propless && symbols.length === members.length && optional === 0
        ? true
        : optional === symbols.length
          ? false
          : null;
    props.set(name, {
      name,
      required,
      own: ownDeclarations.length > 0,
      skipTagged: ownDeclarations.some(
        /** @param {any} d */
        d =>
          ts
            .getJSDocTags(d)
            .some(
              /** @param {any} tag */ tag => SKIP_TAGS.has(tag.tagName.text),
            ),
      ),
      // A property's `type` is the prop's type; a method's is its return
      // type, so a method prop reads as the compiler renders it.
      declared: ownDeclarations
        .filter(
          /** @param {any} d */ d =>
            d.type && !ts.isMethodSignature(d) && !ts.isMethodDeclaration(d),
        )
        .map(/** @param {any} d */ d => d.type.getText(d.getSourceFile())),
      types: memo(() =>
        symbols.map(
          /** @param {any} s */ s =>
            checker.getTypeOfSymbolAtLocation(s, sourceFile),
        ),
      ),
      renderings: memo(() => {
        /** @type {string[]} */
        const printed = [];
        for (const s of symbols) {
          const propType = checker.getTypeOfSymbolAtLocation(s, sourceFile);
          for (const part of propType.isUnion() ? propType.types : [propType]) {
            printed.push(checker.typeToString(part, sourceFile, flags));
          }
        }
        return printed;
      }),
    });
  }

  /** Does an index signature of the props type accept this name? */
  const accepts = (/** @type {string} */ name) =>
    members.some(
      /** @param {any} member */ member =>
        (checker.getIndexInfosOfType?.(member) ?? []).some(
          /** @param {any} info */ info => {
            const key = info.keyType;
            if (key.flags & ts.TypeFlags.String) return true;
            if (key.flags & ts.TypeFlags.TemplateLiteral) {
              const texts = key.texts ?? [];
              return (
                name.startsWith(texts[0] ?? '') &&
                name.endsWith(texts[texts.length - 1] ?? '')
              );
            }
            return false;
          },
        ),
    );
  return {ok: true, props, accepts};
}

/**
 * The prop's type for a message: as the source writes it, or, for a prop the
 * source declares as a method or accessor, as the compiler prints it, without
 * the `undefined` an optional prop adds.
 * @param {CodeProp} code
 */
function codeTypeText(code) {
  const text =
    code.declared[0] ??
    [
      ...new Set(
        code
          .renderings()
          .filter(part => !(code.required !== true && part === 'undefined')),
      ),
    ].join(' | ');
  return text.replace(/\s+/g, ' ').trim();
}

/**
 * How many props one doc entry names (`a / b` names two).
 * @param {any} raw
 * @returns {number}
 */
function names(raw) {
  return String(raw.name)
    .split(/\s+\/\s+/)
    .filter(Boolean).length;
}

/**
 * The props one doc entry names. `a / b` documents each of `a` and `b` (with
 * the type split the same way when it splits into as many parts); `x.y` (or
 * `x[].y`) documents a field of prop `x`; `...rest` documents a spread of
 * another props type and is not compared.
 * @param {any} raw
 * @returns {Array<{name: string, written: string, path: string[], spread: boolean, type?: string, required?: boolean}>}
 */
function documentedProps(raw) {
  const names = String(raw.name)
    .split(/\s+\/\s+/)
    .map(name => name.trim())
    .filter(Boolean);
  const types = typeof raw.type === 'string' ? raw.type.split(/\s+\/\s+/) : [];
  return names.map((written, i) => {
    const spread = written.startsWith('...');
    const [root = written, ...path] = written
      .replace(/\[\]/g, '')
      .split('.')
      .filter(Boolean);
    return {
      name: spread ? written : root,
      written,
      path: spread ? [] : path,
      spread,
      type:
        names.length === 1
          ? raw.type
          : types.length === names.length
            ? types[i]
            : undefined,
      required: names.length === 1 ? raw.required : undefined,
    };
  });
}

/**
 * Does a field path exist in a prop's type (through arrays, and in at least
 * one member of a union)?
 * @param {any} ts
 * @param {any} checker
 * @param {CodeProp} code
 * @param {string[]} fieldPath
 */
function fieldExists(ts, checker, code, fieldPath) {
  /** @type {any[]} */
  let current = code.types();
  for (const field of fieldPath) {
    /** @type {any[]} */
    const next = [];
    for (const type of current) {
      for (const member of type.isUnion() ? type.types : [type]) {
        if (member.flags & (ts.TypeFlags.Any | ts.TypeFlags.Unknown))
          return true;
        const element =
          member.symbol?.name === 'Array' ||
          member.symbol?.name === 'ReadonlyArray'
            ? checker.getTypeArguments(member)[0]
            : member;
        const prop = element && checker.getPropertyOfType(element, field);
        if (prop) next.push(checker.getTypeOfSymbol(prop));
      }
    }
    if (next.length === 0) return false;
    current = next;
  }
  return true;
}

/**
 * Is a type the compiler's stand-in for a name it could not resolve?
 * @param {any} ts
 * @param {any} type
 */
function isErrorType(ts, type) {
  return (
    (type.flags & ts.TypeFlags.Any) !== 0 && type.intrinsicName === 'error'
  );
}

/**
 * Is any part of a props type `any`, or built from a type the compiler could
 * not resolve (`Omit<Missing, 'x'>`, `Partial<Missing>`)? Then props it would
 * inherit are missing or unknown, and comparing would report documented
 * props as absent, or pass them unread.
 * @param {any} ts
 * @param {any} checker
 * @param {any} type
 * @param {number} depth
 * @param {Set<any>} seen types already read, so shared bases are read once
 * @returns {boolean}
 */
function hasUnresolvedPart(ts, checker, type, depth, seen) {
  if (depth > 24 || seen.has(type)) return false;
  seen.add(type);
  if (type.flags & ts.TypeFlags.Any) return true;
  // A type made from another keeps what it was made from: an alias its
  // arguments, a generic reference its type arguments.
  const made = [
    ...(type.aliasTypeArguments ?? []),
    ...(type.objectFlags & ts.ObjectFlags.Reference
      ? checker.getTypeArguments(type)
      : []),
  ];
  if (made.some(/** @param {any} t */ t => isErrorType(ts, t))) return true;
  // A type mapped over one that does not resolve (`Omit<Missing, 'x'>`,
  // `Partial<Missing>`), reached directly, through a named alias, or nested,
  // reads as index signatures whose value is that unresolved type.
  if (
    type.flags & ts.TypeFlags.Object &&
    (checker.getIndexInfosOfType?.(type) ?? []).some(
      /** @param {any} info */ info => isErrorType(ts, info.type),
    )
  ) {
    return true;
  }
  if (type.isUnion() || type.isIntersection()) {
    return type.types.some(
      /** @param {any} t */ t =>
        hasUnresolvedPart(ts, checker, t, depth + 1, seen),
    );
  }
  if (type.flags & ts.TypeFlags.Object) {
    const target =
      type.objectFlags & ts.ObjectFlags.Reference ? type.target : type;
    if (target.objectFlags & ts.ObjectFlags.ClassOrInterface) {
      // An unresolved `extends` is dropped from the base types, so read the
      // heritage clauses themselves.
      for (const declaration of target.symbol?.declarations ?? []) {
        for (const clause of declaration.heritageClauses ?? []) {
          for (const node of clause.types) {
            const base = checker.getTypeAtLocation(node);
            if (hasUnresolvedPart(ts, checker, base, depth + 1, seen))
              return true;
          }
        }
      }
    }
  }
  return false;
}

/**
 * The prop tables one doc file documents, each with the export it describes.
 * A multi-component doc names each entry's export; an entry without `props`
 * (a reference to a sibling doc) and a hook entry are not prop tables.
 * @param {any} doc
 * @param {PropDriftComponent} component
 * @returns {Array<{name: string, props: any[]}>}
 */
function propTables(doc, component) {
  if (!doc || typeof doc !== 'object') return [];
  /** @type {Array<{name: string, props: any[]}>} */
  const tables = [];
  // A doc's own props document the export its `name` names, which can be
  // another file's export than the one its file is named after.
  const own = ownName(doc, component);
  if (Array.isArray(doc.props) && !HOOK_NAME.test(own)) {
    tables.push({name: own, props: doc.props});
  }
  if (Array.isArray(doc.components)) {
    for (const entry of doc.components) {
      if (
        entry &&
        typeof entry.name === 'string' &&
        Array.isArray(entry.props) &&
        !(Array.isArray(doc.props) && entry.name === own) &&
        !HOOK_NAME.test(entry.name)
      ) {
        tables.push({name: entry.name, props: entry.props});
      }
    }
  }
  return tables;
}

/**
 * The export a doc's own props document: its `name`, else its record's.
 * @param {any} doc
 * @param {PropDriftComponent} component
 */
function ownName(doc, component) {
  return typeof doc.name === 'string' && doc.name !== ''
    ? doc.name
    : component.name;
}

/**
 * The stem of a `<stem>.doc.{ts,mjs,js}` file: the name of the record that
 * owns the doc.
 * @param {string} docPath
 */
function docStem(docPath) {
  return path.basename(docPath).replace(/\.doc\.(ts|mjs|js)$/, '');
}

/**
 * Where an entry's export lives: `<entry>.tsx` beside the doc, else the doc's
 * own same-stem source, else the directory's `index.ts`/`index.tsx`.
 * @param {string} name
 * @param {PropDriftComponent} component
 * @returns {string[]} candidates, in order
 */
function sourcesForEntry(name, component) {
  if (name === component.name) return [component.sourcePath];
  const dir = path.dirname(component.docPath);
  return [
    path.join(dir, `${name}.tsx`),
    component.sourcePath,
    path.join(dir, 'index.ts'),
    path.join(dir, 'index.tsx'),
  ].filter((file, i, all) => all.indexOf(file) === i && fs.existsSync(file));
}

/**
 * Compare documented props with each component's TypeScript props.
 * @param {PropDriftComponent[]} components
 * @param {{packageDir: string, resolveFrom: Array<string | null | undefined>, loadDoc?: (docPath: string) => Promise<any>}} options
 * @returns {Promise<PropDriftReport>}
 */
export async function comparePropDocs(components, options) {
  const {packageDir, resolveFrom, loadDoc = loadComponentDoc} = options;
  const compiler = resolveProjectTypeScript(resolveFrom);
  if (!compiler) {
    return {
      status: 'skipped',
      reason: TYPESCRIPT_MISSING_REASON,
      components: 0,
      findings: [],
      unchecked: [],
    };
  }
  const {ts, version} = compiler;
  let root = path.resolve(packageDir);
  try {
    root = fs.realpathSync(root);
  } catch {
    // Keep the resolved path.
  }
  const rel = (/** @type {string} */ file) =>
    path.relative(packageDir, file).split(path.sep).join('/');

  /** @type {Array<{doc: string, name: string, props: any[], sources: string[]}>} */
  const tables = [];
  /** @type {PropDriftUnchecked[]} */
  const unchecked = [];
  const seen = new Set();
  // A family doc can stand behind several records: its own, named after the
  // doc, and one per member entry that discovery records as a component of
  // its own. A member record compares only its own entry, against its own
  // source; the family record leaves those entries to the members.
  /** @type {Map<string, Set<string>>} */
  const namesByDoc = new Map();
  for (const component of components) {
    const names = namesByDoc.get(component.docPath) ?? new Set();
    names.add(component.name);
    namesByDoc.set(component.docPath, names);
  }
  /** @type {Map<string, Promise<any>>} */
  const docs = new Map();
  for (const component of components) {
    let doc;
    try {
      let loading = docs.get(component.docPath);
      if (!loading) {
        loading = Promise.resolve(loadDoc(component.docPath));
        docs.set(component.docPath, loading);
      }
      doc = await loading;
    } catch (err) {
      unchecked.push({
        component: component.name,
        doc: rel(component.docPath),
        reason: `its doc does not load: ${err instanceof Error ? err.message : String(err)}`,
      });
      continue;
    }
    if (component.name !== docStem(component.docPath)) {
      // A record named after the export its doc's `name` names compares the
      // doc's own props; a family member, its own entry.
      const entry =
        doc &&
        ownName(doc, component) === component.name &&
        Array.isArray(doc.props)
          ? doc
          : Array.isArray(doc?.components)
            ? doc.components.find(
                (/** @type {any} */ candidate) =>
                  candidate?.name === component.name &&
                  Array.isArray(candidate.props),
              )
            : undefined;
      if (!entry || HOOK_NAME.test(component.name)) continue;
      const key = `${component.docPath}\0${component.sourcePath}\0${component.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tables.push({
        doc: rel(component.docPath),
        name: component.name,
        props: entry.props,
        sources: [component.sourcePath],
      });
      continue;
    }
    const members = namesByDoc.get(component.docPath) ?? new Set();
    for (const table of propTables(doc, component)) {
      if (table.name !== component.name && members.has(table.name)) continue;
      const sources = sourcesForEntry(table.name, component);
      // One table per doc: two docs that each document a component both
      // get compared.
      const key = `${component.docPath}\0${sources[0]}\0${table.name}`;
      if (seen.has(key)) continue;
      seen.add(key);
      tables.push({doc: rel(component.docPath), ...table, sources});
    }
  }
  if (tables.length === 0) {
    return {
      status: 'checked',
      typescript: version,
      components: 0,
      findings: [],
      unchecked,
    };
  }

  const program = ts.createProgram({
    rootNames: [...new Set(tables.flatMap(table => table.sources))],
    options: compilerOptionsFor(ts, packageDir),
  });
  const checker = program.getTypeChecker();
  const isOwnFile = ownFileTest(root);

  /** @type {PropDriftFinding[]} */
  const findings = [];
  let compared = 0;
  for (const table of tables) {
    /** @type {ReturnType<typeof readCodeProps> | null} */
    let read = null;
    let sourcePath = table.sources[0];
    for (const candidate of table.sources) {
      const attempt = readCodeProps(
        ts,
        program,
        checker,
        candidate,
        table.name,
        isOwnFile,
      );
      if (attempt.ok || read == null) {
        read = attempt;
        sourcePath = candidate;
      }
      if (attempt.ok) break;
    }
    if (read == null || !read.ok) {
      unchecked.push({
        component: table.name,
        doc: table.doc,
        reason:
          read != null && !read.ok
            ? read.reason
            : `no source file for ${table.name}`,
      });
      continue;
    }
    compared++;
    const source = rel(sourcePath);
    const documented = new Set();
    for (const raw of table.props) {
      if (!raw || typeof raw.name !== 'string') continue;
      for (const entry of documentedProps(raw)) {
        const propName = entry.name;
        if (entry.spread) continue;
        if (entry.path.length > 0) {
          documented.add(propName);
          const code = read.props.get(propName);
          if (code && fieldExists(ts, checker, code, entry.path)) continue;
          if (!code && read.accepts(propName)) continue;
          findings.push({
            component: table.name,
            prop: entry.written,
            kind: 'not_in_code',
            severity: 'warning',
            message: code
              ? `"${entry.written}" is documented, but ${table.name}'s "${propName}" has no "${entry.path.join('.')}".`
              : `"${entry.written}" is documented, but ${table.name}'s props have no "${propName}".`,
            doc: table.doc,
            source,
          });
          continue;
        }
        documented.add(propName);
        const code = read.props.get(propName);
        const base = {
          component: table.name,
          prop: propName,
          severity: /** @type {const} */ ('warning'),
          doc: table.doc,
          source,
        };
        if (!code) {
          if (read.accepts(propName)) continue;
          findings.push({
            ...base,
            kind: 'not_in_code',
            message: `"${propName}" is documented, but ${table.name}'s props have no "${propName}".`,
            ...(typeof entry.type === 'string' ? {docType: entry.type} : {}),
          });
          continue;
        }
        const docRequired = entry.required === true;
        if (
          code.required != null &&
          names(raw) === 1 &&
          docRequired !== code.required
        ) {
          findings.push({
            ...base,
            kind: 'required_mismatch',
            message: code.required
              ? `"${propName}" is required in the code, but the doc does not mark it required.`
              : `"${propName}" is documented as required, but it is optional in the code.`,
            docRequired,
            codeRequired: code.required,
          });
        }
      }
    }
    for (const code of read.props.values()) {
      if (
        documented.has(code.name) ||
        !code.own ||
        code.skipTagged ||
        PROPS_NOT_DOCUMENTED.includes(code.name)
      ) {
        continue;
      }
      const codeType = codeTypeText(code);
      findings.push({
        component: table.name,
        prop: code.name,
        kind: 'not_in_doc',
        severity: 'warning',
        message: `${table.name} declares "${code.name}", but the doc does not list it.`,
        doc: table.doc,
        source,
        codeType,
        ...(code.required != null ? {codeRequired: code.required} : {}),
      });
    }
  }

  findings.sort((a, b) =>
    `${a.component}\0${a.prop}\0${a.kind}`.localeCompare(
      `${b.component}\0${b.prop}\0${b.kind}`,
    ),
  );
  unchecked.sort((a, b) => a.component.localeCompare(b.component));
  return {
    status: 'checked',
    typescript: version,
    components: compared,
    findings,
    unchecked,
  };
}
