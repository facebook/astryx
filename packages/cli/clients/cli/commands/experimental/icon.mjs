// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `astryx experimental icon` — find an icon by meaning in the installed
 * icon sets, and author a set (AST-084 FR6, FR7). Experimental (spec:AST-017
 * FR27): it is registered only under the `experimental` group.
 *
 * The command surface comes from the colocated `icon.doc.mjs` CommandDoc via
 * `defineCommand`; this file parses flags, calls `icon()`, and renders.
 *
 * Usage:
 *   astryx experimental icon delete              Ranked matches with import lines
 *   astryx experimental icon outline/trash       One icon and every variant's import
 *   astryx experimental icon --list              Installed sets and the names they fill
 *   astryx experimental icon arrow --set outline --limit 3
 */

import {
  formatCliCommand,
  getCliInvocation,
} from '../../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../../foundation/response/json.mjs';
import {resultSet} from '../../../../foundation/debug/index.mjs';
import {
  emit,
  section,
  text,
  record,
  records,
  list,
} from '../../formatters/index.mjs';
import {cliError} from '../../lib/cli-error.mjs';
import {defineCommand} from '../../lib/define-command.mjs';
import {icon as iconApi} from '../../../../api/icon/icon.mjs';
import {iconAdd} from '../../../../api/icon/add/add.mjs';
import {iconMap} from '../../../../api/icon/map/map.mjs';
import {iconUse} from '../../../../api/icon/use/use.mjs';
import {iconNewSet} from '../../../../api/icon/new-set/new-set.mjs';
import {iconNewDefinition} from '../../../../api/icon/new-definition/new-definition.mjs';
import {doc as iconCommand} from '../experimental-icon.doc.mjs';
import {doc as iconUseCommand} from '../experimental-icon-use.doc.mjs';
import {doc as iconMapCommand} from '../experimental-icon-map.doc.mjs';
import {doc as iconAddCommand} from '../experimental-icon-add.doc.mjs';
import {doc as iconNewSetCommand} from '../experimental-icon-new-set.doc.mjs';
import {doc as iconNewDefinitionCommand} from '../experimental-icon-new-definition.doc.mjs';
import {doc as iconFn} from '../../../../api/icon/icon.doc.mjs';
import {doc as iconUseFn} from '../../../../api/icon/iconUse.doc.mjs';
import {doc as iconMapFn} from '../../../../api/icon/iconMap.doc.mjs';
import {doc as iconAddFn} from '../../../../api/icon/iconAdd.doc.mjs';
import {doc as iconNewSetFn} from '../../../../api/icon/iconNewSet.doc.mjs';
import {doc as iconNewDefinitionFn} from '../../../../api/icon/iconNewDefinition.doc.mjs';
import {NO_RESULT_SET} from '../../../../foundation/debug/index.mjs';

/** @param {unknown} value */
const defaultVariantText = value =>
  /** @type {{variant?: string} | null} */ (value)?.variant ?? '';

/** @param {unknown} value */
const variantsText = value => (Array.isArray(value) ? value.join('/') : '');

/**
 * Register `icon` and its subcommands under the `experimental` group.
 * @param {import('commander').Command} group the `experimental` command
 * @param {import('commander').Command} program the root program
 */
