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
import {isValidSemver} from '../env/semver.mjs';
import {findSourceOnlyCandidates} from './contribution-inventory.mjs';
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
import {checkCliPeerVersion} from './cli-peer-version.mjs';

/**
 * @typedef {import('./issue').AstryxIntegrationIssue} Issue
 * @typedef {import('./integrations.mjs').LoadedIntegration} LoadedIntegration
 */

/** Stable issue code for an invalid optional agent-doc contribution. */
export const INVALID_AGENT_DOCS = 'invalid_agent_docs';

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
 * @param {{components?: string, templates?: string, codemods?: string, docs?: string, themes?: string}} resolved
 *   absolute resolved roots (undefined when not declared)
 * @param {Issue[]} issues
 */
function checkRoots(resolved, issues) {
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
    if (problem == null) continue;
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
      let fix = `Fix: add ${record.name}.tsx beside ${docPath ? path.basename(docPath) : `${record.name}.doc.mjs`}.`;
      const stamp = docPath ? readContributionStamp(docPath, false) : null;
      if (stamp && stamp.type !== 'component' && integration.__packageDir) {
        context ??= createFixContext(integration.__packageDir, integration);
        fix = notAComponentFix(context, docPath, stamp);
      }
      issues.push(issueError('invalid_component', `${error.message} ${fix}`));
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
          fs.existsSync(
            path.join(
              /** @type {string} */ (integration.components),
              `${name}${suffix}`,
            ),
          ),
        )
      ) {
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
    await discoverIntegrationThemes(integration);
  } catch (err) {
    issues.push(issueError('invalid_theme', /** @type {any} */ (err).message));
  }
}

/**
 * Run every contribution validator against a loaded-integration-shaped object.
 * @param {LoadedIntegration} integration
 * @param {Issue[]} issues
 */
async function runContributionChecks(integration, issues) {
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
  const peerWarning = checkCliPeerVersion(loaded);
  if (peerWarning) issues.push(peerWarning);
  if (loaded.__agentDocsError) {
    issues.push(issueError(INVALID_AGENT_DOCS, loaded.__agentDocsError));
  }
  checkRoots(
    {
      components: loaded.components,
      templates: loaded.templates,
      codemods: loaded.codemods,
      docs: loaded.docs,
      themes: loaded.themes,
    },
    issues,
  );
  await runContributionChecks(loaded, issues);
  return issues;
}
