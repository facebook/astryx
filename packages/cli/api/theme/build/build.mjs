// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file theme build API — compile a defineTheme file to CSS + JS + .d.ts.
 *
 * `themeBuild(file, options, ctx)` is the programmatic surface behind
 * `astryx theme build`. It reads a theme file that uses defineTheme() and, via
 * @astryxdesign/core's shared generator (the SINGLE source of truth so the
 * build emits the exact CSS the `<Theme>` runtime does), writes:
 * - A CSS file with token overrides and component styles
 * - A JS module that re-exports the built theme (+ icon registry)
 * - A .d.ts (plus an optional .variants.d.ts for custom prop values)
 *
 * It performs the writes and returns a `theme.build` receipt — its `warnings`
 * carry override problems and any fonts the theme names but does not load
 * (font-warning.mjs) — or `null` when the theme produced no CSS (nothing to
 * build). Errors throw AstryxError (with
 * a stable code). Human progress is emitted through the shared `logger`
 * (silent by default), so the CLI keeps its exact output while a programmatic
 * caller stays quiet.
 *
 * With `{check: true}`, it compiles the same outputs in memory but writes
 * nothing: it compares each generated file against what is on disk (ignoring
 * only the volatile `@generated` `Command:` line) and returns a
 * `theme.build.check` receipt listing any stale or missing outputs. This is
 * the CI guard for committed, generated theme CSS: the source of truth is
 * `<theme>.ts`, and `theme build --check` fails when the committed
 * `<theme>.css`/`.js`/`.d.ts` no longer match it.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL, fileURLToPath} from 'node:url';
import {createJiti} from 'jiti';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {CLI_ROOT, findCoreDir} from '../../../foundation/fs/paths.mjs';
import {
  assertWithin,
  sanitizeName,
  PathSafetyError,
} from '../../../foundation/fs/path-safety.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError} from '../../error.mjs';
import {logger} from '../../logger.mjs';
import {loadComponentDoc} from '../../../foundation/discovery/component-loader.mjs';
import {
  collectUnloadedFonts,
  formatFontLoadingHelp,
} from './font-warning.mjs';

// Import shared theme processing from core. `astryx theme build` MUST produce the
// exact same CSS as the `<Theme>` runtime, so it has exactly one generation
// path: core's generator. There is no in-CLI fallback implementation — if this
// import fails, the build fails (see the ERR_CORE_NOT_FOUND guard in the theme
// action). A built, resolvable `@astryxdesign/core` is a hard requirement.
// A built, resolvable `@astryxdesign/core` is a hard requirement. These are
// populated from a dynamic import (a runtime boundary), so `any` is intentional.
/** @type {any} */ let _defineTheme = null;
/** @type {any} */ let _generateThemeRulesSplit = null;
/** @type {any} */ let _generateOnMediaCSS = null;
/** @type {any} */ let _coreImportError = null;
try {
  const coreTheme = await import('@astryxdesign/core/theme');
  _defineTheme = coreTheme.defineTheme;
  _generateThemeRulesSplit = coreTheme.generateThemeRulesSplit;
  _generateOnMediaCSS = coreTheme.generateOnMediaCSS;
} catch (e) {
  // Capture the reason so the theme action can surface a precise, actionable
  // error. We don't throw here: this module is imported eagerly by the CLI
  // entrypoint for every command, and a throw at load time would break
  // unrelated commands (the entry wraps loads in try/catch and degrades the
  // command to a stub). The hard failure happens when `theme build` runs.
  _coreImportError = e;
}

/**
 * Read a package's `version` from a resolved directory. Returns `'unknown'`
 * when it can't be read so the header always has a value.
 * @param {string|null} dir
 * @returns {string}
 */
function readPkgVersion(dir) {
  if (!dir) return 'unknown';
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(dir, 'package.json'), 'utf-8'),
    );
    return pkg?.version ?? 'unknown';
  } catch {
    return 'unknown';
  }
}

/**
 * Resolve the CLI and core package versions recorded in generated headers.
 * These are stable (unlike a timestamp): identical inputs produce byte-identical
 * output, so rebuilds don't churn git and `theme build --check` stays a pure
 * content-drift signal.
 * @param {string} cwd - Consumer cwd, used to locate the installed core.
 * @returns {{cli: string, core: string}}
 */
function resolveToolVersions(cwd) {
  return {
    cli: readPkgVersion(CLI_ROOT),
    core: readPkgVersion(findCoreDir(cwd)),
  };
}

/**
 * Build a @generated attribution header for generated files.
 * @param {string} sourceFile - Relative path to the source theme file
 * @param {'css'|'js'|'ts'} lang - File language (determines comment syntax)
 * @param {string} [command] - The full CLI command used to generate this file
 * @param {{cli: string, core: string}} [versions] - CLI/core versions used to build
 */
function generatedHeader(sourceFile, lang = 'js', command, versions) {
  const body = [
    `@generated by \`astryx theme build\` — do not edit manually.`,
    `Source: ${sourceFile}`,
  ];
  if (command) {
    body.push(`Command: ${command}`);
  }
  if (versions) {
    body.push(`CLI: @astryxdesign/cli@${versions.cli}`);
    body.push(`Core: @astryxdesign/core@${versions.core}`);
  }
  if (lang === 'css') {
    return `/*\n * ${body.join('\n * ')}\n */\n\n`;
  }
  return `/**\n * ${body.join('\n * ')}\n */\n\n`;
}

/**
 * Normalize generated file content for staleness comparison by dropping the
 * volatile `Command:` line of the `@generated` header (it embeds the
 * invocation, e.g. an explicit --out). Everything else — including the rest of
 * the header and all real content — is compared verbatim. Used only by
 * `--check`: a differing command must NOT report a file as stale, but any real
 * content drift must. The `CLI:`/`Core:` provenance lines are deterministic
 * for a given toolchain, so they compare verbatim like real content.
 * @param {string} content
 * @returns {string}
 */
function normalizeForCompare(content) {
  return content
    .split('\n')
    .filter(line => {
      const t = line.replace(/^\s*\*?\s?/, '');
      return !t.startsWith('Command:');
    })
    .join('\n');
}

/**
 * Convert a theme name to a valid JS identifier.
 * e.g. 'default-minimal' → 'defaultMinimal', 'ocean' → 'ocean'
 * @param {string} name
 * @returns {string}
 */
function toIdentifier(name) {
  return name.replace(
    /-([a-z])/g,
    (/** @type {string} */ _, /** @type {string} */ c) => c.toUpperCase(),
  );
}

