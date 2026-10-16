// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file swizzle.copy leaf — copy a component's source into the consumer project
 * for customization, rewriting escaping relative imports to the OWNER package's
 * subpaths.
 *
 * Side-effecting: writes files and returns a `swizzle.copy` receipt describing
 * what it did. Shared core discovery + component listing come from
 * api/swizzle/_adapter.mjs; everything here (owner resolution, the copy, import
 * rewriting, StyleX detection, maintainer feedback) is copy-specific. Errors
 * throw AstryxError (stable code + suggestions). All human prose /
 * package-manager prefixing lives in the CLI renderer.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {resolveComponentReplacement, resolveCore} from '../_adapter.mjs';
import {assertWithin, sanitizeName, PathSafetyError} from '../../../foundation/fs/path-safety.mjs';
import {checkGhCli} from '../_github.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {
  CORE_PACKAGE,
  findIntegrationComponentDoc,
  findIntegrationComponentSource,
} from '../../../foundation/discovery/component-discovery.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {AstryxError, writeFailed} from '../../error.mjs';

/** Default issue tracker for maintainer feedback after swizzling. */
const DEFAULT_ISSUES_URL = 'https://github.com/facebook/astryx/issues/new';

/**
 * StyleX `.stylex` modules that use `stylex.defineVars` — these define CSS
 * custom properties that themes override. Vendoring them would create new
 * variable hashes, breaking theme overrides. They MUST be imported from Core
 * so every consumer shares the same variable identity.
 *
 * Every other `.stylex` module uses only `stylex.create` (style-only) and is
 * safe to vendor locally.
 */
const DEFINE_VARS_STYLEX = new Set([
  'utils/focusOutline.stylex',
  'utils/interactionOverlay.stylex',
  'DateInput/tokens.stylex',
  'Layer/layerViewportInset.stylex',
  // theme/tokens.stylex and theme/dataTokens.stylex are already handled by
  // the `parts[0] === 'theme'` branch below.
]);

/**
 * Rewrite relative imports that point outside the component directory to use
 * the OWNER package's subpaths. Imports within the copied directory (./x) are
 * left untouched.
 *
 * e.g. with ownerPackage '@astryxdesign/core':
 *      '../theme/tokens.stylex' -> '@astryxdesign/core/theme/tokens.stylex'
 *      '../utils/mergeProps'     -> '@astryxdesign/core/utils'
 *      '../../locales/en.json'   -> '@astryxdesign/core/locales/en.json'
 *      import('../Tooltip/Tooltip') -> import('@astryxdesign/core/Tooltip')
 *
 * Most sibling dirs are barrels, so the top-dir collapse (`../utils/x` ->
 * `<pkg>/utils`) resolves. Two shapes must NOT be collapsed to the top dir:
 *   - Asset files (`.json`, `.css`): exported by full subpath (e.g.
 *     `./locales/*.json`, `./reset.css`), and collapsing a two-levels-up
 *     `../../locales/x.json` would emit the invalid `<pkg>/..`.
 *   - StyleX modules that define CSS variables (`defineVars`): imported from
 *     Core so theme overrides reach every consumer. Core exports these by
 *     their deep subpath.
 *   - StyleX modules that only create styles (`stylex.create`): vendored
 *     locally alongside the swizzled component so Core needs no public
 *     subpath for them.
 *
 * @param {string} content
 * @param {string} [ownerPackage]
 * @param {{vendoredStylex?: Map<string, string>}} [ctx] when provided,
 *   create-only .stylex imports are rewritten to local `./` paths and their
 *   source locations are recorded in `vendoredStylex` for swizzleCopy to
 *   vendor alongside the component.
 */
