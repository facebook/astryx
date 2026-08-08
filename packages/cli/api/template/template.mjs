// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Programmatic API for the template command.
 *
 * This module is BOTH the template dispatcher and the stable import surface for
 * the template family. `template()` discovers the available templates, resolves
 * the requested one, and routes to a leaf (list/show/skeleton/copy). The shared
 * discovery/IO + cross-command helpers live in `foundation/discovery/template-adapter.mjs` and are
 * RE-EXPORTED here so external import paths (`api/template/template.mjs`) —
 * used by component, layout, search, init, discover, validate-integration, and
 * lib/project — keep resolving unchanged.
 *
 * @position api/template — the template dispatcher + barrel; leaves live under
 *   ./list, ./show, ./skeleton, ./copy and shared discovery in foundation/discovery.
 */

import {discoverAll, pkgOf} from '../../foundation/discovery/template-adapter.mjs';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {Project} from '../../foundation/config/project.mjs';
import {isTransformApplicable} from './transform/apply.mjs';
import {templateList} from './list/list.mjs';
import {templateShow} from './show/show.mjs';
import {templateSkeleton} from './skeleton/skeleton.mjs';
import {templateCopy} from './copy/copy.mjs';

// Re-export the shared discovery/IO + cross-command helpers so this module
// stays the single import surface for the template family (same exports as
// before the leaf split). `discoverAll` is exposed both under its own name and
// the historical `discoverTemplates` alias.
export {
  discoverAll,
  discoverAll as discoverTemplates,
  discoverAllWithErrors,
  discoverIntegrationTemplatesForOne,
  stripTemplateAssetRefs,
  listTemplates,
  findRelatedBlocks,
  findShowcase,
  extractComponents,
} from '../../foundation/discovery/template-adapter.mjs';

/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} DiscoveredTemplate
 */
/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').TemplateDiscoveryError} TemplateDiscoveryError
 */
/**
 * @typedef {import('../../foundation/discovery/template-adapter.mjs').TemplateDocModule} TemplateDocModule
 */

/**
 * @param {string} [name]
 * @param {object} [options]
 * @param {string} [options.targetPath]
 * @param {boolean} [options.overwrite]
 * @param {boolean} [options.list]
 * @param {boolean} [options.skeleton]
 * @param {boolean} [options.show]
 * @param {'page'|'block'} [options.type] - Filter list views / narrow lookups by template kind.
 * @param {string} [options.package] - Narrow lookups to a specific package (id-only matches across packages are ambiguous).
 * @param {string} [options.cwd]
 * @param {boolean} [options.withShell] - Wrap the emitted template in the project's app shell (default false — page templates are content-only, so the host supplies the chrome). CLI `--with-shell`.
 * @param {(message: string) => void} [options.onWarn] - Sink for non-fatal warnings (e.g. an app shell that was skipped). Callers suppress this in --json mode.
 * @param {(outcome: import('./template.type.mjs').ShellOutcome) => void} [options.onShell] - Called once with what `withShell` did (or why it did nothing), so the CLI can name the shell and its owner. Suppressed in --json mode.
 * @returns {Promise<{type: string, data: unknown}>}
 */
export async function template(name, options = {}) {
  const {
    list = false,
    skeleton = false,
    show = false,
    targetPath,
    overwrite = false,
    type,
    package: packageFilter,
    cwd = process.cwd(),
    withShell = false,
    onWarn,
    onShell,
  } = options;
  const templates = await discoverAll(cwd);

  if (list || (!name && !skeleton)) {
    return templateList(templates, {type, package: packageFilter});
  }

  // Resolve `name` to a single template. The same id can appear across types
  // and/or packages (e.g. a core "hero" page and an integration "hero"
  // block); narrow with --type / --package.
  let candidates = templates.filter(t => t.dirName === name);
  if (type) candidates = candidates.filter(t => t.type === type);
  if (packageFilter) candidates = candidates.filter(t => pkgOf(t) === packageFilter);

  if (name && candidates.length === 0) {
    throw new AstryxError(
      `Unknown template "${name}"`,
      templates.map(t => ({name: t.dirName, reason: `${t.type} template`})),
      ERROR_CODES.ERR_UNKNOWN_TEMPLATE,
    );
  }
  if (name && candidates.length > 1) {
    throw new AstryxError(
      `Template "${name}" is ambiguous — narrow it with --type and/or --package.`,
      candidates.map(t => ({
        name: t.dirName,
        reason: `${t.type} template in ${pkgOf(t)}`,
      })),
      ERROR_CODES.ERR_AMBIGUOUS_TEMPLATE,
    );
  }
  const match = candidates[0];

  if (skeleton) {
    return templateSkeleton(match, templates);
  }

  // Resolve the app shell for the emit leaves (show/copy). Opt-in: without
  // `withShell` the content-only template is emitted exactly as authored and
  // jscodeshift is never loaded.
  const transformCtx = await resolveShellContext(match, {
    cwd,
    withShell,
    onWarn,
    onShell,
  });

  if (show || !targetPath) {
    return templateShow(match, transformCtx);
  }

  return templateCopy(match, {targetPath, cwd, overwrite, transformCtx});
}

