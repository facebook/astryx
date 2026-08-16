// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file template command — thin CLI wrapper around api/template.mjs
 */

import * as path from 'node:path';
import * as fs from 'node:fs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, records, code} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {template as templateApi} from '../../../api/template/template.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {warnOnIntegrationIssues} from '../../../foundation/integrations/integration-warnings.mjs';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {doc as templateCommand} from './template.doc.mjs';
import {doc as templateFn} from '../../../api/template/template.doc.mjs';

export {discoverTemplates, listTemplates} from '../../../api/template/template.mjs';

/**
 * A template entry as produced by the discover* helpers in api/template.mjs.
 * The api layer returns these as `object[]`; this local shape captures the
 * fields the command consumes. Remove once api/template.mjs exports a precise
 * type for its discovered templates.
 * @typedef {object} DiscoveredTemplate
 * @property {'page' | 'block'} type
 * @property {string} dirName
 * @property {string} name
 * @property {string} filePath
 */

/**
 * The discriminated response returned by the template API. The api layer
 * currently declares `{type: string, data: unknown}`; narrow it here to the
 * precise union so the switch below type-checks. Replace with the api's own
 * return type once it is tightened.
 * @typedef {(
 *   import('../../../api/template/template.type.mjs').TemplateListResponse |
 *   import('../../../api/template/template.type.mjs').TemplateShowResponse |
 *   import('../../../api/template/template.type.mjs').TemplateSkeletonResponse |
 *   import('../../../api/template/template.type.mjs').TemplateCopyResponse
 * )} TemplateResponse
 */

/**
 * @param {import('commander').Command} program
 */
export function registerTemplate(program) {
  defineCommand(program, templateCommand, {
    fn: templateFn,
    action:
      /**
       * @param {string | undefined} name
       * @param {string | undefined} targetPath
       * @param {{list?: boolean, type?: string, package?: string, skeleton?: boolean, overwrite?: boolean, withShell?: boolean}} options
       */
      async (name, targetPath, options) => {
      const json = program.opts().json || false;
      const run = getCliInvocation();

      // Non-blocking nudge: if any configured integration has validation
      // issues, print one compact line to stderr pointing at
      // validate-integration. Best-effort; suppressed in --json mode.
      try {
        const project = await Project.load(process.cwd());
        await warnOnIntegrationIssues(
          /** @type {Array<import('../../../foundation/integrations/integrations.mjs').LoadedIntegration>} */ (
            project.loadedIntegrations
          ),
          {json},
        );
      } catch {
        // Never let the nudge break the command.
      }

      // Pre-flight overwrite check (only when we'd actually copy a file).
      // The API resolves the destination; we need to mirror its logic
      // narrowly enough to detect collisions before invoking it.
      if (
        name &&
        targetPath &&
        !options.list &&
        !options.skeleton
      ) {
        const collision = await detectTemplateCollision(name, targetPath);
        if (collision && !options.overwrite) {
          const rel = path.relative(process.cwd(), collision) || collision;
          const msg =
            `Refusing to overwrite existing file ${rel}. ` +
            `Re-run with --overwrite (or -f) to replace it.`;
          cliError(msg, {code: ERROR_CODES.ERR_FILE_EXISTS});
          return;
        }
      }

      /** @type {TemplateResponse} */
      let result;
      try {
        result = /** @type {TemplateResponse} */ (
          await templateApi(name, {
            list: options.list,
            skeleton: options.skeleton,
            type: /** @type {'page' | 'block' | undefined} */ (options.type),
            package: options.package,
            targetPath,
            overwrite: options.overwrite,
            cwd: process.cwd(),
            withShell: options.withShell,
            // Non-fatal warnings go to stderr; never in --json mode (stdout
            // stays a clean envelope).
            onWarn: json ? undefined : msg => console.error(msg),
            // One stderr line about the app shell — which one wrapped the
            // template, or how to ask for it. Passing no callback in --json mode
            // also tells the API not to resolve the shell at all.
            onShell: json
              ? undefined
              : outcome => console.error(formatShellNotice(outcome, {name, run})),
          })
        );
      } catch (e) {
        // template API throws structured errors with {name, reason} suggestions —
        // pass them through untouched so the CLI envelope matches the API.
        const err = /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }

      if (json) return jsonOut(result);

      switch (result.type) {
        case 'template.list': {
          const pages = result.data.filter(t => t.type === 'page');
          const blocks = result.data.filter(t => t.type === 'block');
          // Project each entry to its JSON-mirroring fields; the WIP marker is
          // folded into `name` (as before) and the package is shown only when it
          // isn't the built-in core package.
          /** @param {import('../../../api/template/template.type.mjs').TemplateListEntry} t */
          const toRow = t => ({
            name: t.isReady ? t.name : `${t.name} (WIP)`,
            description: t.description,
            package:
              t.package && t.package !== '@astryxdesign/core' ? t.package : '',
          });
          const fields = ['name', 'description', 'package'];
          emit(
            pages.length > 0 && section('Page Templates'),
            pages.length > 0 && records(pages.map(toRow), {fields}),
            blocks.length > 0 && section('Block Templates'),
            blocks.length > 0 && records(blocks.map(toRow), {fields}),
            section('Usage'),
            text(
              [
                `${run} template <id> [target-path]     Scaffold page or block`,
                `${run} template <id> --skeleton        Layout reference`,
                `${run} template --list --type block    List only blocks`,
                `${run} template --list --package <pkg> List from one package`,
              ].join('\n'),
            ),
          );
          break;
        }

        case 'template.skeleton': {
          const {template: tName, description, components, skeleton} = result.data;
          emit(
            text(
              `# ${tName}${description ? ' — ' + description : ''}\n` +
                `# Components: ${components.join(', ')}`,
            ),
            code(skeleton),
          );
          break;
        }

        case 'template.show': {
          // Source must survive piping byte-for-byte.
          emit(code(result.data.source));
          break;
        }

        case 'template.copy': {
          emit(
            text(
              `Copied template to ${result.data.outputDir}/${result.data.fileName}`,
            ),
          );
          break;
        }
      }
    },
  });
}