/**
 * Import specifier for install/scaffold instructions. Drops a leading `src/`
 * from the cwd-relative dir (most consumers import from a file under src/) but
 * keeps the rest of the path (e.g. `themes/gothic`). Callers note the path is
 * relative to the consumer's file.
 * Exported (not just used by `themeBuild`'s install instructions) because the
 * thin CLI's `theme add` action reuses it for its own scaffold instructions.
 * @param {string} relDir
 * @param {string} base
 * @returns {string}
 */
export function importSpecifier(relDir, base) {
  const normalized = relDir === '.' ? '' : relDir;
  const withinSrc = normalized.replace(/^src\/?/, '').replace(/\/+$/, '');
  return withinSrc ? `./${withinSrc}/${base}` : `./${base}`;
}

/**
 * Convert a kebab-case component name to PascalCase.
 * e.g. 'button' → 'Button', 'progress-bar' → 'ProgressBar', 'avatar-status-dot' → 'AvatarStatusDot'
 * @param {string} name
 * @returns {string}
 */
function toPascalCase(name) {
  return name
    .split('-')
    .map(
      (/** @type {string} */ part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join('');
}

/**
 * Load known built-in values for a component's visual props from its .doc.mjs file.
 * Parses the type string (e.g. "'info' | 'warning' | 'error' | 'success'") to extract values.
 * Returns a map of { propName: string[] } for props that are visual (listed in theming targets).
 * @param {string} componentName
 * @returns {Promise<Record<string, string[]>>}
 */
async function loadKnownValues(componentName) {
  // Resolve core src relative to the CLI package, not cwd (which may be a theme package)
  const cliDir = path.dirname(fileURLToPath(import.meta.url));
  const coreSrc = path.resolve(cliDir, '../../../../core/src');
  if (!fs.existsSync(coreSrc)) return {};
  // Map component name to directory (e.g. 'banner' → 'Banner',
  // 'dropdown-menu' → 'DropdownMenu'). Theme keys use the rendered class
  // token, which hyphenates multi-word names, so strip non-letters from BOTH
  // sides before comparing.
  const dirs = fs
    .readdirSync(coreSrc, {withFileTypes: true})
    .filter(d => d.isDirectory())
    .map(d => d.name);
  const target = componentName.toLowerCase().replace(/[^a-z]/g, '');
  const dir = dirs.find(d => d.toLowerCase().replace(/[^a-z]/g, '') === target);
  if (!dir) return {};

  const docPath = path.join(coreSrc, dir, `${dir}.doc.mjs`);
  if (!fs.existsSync(docPath)) return {};

  try {
    const docModule = await import(pathToFileURL(docPath).href);
    const doc = docModule.docs;
    if (!doc?.theming?.targets) return {};

    // Collect all props — from doc.props or doc.components[].props
    const allProps = [];
    if (doc.props) allProps.push(...doc.props);
    if (doc.components) {
      for (const comp of doc.components) {
        if (comp.props) allProps.push(...comp.props);
      }
    }
    if (allProps.length === 0) return {};

    // Collect visual prop names from theming targets
    /** @type {Set<string>} */
    const visualProps = new Set();
    for (const target of doc.theming.targets) {
      if (target.visualProps) {
        for (const vp of target.visualProps) visualProps.add(vp);
      }
    }

    // Extract values from prop type strings
    /** @type {Record<string, string[]>} */
    const result = {};
    for (const prop of allProps) {
      if (!visualProps.has(prop.name)) continue;
      if (!prop.type || typeof prop.type !== 'string') continue;

      // Parse union type: "'info' | 'warning' | 'error' | 'success'" → ['info', 'warning', 'error', 'success']
      const matches = prop.type.match(/'([^']+)'/g);
      if (matches) {
        result[prop.name] = matches.map((/** @type {string} */ m) =>
          m.replace(/'/g, ''),
        );
      }
    }
    return result;
  } catch {
    return {};
  }
}

// Cache for loaded known values
/** @type {Map<string, Record<string, string[]>>} */
const _knownValuesCache = new Map();
/**
 * @param {string} componentName
 * @returns {Promise<Record<string, string[]>>}
 */
async function getKnownValues(componentName) {
  if (!_knownValuesCache.has(componentName)) {
    _knownValuesCache.set(componentName, await loadKnownValues(componentName));
  }
  return _knownValuesCache.get(componentName) ?? {};
}

/**
 * Resolve `@astryxdesign/core`'s package root relative to the CLI package. Core
 * and the CLI ship as siblings (`@astryxdesign/core`, `@astryxdesign/cli`), so
 * `../../../../core` from `api/theme/build/` reaches core whether installed from
 * npm or run inside the monorepo. Returns null if it can't be found.
 */
function resolveCoreRoot() {
  const cliDir = path.dirname(fileURLToPath(import.meta.url));
  const coreRoot = path.resolve(cliDir, '../../../../core');
  return fs.existsSync(coreRoot) ? coreRoot : null;
}

/**
 * Read the type declarations `@astryxdesign/core/<Component>` exposes so we can
 * check whether a given augmentation-target interface actually exists before
 * generating a module augmentation against it.
 *
 * Reads the shipped `dist/<Component>/index.d.ts` (what a consumer's TypeScript
 * actually sees), falling back to the `src/<Component>/index.ts` in the
 * monorepo. Returns the file contents, or '' if nothing is found.
 */
/** @type {Map<string, string>} */
const _componentDeclCache = new Map();
/**
 * @param {string} pascalName
 * @returns {string}
 */
function readComponentDeclarations(pascalName) {
  if (_componentDeclCache.has(pascalName)) {
    return _componentDeclCache.get(pascalName) ?? '';
  }
  let contents = '';
  const coreRoot = resolveCoreRoot();
  if (coreRoot) {
    const candidates = [
      path.join(coreRoot, 'dist', pascalName, 'index.d.ts'),
      path.join(coreRoot, 'src', pascalName, 'index.ts'),
    ];
    for (const file of candidates) {
      try {
        if (fs.existsSync(file)) {
          contents = fs.readFileSync(file, 'utf-8');
          break;
        }
      } catch {
        // ignore and try the next candidate
      }
    }
  }
  _componentDeclCache.set(pascalName, contents);
  return contents;
}


/** @type {Map<string, Array<{moduleName: string, interfacePrefix: string}>>} */
const _augmentationTargetCache = new Map();

/**
 * Resolve a rendered theme class token (the key without `astryx-`) to candidate
 * public core subpaths and interface prefixes that may own its augmentable prop
 * maps. Some tokens are subtargets documented by a parent component
 * (`avatar-status-dot` augments `@astryxdesign/core/Avatar`), and some stable
 * class tokens intentionally omit word separators (`progressbar`, `statusdot`)
 * while the public API keeps `ProgressBar`/`StatusDot` casing. Component docs
 * are the source of truth for the target token → owning component relationship.
 *
 * @param {string} componentName
 * @returns {Promise<Array<{moduleName: string, interfacePrefix: string}>>}
 */
async function resolveAugmentationTargetCandidates(componentName) {
  if (_augmentationTargetCache.has(componentName)) {
    return /** @type {Array<{moduleName: string, interfacePrefix: string}>} */ (
      _augmentationTargetCache.get(componentName)
    );
  }

  const fallback = [
    {
      moduleName: toPascalCase(componentName),
      interfacePrefix: toPascalCase(componentName),
    },
  ];

  const coreRoot = resolveCoreRoot();
  const coreSrc = coreRoot ? path.join(coreRoot, 'src') : null;
  if (!coreSrc || !fs.existsSync(coreSrc)) {
    _augmentationTargetCache.set(componentName, fallback);
    return fallback;
  }

  /** @type {Array<{moduleName: string, interfacePrefix: string}>} */
  const matches = [];
  /** @type {Set<string>} */
  const seen = new Set();

  /**
   * @param {string} moduleName
   * @param {string} interfacePrefix
   */
  function addCandidate(moduleName, interfacePrefix) {
    const key = `${moduleName}:${interfacePrefix}`;
    if (seen.has(key)) return;
    seen.add(key);
    matches.push({moduleName, interfacePrefix});
  }

  /** @param {string} dir */
  async function scan(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
        await scan(full);
        continue;
      }
      if (!entry.name.endsWith('.doc.mjs')) continue;

      /** @type {any} */
      let doc;
      try {
        doc = await loadComponentDoc(full);
      } catch {
        continue;
      }

      const matchesTarget = (doc?.theming?.targets || []).some(
        (/** @type {any} */ target) =>
          typeof target?.className === 'string' &&
          target.className.replace(/^astryx-/, '') === componentName,
      );
      if (!matchesTarget) continue;

      const moduleName =
        typeof doc?.name === 'string' && doc.name
          ? doc.name
          : path.basename(path.dirname(full));

      // Try the exact rendered token first for documented subtargets such as
      // avatar-status-dot → AvatarStatusDotVariantMap, then the owning public
      // component name for unhyphenated public casings such as progressbar →
      // ProgressBarVariantMap/statusdot → StatusDotVariantMap.
      addCandidate(moduleName, toPascalCase(componentName));
      addCandidate(moduleName, moduleName);
      if (Array.isArray(doc?.components)) {
        for (const comp of doc.components) {
          if (typeof comp?.name === 'string') {
            addCandidate(moduleName, comp.name);
          }
        }
      }
    }
  }

  await scan(coreSrc);
  const resolved = matches.length > 0 ? matches : fallback;
  _augmentationTargetCache.set(componentName, resolved);
  return resolved;
}