/**
 * Lazily load jscodeshift's default export; returns null if unavailable (never
 * throws). jscodeshift is a CLI dependency so this normally resolves, but the
 * template command must never break if it is somehow absent.
 * @returns {Promise<import('../../authoring/codemod/type').JscodeshiftFactory | null>}
 */
async function loadJscodeshift() {
  try {
    return /** @type {any} */ ((await import('jscodeshift')).default);
  } catch {
    return null;
  }
}

/**
 * Resolve the project's app shell into a transform context for `match`, loading
 * jscodeshift only when the shell will actually be applied. Never throws — an
 * unread config, a template that is itself a shell, or a missing jscodeshift
 * each degrade to an empty context so `template` still emits the plain source.
 *
 * The outcome is reported once through `onShell` so the CLI can state which
 * shell was used and who provides it — or why asking for one did nothing.
 *
 * @param {import('../../foundation/discovery/template-adapter.mjs').DiscoveredTemplate} match
 * @param {{cwd: string, withShell?: boolean, onWarn?: (message: string) => void, onShell?: (outcome: import('./template.type.mjs').ShellOutcome) => void}} ctx
 * @returns {Promise<import('./transform/apply.mjs').TemplateTransformContext>}
 */
async function resolveShellContext(
  match,
  {cwd, withShell = false, onWarn, onShell},
) {
  const template = {
    type: match.type,
    id: match.dirName,
    package: pkgOf(match),
    category: match.category,
  };
  /** @type {import('./transform/apply.mjs').TemplateTransformContext} */
  const empty = {transforms: [], jscodeshift: null, template, onWarn};
  // Not wrapping and nobody listening (programmatic callers, --json): don't
  // read the project at all.
  if (!withShell && !onShell) return empty;

  let shell;
  try {
    const project = await Project.load(cwd);
    shell = await project.appShell();
  } catch {
    return empty;
  }

  /** @type {import('./template.type.mjs').ShellOutcome} */
  const outcome = {
    status: 'wrapped',
    component: shell.component,
    package: shell.package,
    isDefault: shell.isDefault,
    description: shell.description,
  };

  // One shell per page. A `Shell -` template already is one, a block renders
  // inside a preview container rather than as a full page, and an integration's
  // own templates already account for its shell (core's default opts out of
  // that last rule — wrapping core templates is the whole point).
  const entry = {
    package: shell.package,
    skipOwnPackage: !shell.isDefault,
    transform: {
      description: shell.description,
      // Never nest shells. A template that already renders core's AppShell (the
      // `Shell -` demos) or this very shell is left alone — two viewport-
      // claiming containers would break the page. Detected from the rendered
      // root rather than the category, which some content-only templates share.
      skipIfRootIs: ['AppShell', shell.component],
      wrap: [
        {
          component: shell.component,
          from: shell.from,
          importKind: shell.importKind,
          props: shell.props,
        },
      ],
    },
  };
  const applicable = isTransformApplicable(entry, template);

  // Opt-in surface: when the shell wasn't asked for, just make it discoverable
  // — and only where it would actually apply.
  if (!withShell) {
    if (applicable) onShell?.({...outcome, status: 'available'});
    return empty;
  }

  if (!applicable) {
    onShell?.({
      ...outcome,
      status: 'not-applicable',
      reason:
        template.type !== 'page'
          ? 'blocks render inside a preview container, not as a full page'
          : `${shell.package} templates already include their own shell`,
    });
    return empty;
  }

  const jscodeshift = await loadJscodeshift();
  if (!jscodeshift) {
    onWarn?.('Skipping the app shell: jscodeshift is not installed.');
    return empty;
  }

  return {
    transforms: [entry],
    jscodeshift,
    template,
    onWarn,
    onAlter: () => onShell?.(outcome),
    onNoop: () => onShell?.({...outcome, status: 'already-shell'}),
  };
}
