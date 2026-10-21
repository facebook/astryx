// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file On-disk contribution checks for a LOADED integration.
 *
 * These validators live in foundation rather than beside the
 * Doctor integration validation because foundation itself needs them:
 * `Project` collects integration issues while assembling components/templates,
 * and `integration-warnings` nudges about them on ordinary commands. Keeping
 * them here means those callers no longer reach up into `api/`.
 *
 * The base manifest schema is not re-validated here — `loadIntegrations` already
 * did that. Optional contributions such as `agentDocs` carry their own error
 * marker so a bad contribution is reported without withdrawing valid roots.
 * What is re-checked is the on-disk contributions (roots +
 * codemods/templates/components/docs/themes), because those regress independently of the
 * manifest: a deleted directory, a template that lost its source file.
 *
 * @input a loaded-integration-shaped object (absolute contribution roots + identity)
 * @output AstryxIntegrationIssue[]
 * @position packages/cli/foundation/integrations — shared contribution validators
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {parse as parseModule} from '@babel/parser';
import {isValidSemver} from '../env/semver.mjs';
import {findProjectCoreDir} from '../fs/paths.mjs';
import {
  contributionFiles,
  findSourceOnlyCandidates,
  findTemplateSourceOnlyCandidates,
} from './contribution-inventory.mjs';
import {
  CODEMOD_FILE_RE,
  CODEMOD_SKIP_DIRS,
  CODEMOD_TEST_RE,
  createFixContext,
  DOC_CANDIDATE_RE,
  heldRootFix,
  newComponentDocNote,
  notACodemodFix,
  notAComponentFix,
  readContributionStamp,
  sharedCodemodsRootFix,
  stampOf,
  themeImporting,
  TEMPLATE_CANDIDATE_RE,
} from './contribution-fixes.mjs';
import {MANIFEST_BASENAMES} from './integrations.mjs';
import {discoverIntegrationCodemods} from '../../assets/codemods/integration-discovery.mjs';
import {discoverIntegrationTemplatesForOne} from '../discovery/template-adapter.mjs';
import * as componentDiscovery from '../discovery/component-discovery.mjs';
import {loadComponentDoc} from '../discovery/component-loader.mjs';
import {
  moduleExportNames,
  moduleExportsName,
  moduleExportVerdict,
} from '../discovery/module-exports.mjs';
import {discoverIntegrationDocs} from '../discovery/docs-discovery.mjs';
import {discoverIntegrationThemes} from '../discovery/theme-discovery.mjs';

/**
 * @typedef {import('./issue').AstryxIntegrationIssue} Issue
 * @typedef {import('./integrations.mjs').LoadedIntegration} LoadedIntegration
 */

/** Stable issue code for an invalid optional agent-doc contribution. */
export const INVALID_AGENT_DOCS = 'invalid_agent_docs';

/** Stable issue code for a `cliCommand` that was ignored as invalid. */
export const INVALID_CLI_COMMAND = 'invalid_cli_command';

/** Stable issue code for a package whose provider ID is already claimed. */
export const DUPLICATE_PROVIDER = 'duplicate_provider';

/** @param {string} code @param {string} message @returns {Issue} */
export function issueError(code, message) {
  return {code, severity: 'error', message};
}

/** @param {string} code @param {string} message @returns {Issue} */
export function issueWarning(code, message) {
  return {code, severity: 'warning', message};
}

/**
 * Report the manifest keys this CLI does not know.
 *
 * A WARNING, deliberately: an integration is published once and installed
 * against many CLI versions, so a key introduced by a later CLI arrives here
 * routinely and means only that this CLI cannot act on it. It used to be fatal
 * — `.strict()` rejected the manifest, and a manifest that fails to parse
 * contributes nothing at all, so one added field took the package's
 * components, templates and codemods down with it on every older consumer
 * (#5119). The fix is upgrading the CLI, which is what the message says.
 *
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
function checkUnknownKeys(integration, issues) {
  const keys = integration.__unknownKeys ?? [];
  if (keys.length === 0) return;
  issues.push(
    issueWarning(
      'unknown_manifest_key',
      `This CLI does not know the manifest ${keys.length === 1 ? 'key' : 'keys'} ` +
        `${keys.map(key => `"${key}"`).join(', ')}, so ${keys.length === 1 ? 'it is' : 'they are'} ` +
        `ignored — everything else in the manifest still applies. This usually ` +
        `means the integration was published against a newer Astryx CLI than ` +
        `this project resolves; upgrading @astryxdesign/cli picks it up.`,
    ),
  );
}

/** @param {{__manifestFile?: string}} integration */
function manifestName(integration) {
  return integration.__manifestFile
    ? path.basename(integration.__manifestFile)
    : 'the integration manifest';
}

/**
 * Why a declared root cannot be read as a folder, or null when it can.
 * A missing root keeps its own issue; a root that is a file or that the
 * user running astryx cannot read used to surface as a raw errno from
 * whichever check touched it first, or end validation outright.
 * @param {string} root
 * @returns {{kind: 'missing'} | {kind: 'not-a-folder'} | {kind: 'unreadable', code: string} | null}
 */
export function rootProblem(root) {
  let stat;
  try {
    stat = fs.statSync(root);
  } catch (err) {
    const code = /** @type {any} */ (err)?.code;
    return code === 'ENOENT' || code === 'ENOTDIR'
      ? {kind: 'missing'}
      : {kind: 'unreadable', code: String(code ?? 'unknown error')};
  }
  if (!stat.isDirectory()) return {kind: 'not-a-folder'};
  try {
    fs.accessSync(root, fs.constants.R_OK | fs.constants.X_OK);
  } catch (err) {
    return {
      kind: 'unreadable',
      code: String(/** @type {any} */ (err)?.code ?? 'unknown error'),
    };
  }
  return null;
}

/**
 * Verify each declared contribution root is a folder Astryx can read. A
 * declared-but-missing root is a `missing_root` error, a file is an
 * `invalid_root` error, and a folder that cannot be read is an
 * `unreadable_root` error. The contribution checks skip all three.
 * A readable root reached through a symlinked folder is a `symlinked_root`
 * warning: npm pack does not follow it, so the published package loses it.
 * @param {{components?: string, templates?: string, codemods?: string, docs?: string, themes?: string, __manifestFile?: string}} resolved
 *   absolute resolved roots (undefined when not declared)
 * @param {Issue[]} issues
 * @param {string} [packageDir] the package the roots belong to
 */