/**
 * Determine whether `@astryxdesign/core/<Component>` exports an interface named
 * `interfaceName` that can be augmented via module augmentation.
 *
 * Only interfaces are extension points — closed literal-union types (e.g.
 * `HeadingType`, `ButtonSize`) are NOT augmentable, so a generated augmentation
 * against them is dead code. We check that the name is exported (directly or
 * re-exported) as a type/interface.
 * @param {string} pascalName
 * @param {string} interfaceName
 * @returns {boolean}
 */
function componentHasAugmentableInterface(pascalName, interfaceName) {
  const decl = readComponentDeclarations(pascalName);
  if (!decl) return false;
  // Require an actual interface declaration in this public subpath, not just a
  // type re-export. Module augmentation only widens consumers that import the
  // module where the interface is declared; augmenting a barrel that re-exports
  // the type (e.g. Field re-exporting FieldStatusVariantMap) creates a dead
  // sibling interface for consumers of the real FieldStatus subpath.
  const re = new RegExp(String.raw`\binterface\s+${interfaceName}\b`);
  return re.test(decl);
}

/**
 * Generate TypeScript declaration content with module augmentation for custom
 * component prop values found in the theme's `components` keys. Reads known
 * values from doc files to filter out base prop values.
 *
 * Interface naming convention: PascalCase(component) + PascalCase(prop) + Map
 *   banner + status → BannerStatusMap
 *   button + variant → ButtonVariantMap
 *
 * An augmentation is only emitted when `@astryxdesign/core/<Component>` actually
 * exports a matching interface. Props backed by closed literal-union types
 * (e.g. Button `size`, Heading `type`/`level`) have no augmentation point, so
 * generating a `declare module` block for them would be dead code — those are
 * skipped.
 *
 * @param {{components?: Record<string, Record<string, Record<string, unknown>>>}} themeDef - Theme definition (resolved by defineTheme)
 * @returns {Promise<string|null>} TypeScript declaration content, or null if no augmentations needed
 */
