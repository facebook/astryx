// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle API — copy a component's source into the consumer project for
 * customization, rewriting escaping relative imports to the OWNER package's
 * subpaths.
 *
 * An owner is core, a configured integration, or an external package that opts
 * in via its own package.json `astryx.docs` field (#2090); `--package`
 * disambiguates when more than one provides the name.
 *
 * Side-effecting: `swizzle(name, ...)` writes files and returns a
 * `swizzle.copy` receipt describing what it did; with no name (or `list`) it
 * returns `swizzle.list`. Errors throw AstryxError (stable code + suggestions).
 * All human prose / package-manager prefixing lives in the CLI renderer.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  findCoreDir,
  listComponents,
  discoverExternalPackages,
} from '../../utils/paths.mjs';
import {assertWithin, PathSafetyError} from '../../utils/path-safety.mjs';
import {checkGhCli} from '../../utils/github.mjs';
import {Project} from '../../lib/project.mjs';
import {
  scanAllPackages,
  findComponentInPackages,
  ALL_DOC_SUFFIXES,
} from '../../lib/package-scanner.mjs';
import {
  CORE_PACKAGE,
  discoverIntegrationComponents,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
} from '../../lib/component-discovery.mjs';
import {ERROR_CODES} from '../../lib/error-codes.mjs';
import {AstryxError} from '../error.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports within the copied directory (./x) are
 * left untouched.
 *
 * e.g. with ownerPackage '@astryxdesign/core':
 *      '../theme/tokens.stylex' -> '@astryxdesign/core/theme'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
 *
 * Given `componentDir` + `rootDir` the specifier is RESOLVED against the owner's
 * root instead of being guessed from the text. That matters as soon as a
 * component can sit more than one level below the root, which external packages
 * can: `'../../theme/x'` from `src/components/AppShell` is `src/theme/x`, so it
 * names `<owner>/theme` — the text-only rule strips a single `../` and emits
 * `<owner>/..`, which is not a module specifier at all. An import that escapes
 * the root cannot be named as a subpath of it; those are left exactly as written
 * and reported through `onUnresolved` rather than mangled into a fake one.
 *
 * With no directories given, the text-only rule applies. It is exact for a flat
 * layout (core, integrations, `docs: './src'` over `src/<Name>/`) and is kept for
 * callers that have no paths to hand.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {{componentDir?: string, rootDir?: string, onUnresolved?: (specifier: string) => void}} [options]
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, options = {}) {
  const {componentDir, rootDir, onUnresolved} = options;
  return content.replace(
    /(from\s+['"])(\.\.\/.+?)(['"])/g,
    (match, prefix, importPath, suffix) => {
      let topDir;
      if (componentDir && rootDir) {
        const rel = path.relative(rootDir, path.resolve(componentDir, importPath));
        if (!rel || rel.startsWith('..') || path.isAbsolute(rel)) {
          if (onUnresolved) onUnresolved(importPath);
          return match;
        }
        topDir = rel.split(path.sep)[0];
      } else {
        topDir = importPath.replace(/^\.\.\//, '').split('/')[0];
      }
      return `${prefix}${ownerPackage}/${topDir}${suffix}`;
    },
  );
}

/**
 * Build the maintainer feedback note for a swizzled component.
 * @param {string} component
 * @param {string|undefined} issuesUrl
 * @returns {{issuesUrl: string, ghCommand?: string} | null}
 */
function buildFeedback(component, issuesUrl) {
  if (!issuesUrl) return null;
  /** @type {{issuesUrl: string, ghCommand?: string}} */
  const feedback = {issuesUrl};
  const match = issuesUrl.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues(?:\/new)?\/?$/,
  );
  if (match && checkGhCli()) {
    const [, owner, repo] = match;
    feedback.ghCommand = `gh issue create --repo ${owner}/${repo} --title "[${component}] Swizzle feedback"`;
  }
  return feedback;
}

/**
 * Load the configured integrations + core issues URL for `cwd`, swallowing any
 * config errors so swizzle never hard-fails on a malformed/absent config.
 * @param {string} cwd
 * @returns {Promise<{loadedIntegrations: import('../../lib/integrations.mjs').LoadedIntegration[], issuesUrl: string|undefined, project: Project|null}>}
 */
async function loadConfigSafely(cwd) {
  try {
    const project = await Project.load(cwd);
    return {
      loadedIntegrations: project.loadedIntegrations,
      issuesUrl: project.config.issuesUrl,
      project,
    };
  } catch {
    return {loadedIntegrations: [], issuesUrl: undefined, project: null};
  }
}

/**
 * Scan the consumer's node_modules for EXTERNAL Astryx packages — the ones that
 * opt in through their own package.json (`"astryx": {"docs": "./src"}`) rather
 * than by being listed as a configured integration (#2090). Reuses the same
 * scanner `discover` uses.
 *
 * Opts into ALL_DOC_SUFFIXES: swizzle only ever LOCATES the doc file (to find
 * the component's directory) and then excludes it from the copy, so accepting
 * `.doc.ts` here is safe. `discover` deliberately keeps the narrower default —
 * it `import()`s the doc, which Node cannot do for a `.ts` under node_modules.
 *
 * @param {string} cwd
 * @returns {import('../../lib/package-scanner.mjs').ScannedPackage[]}
 */
function scanExternalPackages(cwd) {
  const externals = discoverExternalPackages(cwd).map(ext => ({
    name: ext.name,
    category: ext.category,
    docsDir: ext.docsDir,
  }));
  if (externals.length === 0) return [];
  return scanAllPackages([], externals, {docSuffixes: ALL_DOC_SUFFIXES});
}

/**
 * Build the set of OWNER packages that provide a component named `name` across
 * core, every loaded integration, and every discovered external package.
 * @param {string|null} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} loadedIntegrations
 * @param {import('../../lib/package-scanner.mjs').ScannedPackage[]} externalPackages
 * @param {string} name
 * @param {string|undefined} coreIssuesUrl
 * @returns {Array<{package: string, sourceDir: string|null, rootDir: string|null, ownerPackage: string, issuesUrl: string|undefined, componentName?: string}>}
 */
function resolveOwners(
  coreDir,
  loadedIntegrations,
  externalPackages,
  name,
  coreIssuesUrl,
) {
  const owners = [];
  if (coreDir) {
    const coreSrc = path.join(coreDir, 'src');
    const coreComponentDir = path.join(coreSrc, name);
    if (fs.existsSync(coreComponentDir)) {
      owners.push({
        package: CORE_PACKAGE,
        sourceDir: coreComponentDir,
        // Escaping imports are named against this: `src/theme/x` -> `/theme`.
        rootDir: coreSrc,
        ownerPackage: CORE_PACKAGE,
        issuesUrl: coreIssuesUrl || DEFAULT_ISSUES_URL,
      });
    }
  }
  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, name);
    if (!docPath) continue;
    const sourcePath = findIntegrationComponentSource(integration, name);
    owners.push({
      package: integration.name,
      sourceDir: sourcePath ? path.dirname(sourcePath) : null,
      rootDir: integration.components ?? null,
      ownerPackage: integration.name,
      issuesUrl: integration.issuesUrl,
    });
  }
  // Fallthrough: external `astryx.docs` packages. A package configured as an
  // integration is already recorded above; don't list it twice (that would
  // read as false ambiguity).
  const alreadyOwned = new Set(owners.map(o => o.package));
  for (const pkg of externalPackages) {
    if (alreadyOwned.has(pkg.name)) continue;
    const hit = findComponentInPackages([pkg], name, {
      docSuffixes: ALL_DOC_SUFFIXES,
    });
    if (!hit) continue;
    // Source lives alongside the doc, same same-stem convention integrations
    // use. A doc sitting directly at the docs root has no isolated component
    // directory, so there is nothing safe to copy — recorded as source-less
    // rather than copying the package's whole src tree.
    const docDir = path.dirname(hit.docPath);
    const hasOwnDir = path.resolve(docDir) !== path.resolve(pkg.docsDir);
    const sourceFile = path.join(docDir, `${hit.componentName}.tsx`);
    owners.push({
      package: pkg.name,
      sourceDir: hasOwnDir && fs.existsSync(sourceFile) ? docDir : null,
      // The docs root is the package's subpath origin: a component nested at
      // `src/components/AppShell` names `../../theme/x` as `<pkg>/theme`.
      rootDir: pkg.docsDir,
      ownerPackage: pkg.name,
      issuesUrl: undefined,
      // The lookup is case-insensitive, so the package's own casing is the
      // authority for the ejected directory name — not what the user typed.
      componentName: hit.componentName,
    });
  }
  return owners;
}