function checkRoots(resolved, issues, packageDir) {
  const kinds = /** @type {const} */ ([
    'components',
    'templates',
    'codemods',
    'docs',
    'themes',
  ]);
  for (const kind of kinds) {
    const root = resolved[kind];
    if (root == null) continue;
    const problem = rootProblem(root);
    if (problem == null) {
      const link = packageDir ? symlinkedFolder(root, packageDir) : null;
      if (link && packageDir) {
        const shown = slash(path.relative(packageDir, link.path));
        const realPackage = fs.realpathSync(packageDir);
        const target = slash(path.relative(realPackage, link.target));
        const realRoot = slash(
          path.relative(realPackage, fs.realpathSync(root)),
        );
        const outside = target.startsWith('../') || path.isAbsolute(target);
        const fix = outside
          ? 'replace the link with a real folder holding its files'
          : `replace the link with the folder itself (move ${target}/ to ${shown}/), or set \`${kind}: './${realRoot}'\` in ${manifestName(resolved)}`;
        issues.push(
          issueWarning(
            'symlinked_root',
            `Declared ${kind} root "${slash(path.relative(packageDir, root))}" is reached through the symlink "${shown}" (to "${target}"). Astryx follows it locally, but npm pack does not follow a symlinked folder, so the published package ships none of these files. Fix: ${fix}.`,
          ),
        );
      }
      continue;
    }
    if (problem.kind === 'missing') {
      issues.push(
        issueError(
          'missing_root',
          `Declared ${kind} root does not exist on disk: ${root}`,
        ),
      );
    } else if (problem.kind === 'not-a-folder') {
      issues.push(
        issueError(
          'invalid_root',
          `Declared ${kind} root is a file, not a folder: ${root}. Fix: point "${kind}" in the manifest at the folder that holds them.`,
        ),
      );
    } else {
      issues.push(
        issueError(
          'unreadable_root',
          `Declared ${kind} root cannot be read (${problem.code}): ${root}. Fix: make it readable by the user running astryx.`,
        ),
      );
    }
  }
}

/** @param {string} file */
function slash(file) {
  return file.split(path.sep).join('/');
}

/**
 * The first folder on the way from the package to `root` (the root itself
 * included) that is a symlink, with where it points, or null.
 * @param {string} root absolute
 * @param {string} packageDir absolute
 * @returns {{path: string, target: string} | null}
 */
export function symlinkedFolder(root, packageDir) {
  const relative = path.relative(packageDir, root);
  if (
    relative === '' ||
    relative.startsWith('..') ||
    path.isAbsolute(relative)
  ) {
    return null;
  }
  let current = packageDir;
  for (const segment of relative.split(path.sep)) {
    current = path.join(current, segment);
    try {
      if (fs.lstatSync(current).isSymbolicLink()) {
        return {path: current, target: fs.realpathSync(current)};
      }
    } catch {
      return null;
    }
  }
  return null;
}

/**
 * Validate the integration's codemods via the landed discovery. Discovery is
 * strict (throws on bad export / duplicate id); we convert any throw into an
 * `invalid_codemod` error.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkCodemods(integration, issues) {
  if (!integration.codemods || rootProblem(integration.codemods)) return;
  const context = integration.__packageDir
    ? createFixContext(integration.__packageDir, integration)
    : null;
  const shared = context && sharedCodemodsRootFix(context);
  for (const entry of fs.readdirSync(integration.codemods, {
    withFileTypes: true,
  })) {
    if (
      entry.isFile() &&
      CODEMOD_FILE_RE.test(entry.name) &&
      !CODEMOD_TEST_RE.test(entry.name) &&
      // The manifest sits beside package.json and is never a codemod.
      !(
        integration.codemods === integration.__packageDir &&
        MANIFEST_BASENAMES.includes(entry.name)
      )
    ) {
      const shown = path
        .relative(
          integration.__packageDir ?? path.dirname(integration.codemods),
          path.join(integration.codemods, entry.name),
        )
        .split(path.sep)
        .join('/');
      const root = path.dirname(shown);
      const full = path.join(integration.codemods, entry.name);
      const stamp =
        context &&
        (DOC_CANDIDATE_RE.test(entry.name) ||
          TEMPLATE_CANDIDATE_RE.test(entry.name))
          ? stampOf(context, full)
          : null;
      // A theme's entry module may sit beside its descriptor.
      const themeDoc = ['.doc.mjs', '.doc.ts', '.doc.js']
        .map(suffix => full.replace(/\.(?:ts|mjs|js)$/u, suffix))
        .find(candidate => candidate !== full && fs.existsSync(candidate));
      const themeStamp =
        context && !stamp && themeDoc ? stampOf(context, themeDoc) : null;
      let fix = `Fix: move it into the folder named for the version it migrates to, for example ${root}/1.2.0/${entry.name}.`;
      if (shared) fix = sharedCodemodsRootFix(context, entry.name) ?? fix;
      else if (context && stamp) fix = notACodemodFix(context, full, stamp);
      else if (context && themeDoc && themeStamp?.type === 'theme') {
        fix = notACodemodFix(context, themeDoc, themeStamp, entry.name);
      } else if (context) {
        const owner = themeImporting(context, full);
        if (owner) {
          fix = notACodemodFix(
            context,
            owner.doc,
            owner.stamp,
            owner.source,
            entry.name,
          );
        }
      }
      issues.push(
        issueWarning(
          'codemod_outside_version',
          `Codemod file "${shown}" is outside a version folder, so upgrade will never load it. ${fix}`,
        ),
      );
    }
    if (
      entry.isDirectory() &&
      !CODEMOD_SKIP_DIRS.has(entry.name) &&
      !isValidSemver(entry.name)
    ) {
      const fix =
        shared ??
        (context &&
          heldRootFix(context, path.join(integration.codemods, entry.name))) ??
        'Fix: rename it to the exact version its codemods migrate to.';
      issues.push(
        issueError(
          'invalid_codemod_version',
          `Codemod folder "${entry.name}" is not an exact semver version such as 1.2.0. ${fix}`,
        ),
      );
    }
  }
  try {
    await discoverIntegrationCodemods([integration]);
  } catch (err) {
    issues.push(
      issueError('invalid_codemod', /** @type {any} */ (err).message),
    );
  }
}