async function generateVariantDeclarationsAsync(themeDef) {
  if (!themeDef.components || Object.keys(themeDef.components).length === 0) {
    return null;
  }

  // Collect custom values: { component: { prop: [value, ...] } }
  /** @type {Record<string, Record<string, Set<string>>>} */
  const customValues = {};

  for (const [component, rules] of Object.entries(themeDef.components)) {
    const knownForComponent = await getKnownValues(component);

    for (const key of Object.keys(rules)) {
      if (key === 'base') continue;

      const pairs = key.split('+');
      for (const pair of pairs) {
        const colonIdx = pair.indexOf(':');
        if (colonIdx === -1) continue;
        const prop = pair.slice(0, colonIdx);
        const value = pair.slice(colonIdx + 1);

        // Skip known built-in values
        const knownForProp = knownForComponent[prop];
        if (knownForProp && knownForProp.includes(value)) continue;

        if (!customValues[component]) customValues[component] = {};
        if (!customValues[component][prop])
          customValues[component][prop] = new Set();
        customValues[component][prop].add(value);
      }
    }
  }

  // Check if we found any custom values
  const hasCustom = Object.values(customValues).some(props =>
    Object.values(props).some(values => values.size > 0),
  );
  if (!hasCustom) return null;

  const sections = ['// Generated by astryx theme build', 'export {};', ''];

  for (const [component, props] of Object.entries(customValues)) {
    for (const [prop, values] of Object.entries(props)) {
      if (values.size === 0) continue;

      const propPascal = prop.charAt(0).toUpperCase() + prop.slice(1);
      const target = (await resolveAugmentationTargetCandidates(component)).find(
        candidate =>
          componentHasAugmentableInterface(
            candidate.moduleName,
            `${candidate.interfacePrefix}${propPascal}Map`,
          ),
      );

      // Only augment interfaces that actually exist as an extension point in
      // core. Props backed by closed literal-union types (e.g. Button `size`,
      // Heading `type`/`level`) have no `*Map` interface — a `declare module`
      // block against a non-existent interface just creates a new, unused
      // interface and never extends the component's prop union, so skip it.
      if (!target) continue;

      const modulePath = `@astryxdesign/core/${target.moduleName}`;
      const interfaceName = `${target.interfacePrefix}${propPascal}Map`;

      sections.push(`declare module '${modulePath}' {`);
      sections.push(`  interface ${interfaceName} {`);
      for (const v of values) {
        sections.push(`    '${v}': true;`);
      }
      sections.push('  }');
      sections.push('}');
      sections.push('');
    }
  }

  // If every custom value targeted a non-augmentable prop, there's nothing to
  // emit beyond the header — return null so no `.variants.d.ts` is written.
  const hasEmittedAugmentation = sections.some(line =>
    line.startsWith('declare module'),
  );
  if (!hasEmittedAugmentation) return null;

  return sections.join('\n');
}

/**
 * Resolve a token value — [light, dark] tuple becomes light-dark()
 * @param {unknown} value
 * @returns {unknown}
 */
function resolveTokenValue(value) {
  if (Array.isArray(value)) {
    return `light-dark(${value[0]}, ${value[1]})`;
  }
  return value;
}

// Theme @scope selector helpers. Keep the `astryx` literal in sync with
// packages/core/src/naming.ts (NAMESPACE) and generateThemeRules.ts.
// Theme scopes to data-astryx-theme; the static build path must match.
const themeScopeStart = (/** @type {string} */ name) =>
  `[data-astryx-theme="${name}"]`;
const THEME_SCOPE_TO = `[data-astryx-theme]`;

/**
 * Module extensions the theme loader resolves, source before artifact.
 *
 * `theme build` writes `<name>.js` next to `<name>.ts`, and jiti's default
 * order tries `.js` first — so once a base theme had been built, every sibling
 * theme that `extends` it resolved to that generated artifact instead of the
 * source. The artifact carries no `components` and exports a different name,
 * so the inheritance silently evaporated. Resolving source first is also what
 * the author's TypeScript sees, which is the point: the CSS the build emits
 * matches the theme they type-checked.
 */
const THEME_MODULE_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.mts',
  '.cts',
  '.mtsx',
  '.ctsx',
  '.mjs',
  '.cjs',
  '.js',
  '.json',
];

/**
 * Import a theme module using jiti and find the defineTheme() result.
 * Returns the resolved DefinedTheme object.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
async function importThemeModule(filePath) {
  const jiti = createJiti(import.meta.url, {
    moduleCache: false,
    jsx: true,
    extensions: THEME_MODULE_EXTENSIONS,
  });

  const mod = await jiti.import(filePath, {default: true});

  if (isThemeObject(mod)) return mod;

  if (mod && typeof mod === 'object') {
    for (const value of Object.values(mod)) {
      if (isThemeObject(value)) return value;
    }
  }

  throw new Error(
    `Could not find a defineTheme() result in ${filePath}.\n` +
      `Expected an export like: export const myTheme = defineTheme({ name: '...', tokens: {...} })`,
  );
}

/**
 * @param {any} value
 * @returns {boolean}
 */
function isThemeObject(value) {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.name === 'string' &&
    value.tokens &&
    typeof value.tokens === 'object'
  );
}

/**
 * Extract the theme definition from a JS/TS file.
 * Tries jiti first (full TS support), falls back to regex+eval.
 * @param {string} filePath
 * @returns {Promise<any>}
 */
async function extractThemeDefinition(filePath) {
  try {
    return await importThemeModule(filePath);
  } catch (jitiError) {
    try {
      return extractThemeDefinitionLegacy(filePath);
    } catch {
      const je = /** @type {Error} */ (jitiError);
      throw new Error(
        `Failed to load theme from ${filePath}: ${je.message}\n` +
          `Make sure all imports in the theme file are resolvable.`,
      );
    }
  }
}

/**
 * Fallback extraction via regex + eval.
 * Only works for plain object literals — can't follow imports or variables.
 * @param {string} filePath
 * @returns {any}
 */
function extractThemeDefinitionLegacy(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  const defineMatch = content.match(/defineTheme\s*\(\s*({[\s\S]*?})\s*\)/);
  if (!defineMatch) {
    const defaultMatch = content.match(/export\s+default\s+({[\s\S]*?});/);
    if (!defaultMatch) {
      throw new Error(
        `Could not find defineTheme() call or default export in ${filePath}.\n` +
          `Expected: defineTheme({ name: '...', tokens: {...} })`,
      );
    }

    return eval(`(${defaultMatch[1]})`);
  }

  let objStr = defineMatch[1];
  objStr = objStr.replace(/\s+as\s+const/g, '');
  objStr = objStr.replace(
    /icons:\s*[a-zA-Z_][a-zA-Z0-9_]*/g,
    'icons: undefined',
  );

  try {
    return eval(`(${objStr})`);
  } catch (e) {
    const err = /** @type {Error} */ (e);
    throw new Error(
      `Failed to parse theme definition in ${filePath}: ${err.message}\n` +
        `Make sure the defineTheme() argument is a plain object literal.`,
      {cause: e},
    );
  }
}

/**
 * Extract icon import info from a theme source file.
 * Returns { importPath, exportName } or null if no icons.
 *
 * Looks for patterns like:
 *   import { defaultIconRegistry } from './icons';
 *   icons: defaultIconRegistry,
 * @param {string} filePath
 * @returns {{exportName: string, importPath: string} | null}
 */