export function rewriteImports(content, ownerPackage = CORE_PACKAGE, ctx) {
  /** @param {string} importPath */
  const mapTarget = importPath => {
    // Strip ALL leading `../` so a two-levels-up path never yields `<pkg>/..`.
    const rest = importPath.replace(/^(?:\.\.\/)+/, '');
    const parts = rest.split('/');
    const last = parts[parts.length - 1];
    // Asset files are resolved by exact export / wildcard, never a barrel.
    if (/\.(?:json|css)$/.test(last)) {
      return `${ownerPackage}/${rest}`;
    }
    // StyleX modules: defineVars modules use Core's deep export (theme
    // overrides must share variable identity); create-only modules are
    // vendored locally when a vendoring context is provided.
    if (/\.stylex(?:\.[cm]?[jt]sx?)?$/.test(last)) {
      // Theme tokens are dedicated deep exports.
      if (parts[0] === 'theme') {
        return `${ownerPackage}/${rest}`;
      }
      // Strip the file extension to match the DEFINE_VARS_STYLEX keys.
      const modKey = rest.replace(/\.[cm]?[jt]sx?$/, '');
      if (DEFINE_VARS_STYLEX.has(modKey)) {
        return `${ownerPackage}/${rest}`;
      }
      // Create-only: vendor locally.
      if (ctx?.vendoredStylex) {
        ctx.vendoredStylex.set(importPath, rest);
        return `./${last}`;
      }
      // Fallback when no vendoring context: use the barrel (old behavior).
      return `${ownerPackage}/${parts[0]}`;
    }
    return `${ownerPackage}/${parts[0]}`;
  };
  return content
    .replace(
      /(from\s+['"])(\.\.\/[^'"]+)(['"])/g,
      (_m, prefix, importPath, suffix) =>
        `${prefix}${mapTarget(importPath)}${suffix}`,
    )
    .replace(
      /(import\(\s*['"])(\.\.\/[^'"]+)(['"])/g,
      (_m, prefix, importPath, suffix) =>
        `${prefix}${mapTarget(importPath)}${suffix}`,
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
 * @returns {Promise<{loadedIntegrations: import('../../../foundation/integrations/integrations.mjs').LoadedIntegration[], issuesUrl: string|undefined, project: Project|null}>}
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
 * Build the set of OWNER packages that provide a component named `name` across
 * core + every loaded integration.
 * @param {string} coreDir
 * @param {Array<{name: string, components?: string, issuesUrl?: string}>} loadedIntegrations
 * @param {string} name
 * @param {string|undefined} coreIssuesUrl
 * @returns {Array<{package: string, sourceDir: string|null, ownerPackage: string, issuesUrl: string|undefined}>}
 */
function resolveOwners(coreDir, loadedIntegrations, name, coreIssuesUrl) {
  const owners = [];
  const coreComponentDir = path.join(coreDir, 'src', name);
  if (fs.existsSync(coreComponentDir)) {
    owners.push({
      package: CORE_PACKAGE,
      sourceDir: coreComponentDir,
      ownerPackage: CORE_PACKAGE,
      issuesUrl: coreIssuesUrl || DEFAULT_ISSUES_URL,
    });
  }
  for (const integration of loadedIntegrations) {
    const docPath = findIntegrationComponentDoc(integration, name);
    if (!docPath) continue;
    const sourcePath = findIntegrationComponentSource(integration, name);
    owners.push({
      package: integration.name,
      sourceDir: sourcePath ? path.dirname(sourcePath) : null,
      ownerPackage: integration.name,
      issuesUrl: integration.issuesUrl,
    });
  }
  return owners;
}

/**
 * `assertWithin`, with an escape reported as ERR_PATH_TRAVERSAL.
 * @param {string} target
 * @param {string} cwd
 * @param {{allowAbsolute?: boolean, label: string}} options
 * @returns {string}
 */
function confineWrite(target, cwd, options) {
  try {
    return assertWithin(target, cwd, options);
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }
}

/** @param {string} file */
function isExcludedFromCopy(file) {
  return (
    file.includes('.test.') || file.includes('.doc.') || file === 'README.md'
  );
}

/**
 * Copy one component's source into the consumer project for customization,
 * rewriting escaping relative imports to the owner package's subpaths.
 *
 * @param {string} component bare or XDS-prefixed component name
 * @param {{cwd?: string, output?: string, package?: string, overwrite?: boolean}} [options]
 * @returns {Promise<import('../swizzle.type.mjs').SwizzleCopyResponse>}
 */
export async function swizzleCopy(component, options = {}) {
  const {
    cwd = process.cwd(),
    output = './components/astryx',
    package: pkg,
    overwrite = false,
  } = options;

  const {coreDir, components} = resolveCore(cwd);

  const dirName = component.replace(/^XDS/, '');

  // The component name becomes a path segment in the output dir
  // (path.join(outputBase, dirName)), so a name containing `..` or a separator
  // would escape the assertWithin(output) guard. Reject it up front — a real
  // component name is a bare identifier.
  try {
    sanitizeName(dirName, {label: 'component name'});
  } catch (err) {
    if (err instanceof PathSafetyError) {
      throw new AstryxError(err.message, [], ERROR_CODES.ERR_PATH_TRAVERSAL);
    }
    throw err;
  }

  const {loadedIntegrations, project} = await loadConfigSafely(cwd);
  const coreIssuesUrl = project
    ? project.issuesUrl({package: CORE_PACKAGE})
    : undefined;
  // An active integration replacement answers to the Core name it replaces,
  // bare or qualified by its own package (spec:AST-035 FR11): copy it under its
  // own name. `--package @astryxdesign/core` still copies the Core original.
  if (pkg !== CORE_PACKAGE) {
    const replacement = await resolveComponentReplacement(
      coreDir,
      loadedIntegrations,
      dirName,
    );
    if (
      replacement &&
      (!pkg || (pkg === replacement.package && replacement.name !== dirName))
    ) {
      return swizzleCopy(replacement.name, {
        ...options,
        package: replacement.package,
      });
    }
  }

  const allOwners = resolveOwners(coreDir, loadedIntegrations, dirName, coreIssuesUrl);

  if (allOwners.length === 0) {
    throw new AstryxError(
      `Component "${component}" not found.`,
      components.slice(0, 10).map(n => ({name: n})),
      ERROR_CODES.ERR_UNKNOWN_COMPONENT,
    );
  }

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
  } else if (allOwners.length > 1) {
    throw new AstryxError(
      `Component "${dirName}" is provided by multiple packages. Re-run with --package <pkg> to choose one.`,
      allOwners.map(o => ({name: o.package, reason: 'provides this component'})),
      ERROR_CODES.ERR_AMBIGUOUS_COMPONENT,
    );
  } else {
    owner = allOwners[0];
  }

  if (!owner.sourceDir || !fs.existsSync(owner.sourceDir)) {
    throw new AstryxError(
      `No source found for "${dirName}" in package "${owner.package}".`,
      [],
      ERROR_CODES.ERR_NO_SOURCE,
    );
  }

  const componentDir = owner.sourceDir;

  // Path-safety: every write target resolves inside cwd, not just --output. An
  // existing component directory or file may be a symlink out of cwd.
  const outputBase = confineWrite(output, cwd, {label: 'output directory'});
  const outputDir = path.join(outputBase, dirName);

  // Pre-flight path and overwrite checks before any mkdir/writeFile.
  const sourceFiles = fs.readdirSync(componentDir).filter(file => {
    if (isExcludedFromCopy(file)) return false;
    return fs.statSync(path.join(componentDir, file)).isFile();
  });
  for (const file of sourceFiles) {
    confineWrite(path.join(outputDir, file), cwd, {
      allowAbsolute: true,
      label: 'output file',
    });
  }
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

  const outputDirExisted = fs.existsSync(outputDir);
  try {
    fs.mkdirSync(outputDir, {recursive: true});
  } catch (err) {
    throw writeFailed(outputDir, cwd, err);
  }

  const files = fs.readdirSync(componentDir);
  let copied = 0;
  let usesStyleX = false;
  // Track .stylex modules that need to be vendored alongside the component.
  // rewriteImports populates this when it encounters a non-theme .stylex import
  // from outside the component directory.
  /** @type {Map<string, string>} importPath -> rest (resolved relative to src/) */
  const vendoredStylex = new Map();
  const vendorCtx = {vendoredStylex};
  // A copy that fails part-way undoes what it already wrote, so the report is
  // true and a retry does not trip over half a component. Each entry keeps
  // the bytes the file had before this run (null when the copy created it).
  /** @type {Array<{dest: string, original: Buffer|null}>} */
  const written = [];
  for (const file of files) {
    if (isExcludedFromCopy(file)) continue;
    const srcPath = path.join(componentDir, file);
    if (!fs.statSync(srcPath).isFile()) continue;
    let content = fs.readFileSync(srcPath, 'utf-8');
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      content = rewriteImports(content, owner.ownerPackage, vendorCtx);
    }
    if (
      (file.endsWith('.ts') || file.endsWith('.tsx')) &&
      content.includes('@stylexjs/stylex')
    ) {
      usesStyleX = true;
    }
    const dest = path.join(outputDir, file);
    try {
      // The snapshot read is guarded too: a destination that cannot be read
      // back (no permission, or a directory with this name) must still undo
      // the earlier writes and report ERR_WRITE_FAILED.
      const original = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
      written.push({dest, original});
      fs.writeFileSync(dest, content);
    } catch (err) {
      const unrestored = undoCopy(written);
      if (!outputDirExisted) {
        try {
          fs.rmdirSync(outputDir);
        } catch {
          // Not empty (something could not be undone), or already gone.
        }
      }
      throw writeFailed(dest, cwd, err, unrestored);
    }
    copied++;
  }

  // Vendor the create-only .stylex dependencies: copy each source file into
  // the output dir so the swizzled component can import it as
  // `./filename.stylex`. Vendored files' own imports are rewritten:
  //   - Non-stylex deps → the owner barrel (e.g. @astryxdesign/core/utils)
  //   - theme .stylex → the Core deep export (theme overrides must share identity)
  //   - defineVars .stylex → the Core deep export (same reason)
  //   - Type-only imports from internal paths (e.g. SpacingStep from utils/types)
  //     are inlined because the barrel may not re-export them.
  const srcRoot = path.join(coreDir, 'src');
  /** @type {Set<string>} */
  const alreadyVendored = new Set();
  // Process vendoredStylex iteratively: a vendored file may itself import
  // another create-only .stylex module that also needs vendoring.
  let toVendor = [...vendoredStylex.entries()];
  while (toVendor.length > 0) {
    const nextRound = [];
    for (const [, rest] of toVendor) {
      if (alreadyVendored.has(rest)) continue;
      alreadyVendored.add(rest);
      // rest is e.g. "utils/focusOutline.stylex" — resolve to the .ts source
      const srcFile = path.join(srcRoot, rest + '.ts');
      if (!fs.existsSync(srcFile)) continue;
      const fileName = path.basename(rest) + '.ts';
      let content = fs.readFileSync(srcFile, 'utf-8');
      // Inline type-only imports that the barrel doesn't re-export.
      // SpacingStep from ../utils/types is the known case.
      content = content.replace(
        /import\s+type\s*\{[^}]*SpacingStep[^}]*\}\s*from\s*['"][^'"]+['"]\s*;?\n?/g,
        'type SpacingStep = 0 | 0.5 | 1 | 1.5 | 2 | 3 | 4 | 5 | 6 | 8 | 10;\n',
      );
      // Rewrite this file's own imports with vendoring context so any
      // transitive create-only .stylex deps are also collected.
      /** @type {Map<string, string>} */
      const transitiveVendored = new Map();
      content = rewriteImports(content, owner.ownerPackage, {
        vendoredStylex: transitiveVendored,
      });
      // Queue any transitive deps for the next round.
      for (const entry of transitiveVendored) {
        if (!alreadyVendored.has(entry[1])) {
          vendoredStylex.set(entry[0], entry[1]);
          nextRound.push(entry);
        }
      }
      const dest = path.join(outputDir, fileName);
      try {
        const original = fs.existsSync(dest) ? fs.readFileSync(dest) : null;
        written.push({dest, original});
        fs.writeFileSync(dest, content);
      } catch (err) {
        const unrestored = undoCopy(written);
        if (!outputDirExisted) {
          try { fs.rmdirSync(outputDir); } catch { /* */ }
        }
        throw writeFailed(dest, cwd, err, unrestored);
      }
      copied++;
      if (content.includes('@stylexjs/stylex')) usesStyleX = true;
    }
    toVendor = nextRound;
  }

  const relOutput = path.relative(cwd, outputDir);
  const copiedFiles = files.filter(
    f =>
      !isExcludedFromCopy(f) &&
      fs.statSync(path.join(componentDir, f)).isFile(),
  );
  const feedback = buildFeedback(dirName, owner.issuesUrl);

  /** @type {import('../swizzle.type.mjs').SwizzleCopyResponse['data']} */
  const data = {
    component: dirName,
    package: owner.package,
    outputDir: relOutput,
    filesCopied: copied,
    files: copiedFiles.map(f => f),
    usesStyleX,
  };
  if (feedback) data.feedback = feedback;
  return {type: 'swizzle.copy', package: data.package, data};
}

/**
 * Undo the writes of a copy that failed part-way, newest first: delete the
 * files the copy created and put back the bytes of the files it replaced. A
 * file whose bytes are already the original ones is left alone, so a write
 * that failed before changing anything is not reported as unrestored.
 *
 * @param {Array<{dest: string, original: Buffer|null}>} written
 * @returns {string[]} the files it could not restore
 */
function undoCopy(written) {
  /** @type {string[]} */
  const unrestored = [];
  for (const {dest, original} of [...written].reverse()) {
    try {
      if (original == null) {
        fs.rmSync(dest, {force: true});
        continue;
      }
      /** @type {Buffer|null} */
      let current = null;
      try {
        current = fs.readFileSync(dest);
      } catch {
        current = null;
      }
      if (current == null || !current.equals(original)) {
        fs.writeFileSync(dest, original);
      }
    } catch {
      unrestored.push(dest);
    }
  }
  return unrestored;
}