/**
 * Validate the integration's templates via the landed discovery. Per-template
 * problems are reported as `invalid_template` errors.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkTemplates(integration, issues) {
  if (!integration.templates || rootProblem(integration.templates)) return;
  try {
    const {errors} = await discoverIntegrationTemplatesForOne(integration);
    for (const e of errors) {
      issues.push({
        code: e.code ?? 'invalid_template',
        severity: e.severity ?? 'error',
        message: e.message,
      });
    }
  } catch (err) {
    issues.push(
      issueError('invalid_template', /** @type {any} */ (err).message),
    );
  }
  checkTemplateSourcesWithoutDoc(integration, issues);
}

/**
 * The component names each of a package's templates gives in `exampleFor`
 * and `componentsUsed`, judged against the components `astryx component`
 * finds: the package's own, and every doc it resolves in Core. A name the
 * template imports needs no doc of its own. A name neither has is an
 * `unknown_block_component` finding, since the template list and the
 * block's search keywords then give a name no one can look up. A name the
 * template may reach through anything the walk does not model, and, without
 * Core installed, a name the package does not have, cannot be judged and is
 * listed in `unchecked` instead.
 * @param {LoadedIntegration} integration
 * @returns {Promise<{findings: Array<{docPath: string, name: string, message: string}>, unchecked: Array<{docPath: string, name: string, reason: string}>}>}
 */
async function judgeBlockComponents(integration) {
  /** @type {Array<{docPath: string, name: string, message: string}>} */
  const findings = [];
  /** @type {Array<{docPath: string, name: string, reason: string}>} */
  const unchecked = [];
  const root = integration.templates;
  if (!root || rootProblem(root)) return {findings, unchecked};
  let templates;
  try {
    ({templates} = await discoverIntegrationTemplatesForOne(integration));
  } catch {
    return {findings, unchecked};
  }
  /** @type {Set<string>} */
  let own;
  try {
    own = new Set(
      componentDiscovery
        .discoverIntegrationComponents(integration)
        .map(record => record.name),
    );
  } catch {
    return {findings, unchecked};
  }
  // The Core installed beside the package, never the one the CLI carries:
  // a name is judged against the Core the package's users install.
  const coreDir = findProjectCoreDir(integration.__packageDir ?? root);
  /** @type {Map<string, boolean>} */
  const inCore = new Map();
  /** @param {string} name */
  const coreHas = name => {
    if (!coreDir) return false;
    if (!inCore.has(name)) {
      let found;
      try {
        found = componentDiscovery.findComponentReadme(coreDir, name) != null;
      } catch {
        found = false;
      }
      inCore.set(name, found);
    }
    return /** @type {boolean} */ (inCore.get(name));
  };
  for (const template of templates) {
    const fields = [
      ...(typeof template.exampleFor === 'string'
        ? [{field: 'exampleFor', name: template.exampleFor}]
        : []),
      ...(Array.isArray(template.componentsUsed) ? template.componentsUsed : [])
        .filter(name => typeof name === 'string')
        .map(name => ({field: 'componentsUsed', name})),
    ];
    if (fields.length === 0) continue;
    const imported = importedNames(template.filePath, integration.name);
    for (const {field, name} of fields) {
      if (own.has(name) || imported.names.has(name)) continue;
      if (coreHas(name)) continue;
      // A name the template may reach through a namespace import, or
      // through a local module this read could not follow, is not judged.
      if (imported.unread.length > 0) {
        unchecked.push({
          docPath: template.docPath,
          name,
          reason: imported.unread[0],
        });
        continue;
      }
      if (!coreDir) {
        unchecked.push({
          docPath: template.docPath,
          name,
          reason:
            'Core is not installed, so its component names cannot be checked.',
        });
        continue;
      }
      findings.push({
        docPath: template.docPath,
        name,
        message: `Template "${template.dirName}" names "${name}" in ${field}, but neither this package nor Core has a component by that name and the template does not import it, so \`astryx template --list\` and the block's search keywords give a component name no one can look up. Fix: use the component's exact name, or remove "${name}" from ${field}.`,
      });
    }
  }
  return {findings, unchecked};
}

/**
 * Visit every node under `node`, depth first.
 * @param {any} node
 * @param {(node: any) => void} visit
 */
function walkNodes(node, visit) {
  if (node == null || typeof node !== 'object') return;
  if (Array.isArray(node)) {
    for (const each of node) walkNodes(each, visit);
    return;
  }
  if (typeof node.type === 'string') visit(node);
  for (const [key, value] of Object.entries(node)) {
    if (
      key === 'loc' ||
      key === 'start' ||
      key === 'end' ||
      key === 'extra' ||
      key === 'leadingComments' ||
      key === 'trailingComments'
    ) {
      continue;
    }
    if (value && typeof value === 'object') walkNodes(value, visit);
  }
}

/** The extensions a local import may leave off, in the order tried. */
const LOCAL_MODULE_EXTENSIONS = ['.tsx', '.ts', '.jsx', '.js', '.mjs'];

/**
 * Libraries that render no component of this package or of Core: React's
 * own exports and StyleX. Importing them, even as a namespace
 * (`import * as stylex`), leaves no name unjudged.
 */
const RENDERLESS_SOURCES = ['react', 'react-dom', '@stylexjs/stylex'];

/**
 * Packages a template may import from without leaving its names unjudged:
 * Core and the renderless libraries. Any other package may render components
 * this check does not see, such as a grid that renders its cards.
 */
const KNOWN_SOURCES = ['@astryxdesign/core', ...RENDERLESS_SOURCES];

/** @param {string} source */
function renderlessSource(source) {
  return RENDERLESS_SOURCES.some(
    known => source === known || source.startsWith(`${known}/`),
  );
}

/**
 * Whether an import source is one whose components this check sees: the
 * package itself, Core, a library that renders none, or a relative helper
 * (followed and read in full on its own).
 * @param {string} source
 * @param {string | undefined} packageName
 */