function extractIconInfo(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');

  // Find the icons field in defineTheme
  const iconsMatch = content.match(/icons:\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
  if (!iconsMatch) return null;

  const varName = /** @type {string} */ (iconsMatch[1]);

  // Find the import for that variable
  const importRegex = new RegExp(
    `import\\s*{[^}]*\\b${varName}\\b[^}]*}\\s*from\\s*['"]([^'"]+)['"]`,
  );
  const importMatch = content.match(importRegex);
  if (!importMatch) return null;

  return {
    exportName: varName,
    importPath: /** @type {string} */ (importMatch[1]),
  };
}

/**
 * Generate a minimal JS module for a built theme.
 * Includes the theme name, marker, and re-exports the icon registry.
 * All styling is in the CSS file.
 *
 * The module carries the theme's resolved `components` and on-media surfaces
 * alongside its tokens. They are not needed to apply the theme — the CSS holds
 * all of that — but a built theme is a legitimate base for `extends` (the
 * shipped themes expose one as their `./built` subpath), and a base that
 * carries only tokens makes its children silently lose every component
 * override it had.
 *
 * The icon registry is imported rather than inlined because it holds React
 * elements, which cannot be serialized. `extractIconInfo` lifts the specifier
 * out of the TypeScript source, where an extensionless `./icons` is resolved by
 * the TypeScript resolver — but the artifact here is ESM JavaScript, which
 * requires a fully specified path. Only the caller knows what its own build
 * will emit and under what name, so `iconsSpecifier` lets it say. When it is
 * not given, the scraped specifier is emitted unchanged.
 *
 * @param {any} themeDef
 * @param {{exportName: string, importPath: string} | null} iconInfo
 * @param {string} [iconsSpecifier] - Overrides the scraped icon import specifier.
 * @returns {string}
 */
function generateBuiltModule(themeDef, iconInfo, iconsSpecifier) {
  // Preserve the historical generated bytes when no override is supplied.
  // User-provided specifiers need string-literal encoding so quotes and
  // backslashes cannot produce invalid JavaScript.
  const renderedSpecifier =
    iconsSpecifier === undefined
      ? `'${iconInfo?.importPath}'`
      : JSON.stringify(iconsSpecifier);
  const iconImport = iconInfo
    ? `import { ${iconInfo.exportName} } from ${renderedSpecifier};\n`
    : '';
  const iconsField = iconInfo ? `  icons: ${iconInfo.exportName},` : '';
  const iconReExport = iconInfo ? `\nexport { ${iconInfo.exportName} };\n` : '';

  // Resolve token values — tuples become light-dark() strings
  /** @type {Record<string, unknown>} */
  const resolvedTokens = {};
  if (themeDef.tokens) {
    for (const [key, value] of Object.entries(themeDef.tokens)) {
      resolvedTokens[key] = resolveTokenValue(value);
    }
  }

  const tokensStr = JSON.stringify(resolvedTokens, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n');

  /**
   * Serialize a resolved theme field as an indented object literal, or '' when
   * there is nothing to emit.
   * @param {string} field
   * @param {unknown} value
   * @returns {string}
   */
  const serializeField = (field, value) => {
    if (!value || Object.keys(value).length === 0) return '';
    const body = JSON.stringify(value, null, 2)
      .split('\n')
      .map((line, i) => (i === 0 ? line : '  ' + line))
      .join('\n');
    return `  ${field}: ${body},\n`;
  };

  const inheritableFields =
    serializeField('components', themeDef.components) +
    serializeField('__onDark', themeDef.__onDark) +
    serializeField('__onLight', themeDef.__onLight);

  return `${iconImport}/**
 * ${themeDef.name} theme — built by \`${getCliInvocation()} theme build\`
 * Import the CSS file alongside this module:
 *
 *   import { ${toIdentifier(themeDef.name)}Theme } from './${themeDef.name}';
 *   import './${themeDef.name}.css';
 */
export const ${toIdentifier(themeDef.name)}Theme = {
  name: '${themeDef.name}',
  __built: true,
  tokens: ${tokensStr},
${inheritableFields}${iconsField}
};
${iconReExport}`;
}

/**
 * Generate TypeScript declarations for a built theme module.
 * @param {any} themeDef
 * @param {{exportName: string, importPath: string} | null} iconInfo
 * @param {string | null} variantsFileName
 * @returns {string}
 */
function generateBuiltTypes(themeDef, iconInfo, variantsFileName) {
  const iconType = iconInfo
    ? `import type { IconRegistry } from '@astryxdesign/core/Icon';
export declare const ${iconInfo.exportName}: IconRegistry;
`
    : '';
  // Pull in the generated custom-variant augmentations so that importing the
  // theme's types also loads the module augmentations (otherwise the
  // `.variants.d.ts` is emitted but never referenced, and the custom variants
  // never widen the component prop unions for consumers).
  const variantsRef = variantsFileName
    ? `/// <reference path="./${variantsFileName}" />
`
    : '';
  return `${variantsRef}import type { DefinedTheme } from '@astryxdesign/core/theme';
${iconType}export declare const ${toIdentifier(themeDef.name)}Theme: DefinedTheme;
`;
}

// =============================================================================
// Component validation
// =============================================================================

/**
 * Load known theme target keys from core component docs: the visual props AND
 * the runtime states each target reflects. Both are legal override keys — the
 * Theming Infrastructure wiki documents `radio: {checked}` and
 * `'calendar-day': {today, selected}` alongside `button: {'variant:secondary'}`
 * — so validation has to know both or documented syntax warns as unknown.
 * Returns null when docs are unavailable so validation can skip unknown-key
 * warnings rather than guessing from a second registry.
 *
 * @returns {Promise<Record<string, string[]> | null>}
 */
async function loadKnownComponents() {
  const coreRoot = resolveCoreRoot();
  const coreSrc = coreRoot ? path.join(coreRoot, 'src') : null;
  if (!coreSrc || !fs.existsSync(coreSrc)) return null;

  /** @type {Record<string, string[]>} */
  const targets = {};

  /** @param {string} dir */
  async function scan(dir) {
    const entries = fs.readdirSync(dir, {withFileTypes: true});
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '__tests__') continue;
        await scan(full);
        continue;
      }
      if (!entry.name.endsWith('.doc.mjs')) continue;

      /** @type {any} */
      let doc;
      try {
        doc = await loadComponentDoc(full);
      } catch {
        continue;
      }

      for (const target of doc?.theming?.targets || []) {
        const className = target?.className;
        if (typeof className !== 'string') continue;
        const key = className.replace(/^astryx-/, '');
        if (!key) continue;
        const props = [target.visualProps, target.states]
          .filter(list => Array.isArray(list))
          .flat()
          .filter((/** @type {unknown} */ p) => typeof p === 'string');
        targets[key] = [...new Set([...(targets[key] || []), ...props])];
      }
    }
  }

  await scan(coreSrc);
  return Object.keys(targets).length > 0 ? targets : null;
}