/**
 * Mirror the destination-resolution logic in api/template.mjs so we can
 * detect a clobber before invoking the API.
 *
 * Returns the absolute destination file path if it already exists, or
 * `null` otherwise (template missing, no collision, or list/skeleton mode).
 *
 * Path-safety enforcement happens inside the API; here we only need
 * enough precision to check existence — a false negative just means the
 * API will catch the issue and abort.
 *
 * @param {string} name
 * @param {string} targetPath
 * @returns {Promise<string | null>}
 */
async function detectTemplateCollision(name, targetPath) {
  const {discoverTemplates} = await import('../../../api/template/template.mjs');
  /** @type {DiscoveredTemplate[]} */
  let templates;
  try {
    templates = /** @type {DiscoveredTemplate[]} */ (
      await discoverTemplates(process.cwd())
    );
  } catch {
    return null;
  }
  const match = templates.find(t => t.dirName === name);
  if (!match) return null;

  // Resolve target as the API will. We can't call assertWithin here
  // because the API does it itself; we just need to know "is there a
  // file at the destination?".
  const resolved = path.resolve(process.cwd(), targetPath);

  // File-arg branch: targetPath looks like `./foo.tsx`.
  const {isFilePathArg} = await import('../../../foundation/fs/path-safety.mjs');
  let dest;
  if (isFilePathArg(targetPath)) {
    dest = resolved;
  } else {
    const fileName = match.type === 'block'
      ? path.basename(match.filePath)
      : 'page.tsx';
    dest = path.join(resolved, fileName);
  }

  return fs.existsSync(dest) ? dest : null;
}

/** Longest integration-supplied value rendered in a notice row. */
const MAX_NOTICE_VALUE = 160;

/**
 * Flatten an integration-supplied string for single-line display. The values in
 * a notice come from a third-party manifest, and the notice is an attribution
 * surface — so control characters (which could rewrite the terminal) and
 * newlines (which could forge an extra notice line, or just break the aligned
 * block) are collapsed to spaces, and the result is capped.
 *
 * @param {unknown} value
 * @returns {string | undefined} the flattened value, or undefined when empty
 */
function oneLine(value) {
  if (typeof value !== 'string') return undefined;
  const flat = value
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f-\u009f]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!flat) return undefined;
  return flat.length > MAX_NOTICE_VALUE
    ? `${flat.slice(0, MAX_NOTICE_VALUE - 3)}...`
    : flat;
}

/**
 * Render the one-line stderr note about the app shell: which shell wrapped the
 * emitted template and who provides it, or — when the template was emitted
 * bare — how to ask for it. Plain ASCII to match the rest of the CLI. The
 * caller writes it to stderr so it never touches the piped source on stdout,
 * and passes no `onShell` in --json mode so it is suppressed there.
 *
 * Values that originate in a third-party manifest (package, description) are
 * flattened, so a shell author can neither forge a second line nor write escape
 * sequences to the terminal.
 *
 * @param {import('../../../api/template/template.type.mjs').ShellOutcome} outcome
 * @param {{name?: string, run: string}} ctx
 * @returns {string} the notice text
 */
export function formatShellNotice(outcome, {name, run}) {
  const component = oneLine(outcome?.component) ?? 'the app shell';
  const pkg = oneLine(outcome?.package) ?? 'an installed integration';
  const why = oneLine(outcome?.description);
  const shell = `${component} from ${pkg}`;

  switch (outcome?.status) {
    case 'wrapped': {
      // Say whose shell it is: the whole point of the override is knowing you
      // got the project's chrome rather than the stock one.
      const origin = outcome.isDefault
        ? 'the default app shell'
        : "this project's app shell, replacing the default AppShell";
      return why
        ? `Wrapped in ${shell} — ${origin}.\n  ${why}`
        : `Wrapped in ${shell} — ${origin}.`;
    }

    case 'available':
      return `Content-only page. Add --with-shell to wrap it in ${shell}.`;

    case 'already-shell':
      return `${oneLine(name) ?? 'This template'} is an app shell already, so --with-shell changed nothing.`;

    case 'not-applicable': {
      const reason = oneLine(outcome.reason);
      return reason
        ? `--with-shell had no effect: ${reason}.`
        : `--with-shell had no effect on this template.`;
    }

    default:
      return `Run ${run} template --list to see the active app shell.`;
  }
}