function knownSource(source, packageName) {
  if (source.startsWith('.')) return true;
  return [...KNOWN_SOURCES, ...(packageName ? [packageName] : [])].some(
    known => source === known || source.startsWith(`${known}/`),
  );
}

/**
 * Every name a template imports, as imported and as bound locally, read
 * without running it, with the names its local helper modules import (a
 * relative import or re-export is followed, so a barrel such as
 * `parts/index.ts` counts). A name is judged only where the template reaches
 * components solely through named imports and re-exports this walk reads:
 * `unread` gives the reason for anything else it meets, which leaves an
 * unresolved name unjudged. That covers a default or namespace import, an
 * alias of an imported binding, a member read off one (in JSX or not,
 * optional or computed), a rendered component it cannot trace to an import,
 * `require()`, a dynamic `import()`, an `export *` from another package, and
 * a local module it cannot read. So does any `default` binding (`import X`,
 * `{default as X}`, `export {default as X} from`) and any import from a
 * package other than this one, Core, or a library that renders no component
 * (see KNOWN_SOURCES). Type-only imports render nothing and are skipped, as
 * is a namespace import of a library that renders no component.
 * @param {string} file
 * @param {string | undefined} packageName the package's own name
 * @returns {{names: Set<string>, unread: string[]}}
 */
function importedNames(file, packageName) {
  /** @type {Set<string>} */
  const names = new Set();
  /** @type {string[]} */
  const unread = [];
  const top = path.dirname(file);
  const shownTop = path.basename(file);
  /** @type {Set<string>} */
  const seen = new Set();
  /** @param {string} current */
  const visit = current => {
    if (seen.has(current)) return;
    seen.add(current);
    const shown = slash(path.relative(top, current)) || shownTop;
    let ast;
    try {
      ast = parseModule(fs.readFileSync(current, 'utf8'), {
        sourceType: 'module',
        plugins: ['typescript', 'jsx'],
        errorRecovery: true,
      });
    } catch {
      unread.push(
        `${shown} could not be read, so the components it renders are not known.`,
      );
      return;
    }
    // A file that parses only with errors recovered may be missing parts.
    if (/** @type {any} */ (ast).errors?.length > 0) {
      unread.push(
        `${shown} does not parse cleanly, so the components it renders are not known.`,
      );
    }
    /** @type {Map<string, string>} local binding -> the module it came from */
    const bindings = new Map();
    for (const node of ast.program.body) {
      const reexport =
        (node.type === 'ExportNamedDeclaration' && node.source != null) ||
        node.type === 'ExportAllDeclaration';
      if (node.type !== 'ImportDeclaration' && !reexport) continue;
      // A type-only import or re-export renders nothing.
      if (
        /** @type {any} */ (node).importKind === 'type' ||
        /** @type {any} */ (node).exportKind === 'type'
      ) {
        continue;
      }
      const source = String(/** @type {any} */ (node).source.value);
      if (!knownSource(source, packageName)) {
        unread.push(
          `${shown} imports from "${source}", another package whose components may render ones this check does not see.`,
        );
      }
      if (node.type === 'ImportDeclaration') {
        for (const specifier of node.specifiers) {
          if (/** @type {any} */ (specifier).importKind === 'type') continue;
          if (specifier.type === 'ImportNamespaceSpecifier') {
            // `import * as stylex`: a library that renders no component.
            if (renderlessSource(source)) continue;
            unread.push(
              `${shown} imports "${source}" as a namespace (${specifier.local.name}), whose component names this check does not read.`,
            );
            continue;
          }
          if (specifier.type === 'ImportDefaultSpecifier') {
            // A default may be any component, under any name.
            unread.push(
              `${shown} imports the default of "${source}" as ${specifier.local.name}, which may be any component.`,
            );
          }
          names.add(specifier.local.name);
          bindings.set(specifier.local.name, source);
          if (specifier.type === 'ImportSpecifier') {
            const imported = specifier.imported;
            const importedName =
              imported.type === 'Identifier' ? imported.name : imported.value;
            if (importedName === 'default') {
              unread.push(
                `${shown} imports the default of "${source}" as ${specifier.local.name}, which may be any component.`,
              );
            } else {
              names.add(importedName);
            }
          }
        }
      } else if (node.type === 'ExportNamedDeclaration') {
        // A barrel: `export {Body} from './Body'` passes Body on, and what
        // Body renders comes from the module it names.
        for (const each of node.specifiers) {
          const specifier = /** @type {any} */ (each);
          if (specifier.exportKind === 'type') continue;
          if (specifier.type !== 'ExportSpecifier') {
            // `export * as UI from`, `export UI from`.
            unread.push(
              `${shown} re-exports "${source}" as a whole (${specifier.exported.type === 'Identifier' ? specifier.exported.name : specifier.exported.value}), whose component names this check does not read.`,
            );
            continue;
          }
          const local =
            specifier.local.type === 'Identifier'
              ? specifier.local.name
              : specifier.local.value;
          const exported =
            specifier.exported.type === 'Identifier'
              ? specifier.exported.name
              : specifier.exported.value;
          if (local === 'default') {
            unread.push(
              `${shown} re-exports the default of "${source}" as ${exported}, which may be any component.`,
            );
          } else {
            names.add(local);
          }
          names.add(exported);
        }
      } else if (!source.startsWith('.')) {
        // `export * from` another package passes on names this check
        // does not list.
        unread.push(
          `${shown} re-exports everything from "${source}", whose component names this check does not read.`,
        );
        continue;
      } else if (/** @type {any} */ (node).exported) {
        // `export * as UI from './parts'`.
        unread.push(
          `${shown} re-exports "${source}" as a whole, whose component names this check does not read.`,
        );
      }
      if (!source.startsWith('.')) continue;
      const base = path.resolve(path.dirname(current), source);
      const target = [
        base,
        ...LOCAL_MODULE_EXTENSIONS.map(extension => `${base}${extension}`),
        ...LOCAL_MODULE_EXTENSIONS.map(extension =>
          path.join(base, `index${extension}`),
        ),
      ].find(candidate => {
        try {
          return fs.statSync(candidate).isFile();
        } catch {
          return false;
        }
      });
      if (!target) {
        unread.push(
          `${shown} imports "${source}", which resolves to no file this check can read.`,
        );
      } else if (LOCAL_MODULE_EXTENSIONS.includes(path.extname(target))) {
        visit(target);
      }
    }
    // Anything this check does not model leaves the names unjudged: what
    // the module renders through a binding, an alias, a member read, a
    // component held in a variable, or a module loaded at runtime.
    /** @type {Set<string>} functions and classes the module declares */
    const declared = new Set();
    walkNodes(ast.program, node => {
      if (
        (node.type === 'FunctionDeclaration' ||
          node.type === 'ClassDeclaration') &&
        node.id?.name
      ) {
        declared.add(node.id.name);
      } else if (
        node.type === 'VariableDeclarator' &&
        node.id?.type === 'Identifier' &&
        [
          'ArrowFunctionExpression',
          'FunctionExpression',
          'ClassExpression',
        ].includes(node.init?.type)
      ) {
        declared.add(node.id.name);
      }
    });
    const from = (/** @type {string} */ name) =>
      bindings.has(name) ? ` (imported from "${bindings.get(name)}")` : '';
    walkNodes(ast.program, node => {
      if (node.type === 'JSXMemberExpression') {
        let object = node.object;
        while (object?.type === 'JSXMemberExpression') object = object.object;
        const name = object?.name ?? 'an object';
        unread.push(
          `${shown} renders members of ${name}${from(name)}, whose names this check does not read.`,
        );
      } else if (
        node.type === 'JSXOpeningElement' &&
        node.name?.type === 'JSXIdentifier' &&
        /^[A-Z]/u.test(node.name.name) &&
        !names.has(node.name.name) &&
        !declared.has(node.name.name)
      ) {
        unread.push(
          `${shown} renders ${node.name.name}, a value this check does not trace to an import.`,
        );
      } else if (
        node.type === 'VariableDeclarator' &&
        node.init?.type === 'Identifier' &&
        bindings.has(node.init.name)
      ) {
        // `const UI = Lib`, `const {Panel} = Lib`: an alias of an import.
        if (node.id?.type === 'Identifier') {
          bindings.set(
            node.id.name,
            /** @type {string} */ (bindings.get(node.init.name)),
          );
        }
        unread.push(
          `${shown} reads ${node.init.name}${from(node.init.name)} into another name, which this check does not follow.`,
        );
      } else if (
        (node.type === 'MemberExpression' ||
          node.type === 'OptionalMemberExpression') &&
        node.object?.type === 'Identifier' &&
        bindings.has(node.object.name)
      ) {
        // `UI.Panel`, `UI?.Panel`, `UI['Panel']`, `createElement(UI.Panel)`.
        unread.push(
          `${shown} reads members of ${node.object.name}${from(node.object.name)}, whose names this check does not read.`,
        );
      } else if (
        node.type === 'CallExpression' &&
        node.callee?.type === 'Identifier' &&
        node.callee.name === 'require'
      ) {
        const argument = node.arguments?.[0];
        const spec =
          argument?.type === 'StringLiteral'
            ? `"${argument.value}"`
            : 'a module';
        unread.push(
          `${shown} loads ${spec} with require(), whose component names this check does not read.`,
        );
      } else if (
        node.type === 'ImportExpression' ||
        (node.type === 'CallExpression' && node.callee?.type === 'Import')
      ) {
        const argument = node.source ?? node.arguments?.[0];
        const spec =
          argument?.type === 'StringLiteral'
            ? `"${argument.value}"`
            : 'a module';
        unread.push(
          `${shown} loads ${spec} with a dynamic import(), whose component names this check does not read.`,
        );
      }
    });
  };
  visit(file);
  return {names, unread};
}