/** @type {Record<string, string[]> | null | undefined} */
let knownComponentsCache;

/**
 * @returns {Promise<Record<string, string[]> | null>}
 */
async function getKnownComponents() {
  if (knownComponentsCache === undefined) {
    knownComponentsCache = await loadKnownComponents();
  }
  return knownComponentsCache;
}

/**
 * Validate component overrides in a theme definition.
 * Warns on unknown component names and unknown prop names.
 * Returns array of warning strings.
 * @param {{components?: Record<string, Record<string, unknown>>}} themeDef
 * @returns {Promise<string[]>}
 */
async function validateComponentOverrides(themeDef) {
  /** @type {string[]} */
  const warnings = [];
  if (!themeDef.components) return warnings;

  const knownComponents = await getKnownComponents();
  if (knownComponents == null) return warnings;

  for (const [component, rules] of Object.entries(themeDef.components)) {
    // Check component name
    if (!(component in knownComponents)) {
      const similar = Object.keys(knownComponents)
        .filter(k => {
          if (k.includes(component) || component.includes(k)) return true;
          // Levenshtein distance 1-2 for short names
          if (Math.abs(k.length - component.length) <= 2) {
            let diff = 0;
            const longer = k.length >= component.length ? k : component;
            const shorter = k.length < component.length ? k : component;
            let j = 0;
            for (let i = 0; i < longer.length && diff <= 2; i++) {
              if (longer[i] !== shorter[j]) diff++;
              else j++;
            }
            diff += shorter.length - j;
            return diff <= 2;
          }
          return false;
        })
        .slice(0, 3);
      const hint =
        similar.length > 0 ? ` Did you mean: ${similar.join(', ')}?` : '';
      warnings.push(`Unknown component "${component}".${hint}`);
      continue;
    }

    // Check prop/state names in the override keys. A key is either `base`, a
    // `prop:value` pair (possibly `+`-joined), or a bare state name.
    const knownProps = knownComponents[component];
    for (const key of Object.keys(rules)) {
      if (key === 'base') continue;

      // Parse prop:value pairs (e.g. 'variant:secondary' or 'variant:destructive+size:sm')
      const pairs = key.split('+');
      for (const pair of pairs) {
        const [prop] = pair.split(':');
        if (prop && !knownProps.includes(prop)) {
          const hint =
            knownProps.length > 0
              ? ` Known props/states: ${knownProps.join(', ')}`
              : ' This component has no variant props or states.';
          warnings.push(
            `Unknown prop "${prop}" on component "${component}".${hint}`,
          );
        }
      }
    }
  }

  return warnings;
}

/**
 * Validate that themes don't set private (--_*) CSS custom properties directly.
 * Private vars are internal implementation details managed by the derived var
 * expansion pipeline. Theme authors should write standard CSS properties
 * (e.g. borderRadius, padding) instead.
 *
 * Returns array of error strings.
 * @param {{components?: Record<string, Record<string, Record<string, unknown>>>}} themeDef
 * @returns {string[]}
 */
function validatePrivateVars(themeDef) {
  /** @type {string[]} */
  const errors = [];
  if (!themeDef.components) return errors;

  for (const [component, rules] of Object.entries(themeDef.components)) {
    for (const [key, styles] of Object.entries(rules)) {
      for (const prop of Object.keys(styles)) {
        if (typeof prop === 'string' && prop.startsWith('--_')) {
          errors.push(
            `Component "${component}" (${key}) sets private var "${prop}". ` +
              `Private vars (--_*) are internal — use standard CSS properties ` +
              `(e.g. borderRadius, padding) instead. The pipeline expands them automatically.`,
          );
        }
      }
    }
  }

  return errors;
}

/**
 * Compile a defineTheme file to CSS + JS + .d.ts (and an optional
 * `.variants.d.ts`). Performs the writes and returns a `theme.build` receipt,
 * or `null` when the theme produced no CSS (nothing to build). Throws
 * AstryxError (stable code) on failure. Progress is emitted through the shared
 * `logger` (silent by default).
 *
 * @param {string} file - Theme file path, resolved against `cwd`.
 * @param {{out?: string, check?: boolean, iconsSpecifier?: string}} [options] -
 *   `out` overrides the output CSS path; `check` compares against on-disk outputs
 *   instead of writing. `iconsSpecifier` overrides the icon registry import
 *   specifier in the generated module (e.g. `./icons.mjs`); when omitted, the
 *   specifier scraped from the theme source is emitted unchanged.
 * @param {{cwd?: string}} [ctx]
 * @returns {Promise<import('../theme.type.mjs').ThemeBuildResponse | import('../theme.type.mjs').ThemeBuildCheckResponse | null>}
 */
