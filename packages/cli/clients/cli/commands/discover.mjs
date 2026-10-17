// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file discover command — browse the integrations you have and could add
 *
 * Usage:
 *   astryx discover                           List installed and available packages
 *   astryx discover @scope/name[@version]     One package, with its versions
 *   astryx discover @scope/name/Component     Show docs for an installed component
 *   astryx discover @scope/name/<item>        One item a package adds
 *   astryx discover searchterm                Search every item and package
 */

import {
  formatFull,
  formatBrief,
  formatCompact,
} from '../lib/component-format.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {
  emit,
  section,
  text,
  record,
  records,
  list,
  code,
} from '../formatters/index.mjs';
import {cliError, rejectEmptyArgument} from '../lib/cli-error.mjs';
import {discover as discoverApi} from '../../../api/discover/discover.mjs';
import {Project} from '../../../foundation/config/project.mjs';
import {warnOnIntegrationIssues} from '../../../foundation/integrations/integration-warnings.mjs';
import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {resultSet} from '../../../foundation/debug/index.mjs';
import {doc as discoverCommand} from './discover.doc.mjs';
import {doc as discoverFn} from '../../../api/discover/discover.doc.mjs';

// Max items to list inline per package before summarizing with "+N more".
const MAX_ITEMS_SHOWN = 10;

/** @type {Record<string, string>} */
const KIND_PLURALS = {
  component: 'components',
  template: 'templates',
  doc: 'docs',
  theme: 'themes',
  codemod: 'codemods',
  'agent-doc': 'agent docs',
};

// The list fields that hold item names, summarized in the package list.
const ITEM_FIELDS = [
  'components',
  'templates',
  'docs',
  'themes',
  'codemods',
  'agentDocs',
];

/**
 * @typedef {import('../../../api/discover/discover.type.mjs').DiscoverListResponse
 *   | import('../../../api/discover/discover.type.mjs').DiscoverDetailResponse
 *   | import('../../../api/discover/discover.type.mjs').DiscoverDetailDocResponse
 *   | import('../../../api/discover/discover.type.mjs').DiscoverItemResponse
 *   | import('../../../api/discover/discover.type.mjs').DiscoverSearchResponse} DiscoverResult
 */

/** @type {Record<string, import('../../../foundation/debug/command-result.mjs').ResultSetKind>} */
const RESULT_KINDS = {
  package: 'integration',
  component: 'component',
  template: 'template',
  doc: 'doc',
  theme: 'theme',
  codemod: 'migration',
  'agent-doc': 'doc',
};

/**
 * The run-log kind for a set of item kinds: the one kind, or `mixed`.
 * @param {string[]} kinds
 * @returns {import('../../../foundation/debug/command-result.mjs').ResultSetKind}
 */
function resultKindOf(kinds) {
  const mapped = new Set(kinds.map(kind => RESULT_KINDS[kind] ?? 'mixed'));
  return mapped.size === 1 ? [...mapped][0] : 'mixed';
}

/**
 * What the run answered with. The list and package views count PACKAGES;
 * naming a component or item answers with that item instead.
 *
 * @param {DiscoverResult} result
 * @returns {import('../../../foundation/debug/command-result.mjs').CommandResult}
 */
function summarize(result) {
  switch (result.type) {
    case 'discover.list':
      return resultSet({
        count: result.data.length + (result.meta?.available?.length ?? 0),
        resultKind: 'integration',
      });
    case 'discover.detail':
      return resultSet({
        count: 1,
        resultKind: 'integration',
        directMatch: true,
      });
    case 'discover.detail.doc':
      return resultSet({count: 1, resultKind: 'component', directMatch: true});
    case 'discover.item':
      return resultSet({
        count: 1,
        resultKind: resultKindOf([result.data.kind]),
        directMatch: true,
      });
    case 'discover.search':
      return resultSet({
        count: result.data.total ?? result.data.matches.length,
        resultKind: resultKindOf(result.data.matches.map(m => m.kind)),
      });
  }
}

/**
 * Record options that summarize each item list to its first names.
 * @param {boolean} full print every name instead
 * @returns {import('../formatters/index.mjs').RecordOptions}
 */
function itemListOptions(full) {
  if (full) return {};
  /** @param {string[]} names */
  const summary = names => {
    const shown = names.slice(0, MAX_ITEMS_SHOWN);
    const remaining = names.length - MAX_ITEMS_SHOWN;
    return remaining > 0
      ? `${shown.join(', ')}, +${remaining} more`
      : shown.join(', ');
  };
  return {
    format: Object.fromEntries(ITEM_FIELDS.map(field => [field, summary])),
  };
}