/**
 * The local name a module's default export declares (`export default
 * function AcmeWidget()`, `export default class AcmeWidget`), or of the
 * binding it exports as default (`export default AcmeWidget`), or null.
 * @param {string} file
 * @returns {string | null}
 */
function defaultBinding(file) {
  let ast;
  try {
    ast = parseModule(fs.readFileSync(file, 'utf8'), {
      sourceType: 'module',
      plugins: ['typescript', 'jsx'],
      errorRecovery: true,
    });
  } catch {
    return null;
  }
  for (const node of ast.program.body) {
    if (node.type !== 'ExportDefaultDeclaration') continue;
    const declaration = /** @type {any} */ (node.declaration);
    if (typeof declaration?.id?.name === 'string') return declaration.id.name;
    if (declaration?.type === 'Identifier') return declaration.name;
  }
  return null;
}

/**
 * A finding a report lists with its fix but nothing counts: `info` severity,
 * which `integration check` and `--strict` leave alone.
 * @typedef {{file: string, name: string, code: string, severity: 'info', message: string}} ListedFinding
 */

/**
 * @param {string} code
 * @param {string} base the folder `file` is relative to
 * @param {{docPath: string, name: string, message: string}} entry
 * @returns {ListedFinding}
 */
function listedFinding(code, base, entry) {
  return {
    file: slash(path.relative(base, entry.docPath)),
    name: entry.name,
    code,
    severity: 'info',
    message: entry.message,
  };
}

/**
 * The block component names this check could not judge, shaped like the
 * doc type report so `integration check` counts them as not compared: each
 * name a template gives in `exampleFor` or `componentsUsed` that neither the
 * package nor Core has, when the template reaches components through
 * anything but named imports and re-exports from the package, Core, or
 * helpers read in full (see importedNames), or when Core is not installed to
 * look it up in. A name judged unknown is an `unknown_block_component`
 * finding, listed with its fix at `info` severity: `integration check` counts
 * it nowhere and `--strict` does not fail on it.
 * @param {LoadedIntegration} integration
 * @returns {Promise<{status: 'checked', findings: ListedFinding[], unchecked: Array<{file: string, name: string, reason: string}>}>}
 */
export async function blockComponentsReport(integration) {
  const {findings, unchecked} = await judgeBlockComponents(integration);
  const base = integration.__packageDir ?? integration.templates ?? '';
  return {
    status: 'checked',
    findings: findings.map(entry =>
      listedFinding('unknown_block_component', base, entry),
    ),
    unchecked: unchecked.map(entry => ({
      file: slash(path.relative(base, entry.docPath)),
      name: entry.name,
      reason: entry.reason,
    })),
  };
}