export function registerExperimentalIcon(group, program) {
  const iconCli = defineCommand(group, iconCommand, {
    fn: iconFn,
    action: async (
      /** @type {string[] | string | undefined} */ words,
      /** @type {{list?: boolean, set?: string, limit?: string}} */ options,
    ) => {
      const json = program.opts().json || false;
      const query = Array.isArray(words) ? words.join(' ') : words;
      // Number(), not parseInt(): the API refuses `1.5` and `5abc`.
      const limit = options.limit != null ? Number(options.limit) : undefined;

      /** @type {Awaited<ReturnType<typeof iconApi>>} */
      let result;
      try {
        result = await iconApi(query, {
          cwd: process.cwd(),
          list: options.list ?? false,
          set: options.set,
          limit,
        });
      } catch (e) {
        const err =
          /** @type {import('../../../../api/error.mjs').AstryxError} */ (e);
        return cliError(err.message, {
          suggestions: err.suggestions,
          code: err.code,
        });
      }

      const answered =
        result.type === 'icon.search'
          ? resultSet({
              count: result.data.matchCount,
              resultKind: 'mixed',
              empty: result.data.matchCount === 0,
            })
          : result.type === 'icon.list'
            ? resultSet({
                count: result.data.sets.length,
                resultKind: 'mixed',
                empty: result.data.sets.length === 0,
              })
            : resultSet({count: 1, resultKind: 'mixed', directMatch: true});

      if (json) {
        jsonOut(result);
        return answered;
      }

      const run = getCliInvocation();
      if (result.type === 'icon.search') {
        const {query: q, matchCount, matches} = result.data;
        if (matches.length === 0) {
          emit(
            text(`No icons match "${q}".`),
            text(`See the installed sets: ${run} experimental icon --list`),
          );
          return answered;
        }
        emit(
          section(
            matchCount > matches.length
              ? `Icons for "${q}" (${matches.length} of ${matchCount})`
              : `Icons for "${q}" (${matches.length})`,
          ),
          // A match's variants are read with `icon <set>/<id>`; each match
          // with any says how many.
          records(
            matches.map(({variants, ...match}) => ({
              ...match,
              ...(variants.length > 0
                ? {variant: variants.map(each => each.variant).join(', ')}
                : {}),
            })),
            {
              fields: [
                'set',
                'id',
                'package',
                'import',
                'words',
                'definitions',
                'variant',
                'reason',
              ],
            },
          ),
          text(
            `Read one with its variants: ${run} experimental icon <set>/<id>`,
          ),
        );
        return answered;
      }

      if (result.type === 'icon.detail') {
        const {variants, ...rest} = result.data;
        emit(
          record(rest, {
            fields: [
              'set',
              'id',
              'package',
              'module',
              'export',
              'import',
              'words',
              'definitions',
            ],
          }),
          ...(variants.length > 0
            ? [
                section('Variants'),
                records(variants, {
                  fields: ['variant', 'module', 'export', 'import'],
                }),
              ]
            : []),
          text(
            `More icons: ${formatCliCommand(`astryx experimental icon ${rest.words[0]}`)}`,
          ),
        );
        return answered;
      }

      const {status, projectSet, reason, sets, withdrawn} = result.data;
      emit(
        section('Icon sets'),
        record({status, projectSet, reason}),
        ...(sets.length > 0
          ? [
              records(
                sets.map(({coverage, ...set}) => ({
                  ...set,
                  builtIn: `${coverage.builtIn.mapped}/${coverage.builtIn.total}`,
                  definitions: `${coverage.astryx.mapped}/${coverage.astryx.total}`,
                  own: coverage.own,
                  missing: coverage.builtIn.missing,
                })),
                {
                  fields: [
                    'name',
                    'displayName',
                    'package',
                    'license',
                    'iconCount',
                    'default',
                    'variants',
                    'builtIn',
                    'definitions',
                    'own',
                    'missing',
                    'project',
                    'description',
                  ],
                  format: {default: defaultVariantText, variants: variantsText},
                },
              ),
            ]
          : []),
        ...(withdrawn.length > 0
          ? [
              section('Withdrawn'),
              list(
                withdrawn.map(
                  each => `${each.package}/${each.name}: ${each.reason}`,
                ),
              ),
            ]
          : []),
        text(`Find one: ${run} experimental icon <words>`),
      );
      return answered;
    },
  });

  /**
   * Run one authoring call and print its receipt, or its error.
   * @param {() => Promise<any>} call
   * @param {(result: any) => void} print
   */
  const run = async (call, print) => {
    let result;
    try {
      result = await call();
    } catch (e) {
      const err =
        /** @type {import('../../../../api/error.mjs').AstryxError} */ (e);
      return cliError(err.message, {
        suggestions: err.suggestions ?? [],
        code: err.code,
      });
    }
    if (program.opts().json) jsonOut(result);
    else print(result);
    return NO_RESULT_SET;
  };

  defineCommand(iconCli, iconUseCommand, {
    fn: iconUseFn,
    action: (/** @type {string} */ set) =>
      run(
        () => iconUse(set, {cwd: process.cwd()}),
        ({data}) =>
          emit(
            text(
              data.changed
                ? `[ok] experimental.iconSet is now "${data.iconSet}" (${data.set}) in ${data.config}${data.created ? ', created' : ''}.`
                : `[ok] experimental.iconSet already names "${data.iconSet}" in ${data.config}.`,
            ),
            ...(data.previous && data.changed
              ? [text(`It was "${data.previous}".`)]
              : []),
            ...(data.warning ? [text(`[warn] ${data.warning}`)] : []),
          ),
      ),
  });

  defineCommand(iconCli, iconMapCommand, {
    fn: iconMapFn,
    action: (
      /** @type {string} */ definition,
      /** @type {string | undefined} */ iconId,
      /** @type {{set?: string, remove?: boolean}} */ options,
    ) =>
      run(
        () =>
          iconMap(definition, iconId, {
            cwd: process.cwd(),
            set: options.set,
            remove: options.remove ?? false,
          }),
        ({data}) =>
          emit(
            text(
              data.icon == null
                ? data.changed
                  ? `[ok] Removed map.${data.definition} (was "${data.previous}") from ${data.file}.`
                  : `[ok] ${data.file} has no map.${data.definition}.`
                : data.changed
                  ? `[ok] map.${data.definition} = "${data.icon}" in ${data.file}${data.previous ? ` (was "${data.previous}")` : ''}.`
                  : `[ok] map.${data.definition} is already "${data.icon}".`,
            ),
          ),
      ),
  });

  defineCommand(iconCli, iconAddCommand, {
    fn: iconAddFn,
    action: (
      /** @type {string} */ exportName,
      /** @type {Record<string, string | boolean | undefined>} */ options,
    ) =>
      run(
        () =>
          iconAdd(exportName, {
            cwd: process.cwd(),
            from: /** @type {string} */ (options.from),
            set: /** @type {string | undefined} */ (options.set),
            definition: /** @type {string | undefined} */ (options.definition),
            newDefinition: /** @type {string | undefined} */ (
              options.newDefinition
            ),
            description: /** @type {string | undefined} */ (
              options.description
            ),
            words:
              typeof options.words === 'string'
                ? options.words.split(',')
                : undefined,
            useDefault: options.default === true,
            variant: /** @type {string | undefined} */ (options.variant),
            id: /** @type {string | undefined} */ (options.id),
          }),
        result => {
          const cli = getCliInvocation();
          if (result.type === 'icon.definitionMatches') {
            const {matches, newDefinition} = result.data;
            emit(
              section(
                `Icon definitions for ${result.data.export} (${matches.length})`,
              ),
              ...(matches.length > 0
                ? [
                    records(matches, {
                      fields: [
                        'name',
                        'source',
                        'score',
                        'reason',
                        'description',
                        'command',
                      ],
                      format: {
                        command: (/** @type {string} */ value) =>
                          formatCliCommand(value),
                      },
                    }),
                  ]
                : [text('No icon definition fits it.')]),
              ...(newDefinition
                ? [
                    text(
                      `None fits well? Add your own: ${formatCliCommand(newDefinition)}`,
                    ),
                  ]
                : []),
              text(
                `All icon definitions: ${cli} docs cli/experimental/icon-definitions`,
              ),
            );
            return;
          }
          const {data} = result;
          emit(
            text(
              data.changed
                ? `[ok] Added ${data.icon.export} as "${data.icon.id}"${data.variant ? ` (variant ${data.variant})` : ''}${data.definition ? `, map.${data.definition} = "${data.icon.id}"` : ''}.`
                : `[ok] ${data.icon.export} is already "${data.icon.id}"${data.definition ? ` and map.${data.definition} names it` : ''}.`,
            ),
            ...(data.files.length > 0 ? [list(data.files)] : []),
            ...(data.note ? [text(`[next] ${data.note}`)] : []),
          );
        },
      ),
  });

  /**
   * Print a new-set or new-definition receipt: what it wrote and where.
   * @param {string} what `icon set` or `icon definition`
   */
  const printNew =
    (/** @type {string} */ what) =>
    (
      /** @type {import('../../../../api/icon/icon.type.mjs').IconNewResponse} */ {
        data,
      },
    ) => {
      const {root, manifest, files, written, dryRun} = data;
      const state = dryRun ? 'plan' : written ? 'ok' : 'unchanged';
      emit(
        section(
          dryRun
            ? `New ${what} plan`
            : written
              ? `New ${what} added`
              : `New ${what} unchanged`,
        ),
        text(`[${state}] ${data.name}`),
        text(
          root != null
            ? `${root.created ? 'Declare' : 'Use'} experimental.iconSets root ${root.path} in ${manifest}.`
            : `Update ${manifest}.`,
        ),
        ...(files.length > 0 ? [list(files)] : []),
        ...(data.notes ?? []).map(note => text(`[next] ${note}`)),
      );
    };

  defineCommand(iconCli, iconNewSetCommand, {
    fn: iconNewSetFn,
    action: (
      /** @type {string} */ name,
      /** @type {{dryRun?: boolean, from?: string, exclude?: string}} */ options,
    ) =>
      run(
        () =>
          iconNewSet(name, {
            cwd: process.cwd(),
            dryRun: options.dryRun,
            from: options.from,
            exclude: options.exclude,
          }),
        printNew('icon set'),
      ),
  }).allowExcessArguments(false);

  defineCommand(iconCli, iconNewDefinitionCommand, {
    fn: iconNewDefinitionFn,
    action: (
      /** @type {string} */ name,
      /** @type {{dryRun?: boolean, set?: string, description?: string, words?: string, icon?: string}} */ options,
    ) =>
      run(
        () =>
          iconNewDefinition(name, {
            cwd: process.cwd(),
            dryRun: options.dryRun,
            set: options.set,
            description: options.description,
            words: options.words,
            icon: options.icon,
          }),
        printNew('icon definition'),
      ),
  }).allowExcessArguments(false);
}