/**
 * One line per source that did not answer live.
 * @param {import('../../../api/discover/discover.type.mjs').DiscoverSourceState[]} sources
 */
function sourceNotes(sources) {
  return sources
    .filter(s => s.status !== 'fresh')
    .map(s =>
      s.status === 'saved'
        ? text(
            `The discover source from ${s.from} did not answer (${s.error}), so this uses the copy saved ${s.savedAt}.`,
          )
        : text(`The discover source from ${s.from} is unavailable: ${s.error}`),
    );
}

/**
 * @param {import('../../../api/discover/discover.type.mjs').DiscoverSourceState[]} sources
 */
function sourceSubtitle(sources) {
  const answered = sources.filter(s => s.status !== 'failed');
  if (answered.length === 0) return undefined;
  return (
    'from ' +
    answered
      .map(
        s =>
          `${s.name}${s.generatedAt ? ` (${s.generatedAt.slice(0, 10)})` : ''}`,
      )
      .join(', ')
  );
}

/**
 * @param {import('../../../authoring/discover/type').DiscoverVersion[]} versions
 * @param {{shown?: string, installed?: string, latest?: string}} marks
 */
function versionLines(versions, marks) {
  return versions
    .filter(v => !v.prerelease || v.version === marks.shown)
    .map(v => {
      const tags = [
        v.version === marks.latest ? 'latest' : '',
        v.version === marks.installed ? 'installed' : '',
        v.version === marks.shown &&
        v.version !== marks.installed &&
        v.version !== marks.latest
          ? 'shown'
          : '',
        v.status !== 'ok' ? v.status : '',
      ].filter(Boolean);
      const date = v.publishedAt ? v.publishedAt.slice(0, 10) : 'date unknown';
      return `${v.version}  ${date}${tags.length ? `  ${tags.join(', ')}` : ''}`;
    });
}

/**
 * @param {import('commander').Command} program
 */