/**
 * Warn about a `.tsx` directly in the templates root with no same-stem template
 * metadata: template discovery pairs sources with docs, so `astryx template`
 * never lists it. A PascalCase file directly in a shared components root is
 * left to the component check, which already warns about it.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
function checkTemplateSourcesWithoutDoc(integration, issues) {
  const root = /** @type {string} */ (integration.templates);
  const sharedComponents =
    integration.components != null &&
    path.resolve(integration.components) === path.resolve(root);
  for (const file of findTemplateSourceOnlyCandidates(root)) {
    if (sharedComponents && /^[A-Z]/u.test(file)) continue;
    const stem = file.slice(0, -'.tsx'.length);
    issues.push(
      issueWarning(
        'source_without_template_doc',
        `Template source "${file}" has no same-stem metadata file ${stem}.doc.mjs, so \`astryx template\` never lists it. Fix: add ${stem}.doc.mjs beside it with type: 'page' or 'block'; \`astryx docs authoring integration-template-doc\` lists its fields. If it is not a template, move it out of the templates root.`,
      ),
    );
  }
}

/**
 * Validate the integration's components through the same load-and-parse boundary
 * that component detail uses. Missing source and invalid metadata are reported
 * per component so valid siblings remain available.
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkComponents(integration, issues) {
  if (!integration.components || rootProblem(integration.components)) return;
  const discover = componentDiscovery.discoverValidIntegrationComponents;
  if (typeof discover !== 'function') return; // feature not present yet
  const root = /** @type {string} */ (integration.components);
  const files = componentDocFiles(root);
  try {
    const {discovered, errors} = await discover(integration);
    /** @type {import('./contribution-fixes.mjs').FixContext | undefined} */
    let context;
    const byName = new Map(discovered.map(record => [record.name, record]));
    for (const error of errors) {
      const record = byName.get(error.name);
      if (record == null || record.sourcePath != null) {
        issues.push(issueError('invalid_component', error.message));
        continue;
      }
      const docPath = record.docPath;
      // Reported once, below, as the case mismatch it is.
      if (docPath && files.caseMismatch.has(docPath)) continue;
      const docName = docPath
        ? path.basename(docPath)
        : `${record.name}.doc.mjs`;
      let fix = `Fix: add ${record.name}.tsx beside ${docName}.`;
      const stamp = docPath ? readContributionStamp(docPath, false) : null;
      if (stamp && stamp.type !== 'component' && integration.__packageDir) {
        context ??= createFixContext(integration.__packageDir, integration);
        fix = notAComponentFix(context, docPath, stamp);
      }
      issues.push(issueError('invalid_component', `${error.message} ${fix}`));
    }
    for (const [docPath, source] of files.caseMismatch) {
      const doc = path.basename(docPath);
      const renamed = `${source.slice(0, -'.tsx'.length)}${doc.slice(docStemOf(doc).length)}`;
      const shown = slash(path.relative(root, docPath));
      const linux = `They pair on a case-insensitive disk (macOS, Windows) but not on Linux, where CI and most installs run`;
      const fix = `Fix: rename ${doc} to ${renamed}.`;
      // Where discovery still pairs the doc with its source (a
      // case-insensitive disk), or the doc is hidden and lists nothing, the
      // component works here: a warning, as validate exited 0 for it before.
      if (componentDiscovery.isHiddenComponentDoc(docPath)) {
        issues.push(
          issueWarning(
            'source_without_component_doc',
            `Hidden component doc "${shown}" and its source "${source}" differ only in letter case. ${linux}. ${fix}`,
          ),
        );
      } else if (componentDiscovery.integrationSourceForDoc(docPath) != null) {
        issues.push(
          issueWarning(
            'source_without_component_doc',
            `Component doc "${shown}" and its source "${source}" differ only in letter case. ${linux}, so there the component is missing. ${fix}`,
          ),
        );
      } else {
        issues.push(
          issueError(
            'invalid_component',
            `Component doc "${shown}" and its source "${source}" differ only in letter case. ${linux}, so here the component is missing. ${fix}`,
          ),
        );
      }
    }
    for (const {read, ignored} of files.duplicates) {
      const readName = path.basename(read);
      const ignoredNames = ignored.map(file => path.basename(file));
      issues.push(
        issueWarning(
          'duplicate_component_doc',
          `Component "${docStemOf(readName)}" has ${ignored.length + 1} docs: ${[readName, ...ignoredNames].join(', ')}. Astryx reads ${readName} and ignores ${ignoredNames.join(' and ')}. Fix: delete ${ignoredNames.join(' and ')}, moving anything only ${ignored.length === 1 ? 'it says' : 'they say'} into ${readName}.`,
        ),
      );
    }
    const overlap = integration.__packageDir
      ? newComponentDocNote(
          (context ??= createFixContext(integration.__packageDir, integration)),
        )
      : '';
    for (const name of findSourceOnlyCandidates(
      integration.components,
      discovered.map(record => record.name),
    )) {
      // A hidden doc still pairs with its source; discovery just skips it.
      if (
        ['.doc.ts', '.doc.mjs', '.doc.js'].some(suffix =>
          fs.existsSync(path.join(root, `${name}${suffix}`)),
        )
      ) {
        continue;
      }
      // A doc whose name differs only in case is reported above.
      if (files.caseMismatchSources.has(path.join(root, `${name}.tsx`))) {
        continue;
      }
      issues.push(
        issueWarning(
          'source_without_component_doc',
          `Component source "${name}.tsx" has no same-stem metadata file ${name}.doc.mjs, so Astryx ignores it. Fix: add ${name}.doc.mjs beside it with type: 'component'; \`astryx docs authoring component-doc\` lists its fields.${overlap}`,
        ),
      );
    }
  } catch (err) {
    issues.push(
      issueError('invalid_component', /** @type {any} */ (err).message),
    );
  }
}

const COMPONENT_DOC_SUFFIXES = ['.doc.ts', '.doc.mjs', '.doc.js'];

/** @param {string} file a doc file name */
function docStemOf(file) {
  const suffix = COMPONENT_DOC_SUFFIXES.find(each => file.endsWith(each));
  return suffix ? file.slice(0, -suffix.length) : file;
}

/**
 * The component docs under a root, read from the real directory listings:
 * those beside a source whose name differs only in letter case (which an
 * existence check on a case-insensitive disk would call paired), and stems
 * with more than one doc, with the doc discovery reads.
 * @param {string} root
 */
