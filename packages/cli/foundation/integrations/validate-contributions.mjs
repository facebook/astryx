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
import {KNOWN_INTEGRATION_KEYS} from '../../authoring/integration/schema.mjs';
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
  // A key one edit away from a known one is almost always a typo: say so
  // first, since "a newer CLI" sends the author to upgrade for nothing.
  const typos = keys
    .map(key => ({key, known: nearestKnownKey(key)}))
    .filter(each => each.known != null);
  for (const {key, known} of typos) {
    // The manifest already sets the key it is a near miss of: renaming would
    // give it twice, so the stray key goes.
    const alreadySet =
      /** @type {Record<string, unknown>} */ (integration)[
        /** @type {string} */ (known)
      ] != null;
    const fix = alreadySet
      ? `Fix: remove "${key}" from ${manifestName(integration)}; it already sets "${known}".`
      : `Fix: rename "${key}" to "${known}" in ${manifestName(integration)}.`;
    issues.push(
      issueWarning(
        'unknown_manifest_key',
        `This CLI does not know the manifest key "${key}", so it is ignored. Did you mean \`${known}\`? ${fix} If it is a key from a newer Astryx CLI instead, upgrading @astryxdesign/cli picks it up.`,
      ),
    );
  }
  const rest = keys.filter(key => !typos.some(each => each.key === key));
  if (rest.length === 0) return;
  issues.push(
    issueWarning(
      'unknown_manifest_key',
      `This CLI does not know the manifest ${rest.length === 1 ? 'key' : 'keys'} ` +
        `${rest.map(key => `"${key}"`).join(', ')}, so ${rest.length === 1 ? 'it is' : 'they are'} ` +
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
 * The known manifest key `key` is a near miss of: a different letter case, or
 * at most two letters added, dropped or changed (`component`, `doc`,
 * `tempaltes`). Null when no known key is that close, or two are.
 * @param {string} key
 * @returns {string | null}
 */
export function nearestKnownKey(key) {
  const lower = key.toLowerCase();
  const limit = lower.length <= 4 ? 1 : 2;
  /** @type {string[]} */
  const close = [];
  for (const known of KNOWN_INTEGRATION_KEYS) {
    const distance = editDistance(lower, known.toLowerCase());
    if (distance <= limit) close.push(known);
  }
  return close.length === 1 ? close[0] : null;
}

/**
 * Levenshtein distance, with a swap of two neighbours counted as one edit.
 * @param {string} a
 * @param {string} b
 */
function editDistance(a, b) {
  /** @type {number[][]} */
  const d = Array.from({length: a.length + 1}, (_, i) =>
    Array.from({length: b.length + 1}, (_, j) =>
      i === 0 ? j : j === 0 ? i : 0,
    ),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost,
      );
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[a.length][b.length];
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
      let message = error.message;
      let fix = `Fix: add ${record.name}.tsx beside ${docName}.`;
      const stamp = docPath ? readContributionStamp(docPath, false) : null;
      if (stamp && stamp.type !== 'component' && integration.__packageDir) {
        context ??= createFixContext(integration.__packageDir, integration);
        fix = notAComponentFix(context, docPath, stamp);
      } else {
        const other = docPath ? otherSourceFor(docPath) : null;
        if (other) {
          message = `${message.replace(/\.$/u, '')}: found ${other}, but a component source must be a .tsx file.`;
          fix = `Fix: rename ${other} to ${record.name}.tsx (and point its package export at the new file).`;
        }
      }
      issues.push(issueError('invalid_component', `${message} ${fix}`));
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
 * A same-stem source discovery does not read: `.jsx`, `.js`, `.ts` or `.mjs`.
 * @param {string} docPath
 * @returns {string | null} its file name
 */
function otherSourceFor(docPath) {
  const stem = docStemOf(path.basename(docPath));
  const dir = path.dirname(docPath);
  return (
    ['.jsx', '.js', '.ts', '.mjs']
      .map(extension => `${stem}${extension}`)
      .find(file => fs.existsSync(path.join(dir, file))) ?? null
  );
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
 * The `name` a theme source passes to defineTheme for its exported theme,
 * when the file says it as a string literal: `export const oceanTheme =
 * defineTheme({name: 'ocean', ...})`. Null whenever only running the module
 * could tell (a variable, a factory, a spread after the name, `extends`
 * alone), so nothing is judged that a build would decide.
 * @param {string} file
 * @param {string} exportName
 * @returns {string | null}
 */
export function literalThemeName(file, exportName) {
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
  /** @type {any} */
  let init = null;
  for (const node of ast.program.body) {
    const declaration =
      node.type === 'ExportNamedDeclaration' ? node.declaration : node;
    if (declaration?.type !== 'VariableDeclaration') continue;
    for (const declarator of declaration.declarations) {
      if (
        declarator.id.type === 'Identifier' &&
        declarator.id.name === exportName
      ) {
        init = declarator.init;
      }
    }
  }
  while (
    init?.type === 'TSAsExpression' ||
    init?.type === 'TSSatisfiesExpression'
  ) {
    init = init.expression;
  }
  if (init?.type !== 'CallExpression') return null;
  const callee =
    init.callee.type === 'Identifier'
      ? init.callee.name
      : init.callee.type === 'MemberExpression' &&
          init.callee.property.type === 'Identifier'
        ? init.callee.property.name
        : null;
  if (callee !== 'defineTheme') return null;
  const [config] = init.arguments;
  if (config?.type !== 'ObjectExpression') return null;
  /** @type {string | null} */
  let name = null;
  for (const property of config.properties) {
    if (property.type === 'SpreadElement') {
      name = null;
      continue;
    }
    if (property.type !== 'ObjectProperty' || property.computed) continue;
    const key =
      property.key.type === 'Identifier'
        ? property.key.name
        : property.key.type === 'StringLiteral'
          ? property.key.value
          : null;
    if (key !== 'name') continue;
    name =
      property.value.type === 'StringLiteral' ? property.value.value : null;
  }
  return name;
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