/** @param {string} file */
function isExcludedFromCopy(file) {
  return (
    file.includes('.test.') || file.includes('.doc.') || file === 'README.md'
  );
}

/**
 * List swizzlable components, or copy one component's source for customization.
 *
 * @param {string} [component] bare or XDS-prefixed component name; omit to list
 * @param {{cwd?: string, output?: string, package?: string, list?: boolean, overwrite?: boolean}} [options]
 * @returns {Promise<import('../../types/swizzle').SwizzleListResponse | import('../../types/swizzle').SwizzleCopyResponse>}
 */
export async function swizzle(component, options = {}) {
  const {
    cwd = process.cwd(),
    output = './components/astryx',
    package: pkg,
    list = false,
    overwrite = false,
  } = options;

  const coreDir = findCoreDir(cwd);
  const externalPackages = scanExternalPackages(cwd);
  const {loadedIntegrations, project} = await loadConfigSafely(cwd);
  // Core is only *required* when nothing else is swizzleable: an integration or
  // an external `astryx.docs` package can own the component on its own (#2090).
  if (
    !coreDir &&
    externalPackages.length === 0 &&
    loadedIntegrations.length === 0
  ) {
    throw new AstryxError(
      'Could not find @astryxdesign/core package. Make sure you are inside the design system monorepo or have @astryxdesign/core installed.',
      [],
      ERROR_CODES.ERR_CORE_NOT_FOUND,
    );
  }

  // Every owner swizzle can resolve from, so the list and the not-found
  // suggestions describe what the command will actually accept. Integration
  // components were swizzleable but invisible here.
  const components = [
    ...new Set([
      ...(coreDir ? listComponents(coreDir) : []),
      ...loadedIntegrations.flatMap(integration =>
        discoverIntegrationComponents(integration).map(c => c.name),
      ),
      ...externalPackages.flatMap(ext => ext.components),
    ]),
  ].sort();

  if (list || !component) {
    return {type: 'swizzle.list', data: components};
  }

  const dirName = component.replace(/^XDS/, '');

  const coreIssuesUrl = project
    ? project.issuesUrl({package: CORE_PACKAGE})
    : undefined;
  const allOwners = resolveOwners(
    coreDir,
    loadedIntegrations,
    externalPackages,
    dirName,
    coreIssuesUrl,
  );

  if (allOwners.length === 0) {
    throw new AstryxError(
      `Component "${component}" not found.`,
      components.slice(0, 10).map(n => ({name: n})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

  // An owner with no copyable source can never satisfy a swizzle, so it must not
  // create ambiguity: a package that only DOCUMENTS a name core also owns used
  // to turn a working `swizzle Button` into ERR_AMBIGUOUS_COMPONENT, and then
  // offer itself as one of the two ways out. Such owners stay reachable through
  // an explicit `--package` (which still reports ERR_NO_SOURCE, the honest
  // answer) and still answer on their own when nobody else owns the name.
  const swizzleable = allOwners.filter(
    o => o.sourceDir && fs.existsSync(o.sourceDir),
  );
  const candidates = swizzleable.length > 0 ? swizzleable : allOwners;

  let owner;
  if (pkg) {
    owner = allOwners.find(o => o.package === pkg);
    if (!owner) {
      throw new AstryxError(
        `Component "${dirName}" is not provided by package "${pkg}".`,
        allOwners.map(o => ({name: o.package, reason: 'provides this component'})),
        ERROR_CODES.ERR_UNKNOWN_COMPONENT,
      );
    }
  } else if (candidates.length > 1) {
    throw new AstryxError(
      `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      candidates.map(o => ({name: o.package, reason: 'provides this component'})),
      ERROR_CODES.ERR_AMBIGUOUS_COMPONENT,
    );
  } else {
    owner = candidates[0];
  }

  if (!owner.sourceDir || !fs.existsSync(owner.sourceDir)) {
    throw new AstryxError(
      `No source found for "${dirName}" in package "${owner.package}".`,
      [],
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  const componentDir = owner.sourceDir;

  // The ejected directory name is part of the output contract, so it uses the
  // OWNER's canonical casing where the owner supplies one (external packages
  // are matched case-insensitively). Core and integration owners resolve by
  // exact name and carry no `componentName`, so they keep `dirName` — the
  // argument with only the `XDS` prefix stripped.
  const outName = owner.componentName ?? dirName;

  // Path-safety: --output must resolve inside cwd.
  let outputBase;
  try {
    outputBase = assertWithin(output, cwd, {label: 'output directory'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }
  const outputDir = path.join(outputBase, outName);

  // Pre-flight overwrite check before any mkdir/writeFile.
  const sourceFiles = fs.readdirSync(componentDir).filter(file => {
    if (isExcludedFromCopy(file)) return false;
    return fs.statSync(path.join(componentDir, file)).isFile();
  });
  const existingFiles = sourceFiles.filter(f =>
    fs.existsSync(path.join(outputDir, f)),
  );
  if (existingFiles.length > 0 && !overwrite) {
    const relOutputForMsg = path.relative(cwd, outputDir) || '.';
    throw new AstryxError(
      `Refusing to overwrite ${existingFiles.length} existing file(s) in ${relOutputForMsg}/. ` +
        `Re-run with --overwrite (or -f) to replace them.`,
      [],
      ERROR_CODES.ERR_FILE_EXISTS,
    );
  }

  fs.mkdirSync(outputDir, {recursive: true});

  const files = fs.readdirSync(componentDir);
  let copied = 0;
  let usesStyleX = false;
  /** Imports that escape the owner package, so no subpath can name them. */
  const unresolved = new Set();
  for (const file of files) {
    if (isExcludedFromCopy(file)) continue;
    const srcPath = path.join(componentDir, file);
    if (!fs.statSync(srcPath).isFile()) continue;
    let content = fs.readFileSync(srcPath, 'utf-8');
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      content = rewriteImports(content, owner.ownerPackage, {
        componentDir,
        rootDir: owner.rootDir ?? undefined,
        onUnresolved: specifier => unresolved.add(specifier),
      });
    }
    if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      content.includes('@stylexjs/stylex')
    ) {
      usesStyleX = true;
    }
    fs.writeFileSync(path.join(outputDir, file), content);
    copied++;
  }

  const relOutput = path.relative(cwd, outputDir);
  const copiedFiles = files.filter(
    f =>
      !isExcludedFromCopy(f) &&
      fs.statSync(path.join(componentDir, f)).isFile(),
  );
  const feedback = buildFeedback(outName, owner.issuesUrl);

  /** @type {import('../../types/swizzle').SwizzleCopyResponse['data']} */
  const data = {
    component: outName,
    package: owner.package,
    outputDir: relOutput,
    filesCopied: copied,
    files: copiedFiles.map(f => f),
    usesStyleX,
  };
  if (feedback) data.feedback = feedback;
  // Only present when something needs the caller's attention — an import that
  // pointed outside the owner package was copied verbatim and will not resolve
  // from its new home.
  if (unresolved.size > 0) data.unresolvedImports = [...unresolved];
  return {type: 'swizzle.copy', data};
}