export async function themeBuild(
  file,
  options = {},
  {cwd = process.cwd()} = {},
) {
  const filePath = path.resolve(cwd, file);

  if (!fs.existsSync(filePath)) {
    throw new AstryxError(
      `File not found: ${filePath}`,
      undefined,
      ERROR_CODES.ERR_FILE_NOT_FOUND,
    );
  }

  logger.log(`\nBuilding theme from ${path.relative(cwd, filePath)}...`);

  // Extract theme definition
  let themeDef;
  try {
    themeDef = await extractThemeDefinition(filePath);
  } catch (e) {
    const err = /** @type {Error} */ (e);
    throw new AstryxError(err.message, undefined, ERROR_CODES.ERR_THEME_LOAD);
  }

  if (!themeDef.name) {
    throw new AstryxError(
      'Theme must have a name property.',
      undefined,
      ERROR_CODES.ERR_THEME_INVALID,
    );
  }

  // Path-safety: the theme name is used to derive output filenames
  // (e.g. `${name}.css`, `${name}.js`). Reject names containing path
  // separators or traversal markers — `../../escaped` would otherwise
  // write JS modules outside the input directory.
  try {
    sanitizeName(themeDef.name, {label: 'theme name'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(
        err.message,
        undefined,
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw err;
  }

  // Validate component overrides
  const warnings = await validateComponentOverrides(themeDef);
  const warningMessages = [];
  /** Advisories about a correct theme — see the `notices` note on the receipt. */
  const noticeMessages = [];
  for (const w of warnings) {
    warningMessages.push(w);
    logger.warn(`  ⚠ ${w}`);
  }

  // Validate no private vars are set directly
  const privateVarErrors = validatePrivateVars(themeDef);
  for (const e of privateVarErrors) {
    warningMessages.push(e);
    logger.error(`  ✗ ${e}`);
  }
  if (privateVarErrors.length > 0) {
    logger.error(
      `\n  ${privateVarErrors.length} private var error(s). Use standard CSS properties instead.`,
    );
  }

  // Generate CSS via core's shared generator — the SINGLE source of truth.
  // `astryx theme build` and the `<Theme>` runtime MUST emit identical CSS, so
  // there is exactly one generation path: @astryxdesign/core/theme. If core could not
  // be imported, fail hard rather than silently producing divergent output.
  if (!_defineTheme || !_generateThemeRulesSplit) {
    throw new AstryxError(
      'Could not load @astryxdesign/core/theme — `astryx theme build` requires a ' +
        'built, resolvable @astryxdesign/core so it emits the same CSS as the ' +
        'runtime <Theme>. Build @astryxdesign/core first (e.g. `pnpm -F @astryxdesign/core ' +
        'build`)' +
        (_coreImportError
          ? `.\n  Import error: ${_coreImportError.message}`
          : '.'),
      undefined,
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }

  let css;
  let resolvedTheme;
  {
    // jiti returns an already-resolved theme; a plain object literal (or the
    // legacy eval path) returns raw defineTheme input, which still has to go
    // through the resolver. Detect that by the input-only fields — a resolved
    // theme has none of them — and hand the WHOLE object over: picking fields
    // by name is how `extends` (and `color`, and `syntax`) used to be dropped
    // on the way in.
    const INPUT_ONLY_FIELDS = [
      'extends',
      'typography',
      'motion',
      'radius',
      'color',
      'syntax',
      'onDark',
      'onLight',
    ];
    const needsResolution = INPUT_ONLY_FIELDS.some(
      field => themeDef[field] !== undefined,
    );
    if (needsResolution) {
      resolvedTheme = _defineTheme({...themeDef});
    } else {
      resolvedTheme = themeDef;
    }
    const scopeSelector = themeScopeStart(themeDef.name);
    const scopeTo = THEME_SCOPE_TO;

    const {component, prose} = _generateThemeRulesSplit(resolvedTheme);
    const cssParts = [];
    // Prose element defaults always ship — the `<Theme>` runtime
    // (generateThemeCSS) always emits them, so the build must too, or the
    // CLI output would diverge from runtime. They go in @layer reset
    // (zero-specificity :where()) so component/Markdown StyleX always wins.
    if (prose.length > 0) {
      const proseInner = prose.join('\n\n');
      cssParts.push(
        `@layer reset {\n@scope (${scopeSelector}) to (${scopeTo}) {\n${proseInner}\n}\n}`,
      );
    }
    if (component.length > 0) {
      const componentInner = component.join('\n\n');
      const componentScope = `@scope (${scopeSelector}) to (${scopeTo}) {\n${componentInner}\n}`;
      // #3658: also emit attribute-specific rules so <Theme mode> can override color-scheme
      const colorSchemeDecl = componentScope.includes('light-dark(')
        ? '  :root { color-scheme: light dark; }\n  html[data-theme="light"] { color-scheme: light; }\n  html[data-theme="dark"] { color-scheme: dark; }\n\n'
        : '';
      cssParts.push(
        `@layer astryx-theme {\n${colorSchemeDecl}${componentScope}\n}`,
      );
    }
    // On-media rules (MediaTheme dark/light surface overrides)
    if (_generateOnMediaCSS) {
      const onMediaCss = _generateOnMediaCSS(resolvedTheme);
      if (onMediaCss) {
        cssParts.push(`@layer astryx-theme {\n${onMediaCss}\n}`);
      }
    }
    if (cssParts.length === 0) {
      logger.log('No overrides found — nothing to build.');
      return null;
    }
    css = cssParts.join('\n\n') + '\n';
  }

  // Source path relative to cwd — used in @generated headers
  const sourceRelative = path.relative(cwd, filePath);
  const buildCommand = `astryx theme build ${sourceRelative}${options.out ? ' --out ' + path.relative(cwd, path.resolve(cwd, options.out)) : ''}`;
  // Stable provenance recorded in @generated headers — versions, not a
  // timestamp, so identical inputs produce byte-identical output.
  const versions = resolveToolVersions(cwd);

  // Derive the default CSS name from the theme name so .css/.js/.d.ts
  // share one scheme; an explicit --out still wins.
  const baseName = themeDef.name;
  let outPath;
  if (options.out) {
    outPath = path.resolve(cwd, options.out);
    // Guard: relative paths must not escape cwd via `../`. Absolute paths are
    // trusted (the user explicitly controls where output goes, like gcc -o).
    if (!path.isAbsolute(options.out)) {
      assertWithin(options.out, cwd, {label: 'output path'});
    }
  } else {
    outPath = path.join(path.dirname(filePath), `${baseName}.css`);
  }

  const displayTheme = resolvedTheme || themeDef;
  const tokenCount = displayTheme.tokens
    ? Object.keys(displayTheme.tokens).length
    : 0;
  const componentCount = displayTheme.components
    ? Object.keys(displayTheme.components).length
    : 0;
  const size = (Buffer.byteLength(css) / 1024).toFixed(1);

  // Compute all output paths up front so we can validate them as a
  // group BEFORE writing anything. Previously the CSS would be written
  // first; if the JS write failed (e.g. ENOENT, permission), the CSS
  // was left as orphaned half-built output. Stage-then-commit avoids
  // that.
  const outDir = path.dirname(outPath);
  const jsPath = path.join(outDir, `${baseName}.js`);
  const dtsPath = path.join(outDir, `${baseName}.d.ts`);

  const iconInfo = extractIconInfo(filePath);

  // Type augmentation .d.ts if theme has custom prop values. Computed
  // before the main .d.ts so the latter can reference it (see below).
  const augmentationSource = resolvedTheme || themeDef;
  const variantDecl =
    await generateVariantDeclarationsAsync(augmentationSource);
  const variantsFileName = variantDecl ? `${baseName}.variants.d.ts` : null;
  const variantDtsPath =
    variantDecl && variantsFileName
      ? path.join(outDir, variantsFileName)
      : null;
  const variantContent = variantDecl
    ? generatedHeader(sourceRelative, 'ts', buildCommand, versions) +
      variantDecl
    : null;

  // Generate all file contents in memory first. The main .d.ts references
  // the variants file (when present) via a triple-slash directive so
  // importing the theme also loads the custom-variant augmentations.
  const cssContent =
    generatedHeader(sourceRelative, 'css', buildCommand, versions) + css;
  const jsContent =
    generatedHeader(sourceRelative, 'js', buildCommand, versions) +
    generateBuiltModule(
      resolvedTheme || themeDef,
      iconInfo,
      options.iconsSpecifier,
    );
  const dtsContent =
    generatedHeader(sourceRelative, 'ts', buildCommand, versions) +
    generateBuiltTypes(themeDef, iconInfo, variantsFileName);

  // Atomic-ish write: stage every file as `<dest>.tmp`, then rename
  // each into place. If any stage step fails we clean up partials and
  // exit; if a rename fails mid-way we still have the originals (or
  // nothing) — never a half-built output set.
  const writes = [
    {dest: outPath, content: cssContent},
    {dest: jsPath, content: jsContent},
    {dest: dtsPath, content: dtsContent},
  ];
  if (variantDtsPath && variantContent) {
    writes.push({dest: variantDtsPath, content: variantContent});
  }

  // Check mode: compare generated content against what's on disk instead of
  // writing. A file is "stale" if it's missing or its content differs once the
  // volatile @generated `Command:` line is ignored. Returns a
  // receipt listing stale/missing outputs so callers (CI) can fail on drift.
  if (options.check) {
    /** @type {Array<{path: string, reason: 'missing' | 'outdated'}>} */
    const stale = [];
    for (const w of writes) {
      const rel = path.relative(cwd, w.dest);
      if (!fs.existsSync(w.dest)) {
        stale.push({path: rel, reason: 'missing'});
        continue;
      }
      const onDisk = fs.readFileSync(w.dest, 'utf8');
      if (normalizeForCompare(onDisk) !== normalizeForCompare(w.content)) {
        stale.push({path: rel, reason: 'outdated'});
      }
    }
    const upToDate = stale.length === 0;
    if (upToDate) {
      logger.log(`\n✓ Theme outputs are up to date with ${sourceRelative}.`);
    } else {
      logger.error(
        `\n✗ ${stale.length} theme output(s) are out of date with ${sourceRelative}:`,
      );
      for (const s of stale) {
        logger.error(
          `  ${s.reason === 'missing' ? 'missing' : 'stale'}: ${s.path}`,
        );
      }
      logger.error(`\n  Rebuild with: ${buildCommand}`);
    }
    return {
      type: 'theme.build.check',
      data: {
        name: themeDef.name,
        upToDate,
        stale,
        checked: writes.map(w => path.relative(cwd, w.dest)),
      },
    };
  }

  fs.mkdirSync(outDir, {recursive: true});
  /** @type {Array<{tmp: string, dest: string}>} */
  const staged = [];
  try {
    for (const w of writes) {
      const tmp = `${w.dest}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, w.content);
      staged.push({tmp, dest: w.dest});
    }
    for (const s of staged) {
      fs.renameSync(s.tmp, s.dest);
    }
  } catch (err) {
    // Roll back any temp files we managed to create.
    for (const s of staged) {
      try {
        fs.rmSync(s.tmp, {force: true});
      } catch {
        /* best-effort */
      }
    }
    const msg = `Failed to write theme outputs: ${/** @type {Error} */ (err).message}`;
    throw new AstryxError(msg, undefined, ERROR_CODES.ERR_WRITE_FAILED);
  }

  logger.log(`\n✓ ${path.relative(cwd, outPath)}`);
  logger.log(
    `  ${tokenCount} token overrides, ${componentCount} component overrides`,
  );
  logger.log(`  ${size} KB`);
  logger.log(`✓ ${path.relative(cwd, jsPath)}`);
  logger.log(`✓ ${path.relative(cwd, dtsPath)}`);
  if (variantDtsPath && variantDecl) {
    const augCount = (variantDecl.match(/': true;/g) || []).length;
    logger.log(
      `✓ ${path.relative(cwd, variantDtsPath)} (${augCount} type augmentations)`,
    );
  }

  const relOutDir = path.relative(cwd, outDir) || '.';
  const cssBase = path.basename(outPath, '.css');
  const jsImport = importSpecifier(relOutDir, baseName);
  const cssImport = importSpecifier(relOutDir, cssBase) + '.css';
  const exportName = `${toIdentifier(baseName)}Theme`;
  logger.log(`
Install in your app (paths are relative to a file in src/ — adjust if yours lives elsewhere):

  import { ${exportName} } from '${jsImport}';
  import '${cssImport}';

  <Theme theme={${exportName}}>
    <App />
  </Theme>

Or with a <link> tag:

  import { ${exportName} } from '${jsImport}';

  <link rel="stylesheet" href="${cssImport}" />
  <Theme theme={${exportName}}>
    <App />
  </Theme>
`);

  // Fonts the theme names but nothing loads (#5015). Resolved tokens and
  // component overrides carry the final font-family values on both load
  // paths, so this sees jiti-resolved and legacy themes alike.
  //
  // A NOTICE, not a warning: naming a font a theme file cannot load is how
  // the API is meant to be used — Astryx sets `--font-family-*` and loading
  // is the app's job, which no theme can do for it. So this fires on any
  // theme with a webfont, including a perfect one, and as a warning it made
  // every such build read as defective (it also put the shipped template
  // permanently in violation of its own "compiles with no warnings" guard).
  const unloadedFonts = collectUnloadedFonts(resolvedTheme);
  for (const family of unloadedFonts) {
    const msg = `Font "${family}" is named by this theme but not loaded — add a <link> or @font-face in your app (recipe: astryx docs typography)`;
    noticeMessages.push(msg);
    logger.log(`  note: ${msg}`);
  }
  if (unloadedFonts.length > 0) {
    logger.log(formatFontLoadingHelp(themeDef.name, unloadedFonts));
  }

  return {
    type: 'theme.build',
    data: {
      name: themeDef.name,
      tokenCount,
      componentCount,
      sizeKB: parseFloat(size),
      outputs: {
        css: path.relative(cwd, outPath),
        js: path.relative(cwd, jsPath),
        dts: path.relative(cwd, dtsPath),
        ...(variantDecl && variantDtsPath
          ? {variantsDts: path.relative(cwd, variantDtsPath)}
          : {}),
      },
      warnings: warningMessages,
      notices: noticeMessages,
    },
  };
}
