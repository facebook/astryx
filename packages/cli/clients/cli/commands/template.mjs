// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file template command — thin CLI wrapper around api/template.mjs
 */

import {jsonOut} from '../../../foundation/response/json.mjs';
import {emit, section, text, records, code} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {template as templateApi} from '../../../api/template/template.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {warnOnIntegrationIssues} from '../../../foundation/integrations/integration-warnings.mjs';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {NO_RESULT_SET, resultSet} from '../../../foundation/debug/index.mjs';
import {doc as templateCommand} from './template.doc.mjs';
import {doc as templateFn} from '../../../api/template/template.doc.mjs';

export {discoverTemplates, listTemplates} from '../../../api/template/template.mjs';

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
 * What the run answered with. Listing and printing a template are lookups;
 * scaffolding one into a project (or writing the CDN starter) is a file
 * written, which is an effect with nothing to count.
 *
 * @param {TemplateResponse} result
 * @returns {import('../../../foundation/debug/command-result.mjs').CommandResult}
 */
function summarize(result) {
  switch (result.type) {
    case 'template.list':
      return resultSet({count: result.data.length, resultKind: 'template'});
    case 'template.show':
    case 'template.skeleton':
      return resultSet({count: 1, resultKind: 'template', directMatch: true});
    case 'template.copy':
    case 'template.cdn':
      return NO_RESULT_SET;
  }
}

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
      // doctor integration validate. Best-effort; suppressed in --json mode.
      try {
        const project = await Project.load(process.cwd());
        await warnOnIntegrationIssues(project, {json});
      } catch {
        // Never let the nudge break the command.
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
        return cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
      }

      const answered = summarize(result);
      if (json) {
        jsonOut(result);
        return answered;
      }

      switch (result.type) {
        case 'template.list': {
          const pages = result.data.filter(t => t.type === 'page');
          const blocks = result.data.filter(t => t.type === 'block');
          // Project each entry to its JSON-mirroring fields; the WIP marker is
          // folded into `name` (as before) and the package is shown only when it
          // isn't the built-in core package.
          /** @param {import('../../../api/template/template.type.mjs').TemplateListEntry} t */
          const toRow = t => ({
            id: t.id,
            name: t.isReady ? t.name : `${t.name} (WIP)`,
            description: t.description,
            package:
              t.package && t.package !== '@astryxdesign/core' ? t.package : '',
            replaces: t.replaces ?? '',
          });
          const fields = ['id', 'name', 'description', 'package', 'replaces'];
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
      return answered;
    },
  });
}