function componentDocFiles(root) {
  /** @type {Map<string, string>} doc path -> the source's real file name */
  const caseMismatch = new Map();
  /** @type {Set<string>} */
  const caseMismatchSources = new Set();
  /** @type {Array<{read: string, ignored: string[]}>} */
  const duplicates = [];
  /** @param {string} dir */
  const walk = dir => {
    let entries;
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      return;
    }
    const names = new Set(entries.map(entry => entry.name));
    /** @type {Map<string, string[]>} */
    const byStem = new Map();
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '__tests__') {
          walk(full);
        }
        continue;
      }
      const stem = docStemOf(entry.name);
      if (stem === entry.name) continue;
      byStem.set(stem, [...(byStem.get(stem) ?? []), entry.name]);
      const source = `${stem}.tsx`;
      if (names.has(source)) continue;
      const other = [...names].find(
        name => name !== source && name.toLowerCase() === source.toLowerCase(),
      );
      // The source's own doc, if it has one, is its pair.
      if (
        other &&
        !COMPONENT_DOC_SUFFIXES.some(suffix =>
          names.has(`${other.slice(0, -'.tsx'.length)}${suffix}`),
        )
      ) {
        caseMismatch.set(full, other);
        caseMismatchSources.add(path.join(dir, other));
      }
    }
    for (const docs of byStem.values()) {
      if (docs.length < 2) continue;
      const ordered = COMPONENT_DOC_SUFFIXES.map(suffix =>
        docs.find(doc => doc.endsWith(suffix)),
      ).filter(doc => doc != null);
      duplicates.push({
        read: path.join(dir, /** @type {string} */ (ordered[0])),
        ignored: ordered
          .slice(1)
          .map(doc => path.join(dir, /** @type {string} */ (doc))),
      });
    }
  };
  walk(root);
  return {caseMismatch, caseMismatchSources, duplicates};
}

/**
 * Judge each component doc's `name` against the module its printed import
 * names: a finding when that module provably does not export it, and an
 * entry in `unchecked` when it cannot be judged, so it is listed instead.
 * @param {LoadedIntegration} integration
 * @param {Array<{name: string, docPath: string, sourcePath: string|null}>} components
 * @param {string} root the components root
 * @param {Map<string, string>} skip docs already reported, by path
 * @param {Array<{docPath: string, name: string, message: string}>} findings
 * @param {Array<{docPath: string, name: string, reason: string}>} unchecked
 */
async function judgeComponentDocNames(
  integration,
  components,
  root,
  skip,
  findings,
  unchecked,
) {
  const base = integration.__packageDir ?? root;
  for (const record of components) {
    if (componentDiscovery.isIntegrationMember(record)) continue;
    if (skip.has(record.docPath)) continue;
    // A doc with no source is its own error.
    if (record.sourcePath == null) continue;
    let doc;
    try {
      doc = await loadComponentDoc(record.docPath);
    } catch {
      continue;
    }
    const name = doc?.name;
    if (typeof name !== 'string' || name === record.name) continue;
    // The module the printed import names: the doc's import, the published
    // subpath, or the package root, resolved through package.json "exports".
    // Without a package to resolve it in, the same-stem source.
    const printed = componentDiscovery.importedModule(
      integration,
      record.docPath,
      doc,
    );
    if (printed === null) {
      unchecked.push({
        docPath: record.docPath,
        name,
        reason:
          'Its import names another package, or resolves to no file this check can read.',
      });
      continue;
    }
    const module = printed ?? record.sourcePath;
    const shown = slash(path.relative(base, module));
    // Only what the code contradicts: the module must provably not export
    // the name the doc gives.
    const judged = moduleExportVerdict(module, name);
    if (judged.verdict === 'exports') continue;
    if (judged.verdict === 'unknown') {
      unchecked.push({docPath: record.docPath, name, reason: judged.reason});
      continue;
    }
    // A source whose only export is a default, read because no printed
    // import could be resolved: the package's entry may publish it under
    // any name, so the name is not judged. A printed import that names a
    // default-only module does not export the name, which is a mismatch.
    const exportedNames = moduleExportNames(module);
    const defaultOnly =
      exportedNames != null &&
      exportedNames.length === 1 &&
      exportedNames[0] === 'default';
    if (defaultOnly && printed === undefined) {
      unchecked.push({
        docPath: record.docPath,
        name,
        reason: `${shown} exports a default, which the package entry may publish under any name.`,
      });
      continue;
    }
    const file = path.basename(record.docPath);
    // The name to propose: the file name when the module exports it, else
    // the one component the module exports.
    let fix;
    if (defaultOnly) {
      fix =
        defaultBinding(module) === name
          ? `Fix: add \`export {${name}};\` to ${shown}, so it exports ${name} by name as well, or set the doc's import to the module that publishes it as ${name}.`
          : `Fix: bind the default to ${name} in ${shown} and export it by name too (\`const ${name} = …; export default ${name}; export {${name}};\`), or set the doc's import to the module that publishes it as ${name}.`;
    } else if (moduleExportsName(module, record.name)) {
      fix = `Fix: set name: '${record.name}' in ${file}.`;
    } else {
      const exported = (exportedNames ?? []).filter(each =>
        /^[A-Z][A-Za-z0-9]*$/u.test(each),
      );
      fix =
        exported.length === 1
          ? `Fix: set name: '${exported[0]}' in ${file}, the component ${shown} exports.`
          : `Fix: set name in ${file} to the component ${shown} exports${exported.length > 1 ? ` (${exported.join(', ')})` : ''}.`;
    }
    findings.push({
      docPath: record.docPath,
      name,
      message: `Component doc "${slash(path.relative(root, record.docPath))}" sets name: '${name}', but ${shown}, the module its import names, does not export ${name}, so Astryx lists the component as "${record.name}" (its file name), and \`astryx component ${record.name}\` prints \`import {${name}}\`. ${fix}`,
    });
  }
}