export function registerDiscover(program) {
  defineCommand(program, discoverCommand, {
    fn: discoverFn,
    action:
      /**
       * @param {string | undefined} query
       * @param {{components?: boolean, type?: string, installed?: boolean, available?: boolean, limit?: string}} options
       */
      async (query, options) => {
        rejectEmptyArgument('query', query, 'astryx discover');
        const detail = program.opts().detail || 'full';
        const json = program.opts().json || false;
        const lang = program.opts().lang || null;
        const zh = program.opts().zh || false;
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

        /** @type {DiscoverResult} */
        let result;
        try {
          result = await discoverApi(query, {
            components: options.components,
            lang,
            zh,
            type: /** @type {any} */ (options.type),
            installed: options.installed,
            available: options.available,
            // Number(), not parseInt(): the API refuses `1.5` and `5abc` itself.
            limit: options.limit != null ? Number(options.limit) : undefined,
          });
        } catch (e) {
          const err =
            /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
          return cliError(err.message, {
            suggestions: err.suggestions,
            code: err.code,
          });
        }

        const answered = summarize(result);
        if (json) {
          // Forward optional meta (e.g. configured flag for discover.list) as a
          // sibling of data via jsonOut, so the envelope still carries
          // apiVersion and goes through the single sanctioned emit path.
          jsonOut(result);
          return answered;
        }

        switch (result.type) {
          case 'discover.list': {
            const listOpts = itemListOptions(Boolean(options.components));
            const available = result.meta?.available;
            const sources = result.meta?.sources ?? [];

            // No discover source: the list of what this project has, as always.
            if (available === undefined) {
              if (result.data.length === 0) {
                if (options.available) {
                  // The user specifically asked for available packages but
                  // there is no source to answer from. Say so honestly.
                  emit(
                    text('No discover source is configured.'),
                    text(
                      [
                        'Available integrations are listed by discover sources.',
                        'A project can set one in astryx.config.mjs, and installed',
                        'integrations can provide one.',
                      ].join(' '),
                    ),
                    text(
                      [
                        `Find Astryx packages on npm: npm search @astryxdesign`,
                        `Learn more: ${run} docs cli/integrations`,
                      ].join('\n'),
                    ),
                  );
                } else if (result.meta && result.meta.configured === false) {
                  emit(
                    text('No integrations configured.'),
                    text('Add integration package names to astryx.config.mjs:'),
                    code(
                      "export default {\n  integrations: ['@scope/your-integration'],\n};",
                    ),
                    text(
                      [
                        `Find Astryx packages on npm: npm search @astryxdesign`,
                        `Learn more: ${run} docs cli/integrations`,
                      ].join('\n'),
                    ),
                  );
                } else {
                  emit(
                    text(
                      'No external components found in configured integrations.',
                    ),
                    text(
                      `Find more packages: ${run} discover --available (needs a discover source)`,
                    ),
                  );
                }
                break;
              }
              emit(
                records(result.data, listOpts),
                text(
                  [
                    'Usage:',
                    `  ${run} discover <package>            Browse a package`,
                    `  ${run} discover <package>/Component  View component docs`,
                    `  ${run} discover <search>             Search all packages`,
                  ].join('\n'),
                ),
              );
              break;
            }

            const kind = options.type
              ? (KIND_PLURALS[options.type] ?? options.type)
              : null;
            /** @type {import('../formatters/index.mjs').Block[]} */
            const blocks = [];
            if (!options.available) {
              blocks.push(section('Installed'));
              blocks.push(
                result.data.length > 0
                  ? records(result.data, listOpts)
                  : text(
                      kind
                        ? `None of this project's integrations add ${kind}.`
                        : 'None yet.',
                    ),
              );
            }
            if (!options.installed) {
              blocks.push(section('Available', sourceSubtitle(sources)));
              blocks.push(
                available.length > 0
                  ? records(available, listOpts)
                  : text(
                      !sources.some(s => s.status !== 'failed')
                        ? 'No source answered, so there is nothing to list.'
                        : kind
                          ? `No package you could add adds ${kind}.`
                          : 'Nothing new to add: this project has every integration its sources list.',
                    ),
              );
            }
            blocks.push(...sourceNotes(sources));
            blocks.push(
              text(
                [
                  'Usage:',
                  `  ${run} discover <package>            Browse a package and its versions`,
                  `  ${run} discover <package>/<item>     View one item`,
                  `  ${run} discover <search>             Search every item and package`,
                ].join('\n'),
              ),
            );
            emit(...blocks);
            break;
          }

          case 'discover.detail': {
            const d = result.data;
            /** @type {import('../formatters/index.mjs').Block[]} */
            const blocks = [record(d, {omit: ['versions', 'install']})];
            if (d.versions) {
              const shown = d.version;
              const lines = versionLines(d.versions, {
                shown,
                installed: d.installed
                  ? (d.installedVersion ?? d.version)
                  : undefined,
                latest: d.latest,
              });
              const prereleases = d.versions.filter(v => v.prerelease).length;
              blocks.push(
                section(
                  'Versions',
                  `${d.versions.length} published, newest first`,
                ),
              );
              if (lines.length > 0) blocks.push(list(lines));
              if (prereleases > 0) {
                blocks.push(
                  text(
                    `${prereleases === 1 ? '1 prerelease is' : `${prereleases} prereleases are`} not listed. See any version: ${run} discover ${d.name}@<version>`,
                  ),
                );
              }
            }
            if (d.install) {
              blocks.push(
                section('Add it'),
                code(d.install),
                text(
                  'Astryx loads an integration on the next command once it is a dependency.',
                ),
              );
            } else if (d.installedAs) {
              blocks.push(
                text(
                  `This project already has this integration as ${d.installedAs}.`,
                ),
              );
            }
            blocks.push(
              text(
                d.installed
                  ? `Usage: ${run} discover ${d.name}/<ComponentName>`
                  : `See one item: ${run} discover ${d.name}/<item>`,
              ),
            );
            emit(...blocks);
            break;
          }

          case 'discover.detail.doc': {
            const docs = result.data;
            const md =
              detail === 'brief'
                ? formatBrief(docs, docs.name, '')
                : detail === 'compact'
                  ? formatCompact(docs, docs.name, '')
                  : formatFull(docs);
            emit(code(md));
            break;
          }

          case 'discover.item': {
            const d = result.data;
            emit(
              record(d, {omit: ['install']}),
              ...(d.install
                ? [
                    section('Add it'),
                    code(d.install),
                    text(
                      'Astryx loads an integration on the next command once it is a dependency.',
                    ),
                  ]
                : []),
              text(`Its package: ${run} discover ${d.package}`),
            );
            break;
          }

          case 'discover.search': {
            const {query: q, matches, total} = result.data;
            const count = total ?? matches.length;
            emit(
              section(
                `Found ${count} ${count === 1 ? 'match' : 'matches'} for "${q}"`,
                total != null
                  ? `showing the first ${matches.length}`
                  : undefined,
              ),
              list(
                matches.map(m => {
                  const target =
                    m.kind === 'package'
                      ? m.package
                      : `${m.package}/${m.component}`;
                  const tags = [
                    m.kind && m.kind !== 'component' ? m.kind : '',
                    m.installed === false ? 'not installed' : '',
                  ].filter(Boolean);
                  return `${run} discover ${target}${tags.length ? `  (${tags.join(', ')})` : ''}`;
                }),
              ),
            );
            break;
          }
        }
        return answered;
      },
  });
}
