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
 *   import('../../../api/template/template.type.mjs').TemplateCopyResponse |
 *   import('../../../api/template/template.type.mjs').TemplateCdnResponse
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
       * @param {{list?: boolean, type?: string, package?: string, skeleton?: boolean, cdn?: boolean | string, overwrite?: boolean}} options
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
        !options.skeleton &&
        !options.cdn
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
            cdn: options.cdn,
            type: /** @type {'page' | 'block' | undefined} */ (options.type),
            package: options.package,
            targetPath,
            overwrite: options.overwrite,
            cwd: process.cwd(),
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
                `${run} template --cdn                 CDN starter page, no build step`,
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

        case 'template.cdn': {
          if (!result.data.written) {
            emit(
              text(`[skip] ${result.data.path} already exists — left as is.`),
              text('Pass --overwrite to replace it with a fresh copy.'),
            );
            break;
          }
          emit(
            text(`[ok] Wrote ${result.data.path}`),
            text(
              `Open it in a browser — no bundler, no install, no build step. Every CDN URL is pinned to ${result.data.version}, and the annotations mark the parts that are load-bearing.`,
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