/**
 * The component doc names the check could not judge, shaped like the doc type
 * report so `integration check` counts them as not compared: each doc whose
 * `name` differs from the name it is listed under and whose source's exports
 * cannot all be read without running it. A name the module its printed
 * import names provably lacks is a `doc_name_mismatch` finding, listed with
 * its fix at `info` severity: `integration check` counts it nowhere and
 * `--strict` does not fail on it.
 * @param {LoadedIntegration} integration
 * @returns {Promise<{status: 'checked', findings: ListedFinding[], unchecked: Array<{file: string, name: string, reason: string}>}>}
 */
export async function componentDocNamesReport(integration) {
  /** @type {Array<{docPath: string, name: string, message: string}>} */
  const findings = [];
  /** @type {Array<{docPath: string, name: string, reason: string}>} */
  const unchecked = [];
  const root = integration.components;
  if (root && !rootProblem(root)) {
    try {
      const {components} =
        await componentDiscovery.discoverValidIntegrationComponents(
          integration,
        );
      await judgeComponentDocNames(
        integration,
        components,
        root,
        componentDocFiles(root).caseMismatch,
        findings,
        unchecked,
      );
    } catch {
      // A components root discovery cannot read is reported as an issue.
    }
  }
  const base = integration.__packageDir ?? root ?? '';
  return {
    status: 'checked',
    findings: findings.map(entry =>
      listedFinding('doc_name_mismatch', base, entry),
    ),
    unchecked: unchecked.map(entry => ({
      file: slash(path.relative(base, entry.docPath)),
      name: entry.name,
      reason: entry.reason,
    })),
  };
}

/**
 * Validate the integration's doc topics via the landed discovery. A doc that
 * cannot be loaded, is not a usable topic, or collides with a sibling is
 * reported as an `invalid_doc` error.
 *
 * Only per-file problems are visible here: a topic that collides with another
 * PACKAGE's, or names a `replaces`/`extends` target that does not exist, can
 * only be judged once every integration is resolved together, so those are
 * raised by `Project.docs()` instead.
 *
 * @param {LoadedIntegration} integration loaded-integration-shaped object
 * @param {Issue[]} issues
 */
async function checkDocs(integration, issues) {
  if (!integration.docs || rootProblem(integration.docs)) return;
  try {
    const {errors} = await discoverIntegrationDocs(integration);
    for (const e of errors) {
      issues.push(issueError('invalid_doc', e.message));
    }
  } catch (err) {
    issues.push(issueError('invalid_doc', /** @type {any} */ (err).message));
  }
}

/**
 * Validate the integration's source-theme descriptors. The same discovery function
 * powers Project and theme list/add, so validation cannot accept a shape that
 * consumers later fail to use.
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
async function checkThemes(integration, issues) {
  if (!integration.themes || rootProblem(integration.themes)) return;
  try {
    // A theme may name itself differently from its folder (its built files
    // then carry that name), so a name that differs is no finding here:
    // verify judges it against the files the package exports.
    await discoverIntegrationThemes(integration);
  } catch (err) {
    issues.push(issueError('invalid_theme', /** @type {any} */ (err).message));
  }
}

/**
 * A warning for each contribution file a reader reads (the docs and sources
 * `integration verify` expects in the tarball) that the user running astryx
 * cannot read; files no reader takes, such as `.DS_Store`, are not looked at: Astryx cannot check it, and npm pack stops on it. A
 * warning, so validate keeps its exit code; `integration verify` fails on the
 * pack itself.
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
function checkUnreadableFiles(integration, issues) {
  const packageDir = integration.__packageDir;
  if (!packageDir) return;
  for (const shown of contributionFiles(integration, packageDir)) {
    try {
      fs.accessSync(path.join(packageDir, shown), fs.constants.R_OK);
    } catch (err) {
      const code = String(/** @type {any} */ (err)?.code ?? 'unknown error');
      issues.push(
        issueWarning(
          'unreadable_file',
          `Could not read "${shown}" (${code}), so Astryx cannot check it and npm pack fails on it. Fix: make it readable (chmod a+r ${shown}), or delete it if it does not belong in the package.`,
        ),
      );
    }
  }
}

/**
 * Run every contribution validator against a loaded-integration-shaped object.
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
async function runContributionChecks(integration, issues) {
  checkUnreadableFiles(integration, issues);
  await checkCodemods(integration, issues);
  await checkTemplates(integration, issues);
  await checkComponents(integration, issues);
  await checkDocs(integration, issues);
  await checkThemes(integration, issues);
}

/**
 * Validate an already-LOADED integration (as produced by `loadIntegrations` —
 * absolute contribution roots plus identity) and return its issues. This is the
 * reuse seam for everyday commands that have already loaded the configured
 * integrations and want the SAME validators that Doctor runs,
 * without re-resolving the manifest from disk.
 *
 * @param {LoadedIntegration} loaded loaded-integration-shaped object
 * @returns {Promise<Issue[]>}
 */
export async function validateLoadedIntegration(loaded) {
  /** @type {Issue[]} */
  const issues = [];
  if (!loaded || typeof loaded !== 'object') return issues;
  // A package set aside for claiming another package's provider ID has no
  // contribution roots to check; the conflict itself is what to report.
  if (loaded.__providerConflict) {
    return [
      issueWarning(DUPLICATE_PROVIDER, loaded.__providerConflict.message),
    ];
  }
  // A manifest that threw on import (or failed the schema) carries a load-error
  // marker and no contribution roots, so every check below would find nothing
  // and report a clean integration — which is how a stale manifest used to go
  // silently invisible. The load error IS the issue.
  if (loaded.__loadError) {
    return [issueError('integration_error', loaded.__loadError)];
  }
  checkUnknownKeys(loaded, issues);
  if (loaded.__agentDocsError) {
    issues.push(issueError(INVALID_AGENT_DOCS, loaded.__agentDocsError));
  }
  if (loaded.__cliCommandError) {
    issues.push(
      issueWarning(
        INVALID_CLI_COMMAND,
        `${loaded.__cliCommandError}. The command is ignored; printed commands use the package-manager prefix.`,
      ),
    );
  }
  checkRoots(
    {
      components: loaded.components,
      templates: loaded.templates,
      codemods: loaded.codemods,
      docs: loaded.docs,
      themes: loaded.themes,
      __manifestFile: loaded.__manifestFile,
    },
    issues,
    loaded.__packageDir,
  );
  await runContributionChecks(loaded, issues);
  return issues;
}
