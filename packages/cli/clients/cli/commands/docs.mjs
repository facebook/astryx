// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs command — Print Astryx reference docs
 *
 * In text, every read is one level: a topic lists its sections, so a reader can
 * open one section by its key, and `--full` prints the whole topic. `--json`
 * keeps the docs() contract: a topic returns its whole doc, and `--index` its
 * sections.
 * Supports --detail (full|compact|brief) and --lang (en|zh|dense).
 *
 * Usage:
 *   astryx docs                          List available topics
 *   astryx docs <topic>                  List the topic's sections (a topic
 *                                        with one section prints whole)
 *   astryx docs <topic> <section>        Print one section
 *   astryx docs <topic> --full           Print the whole topic
 *   astryx docs <route>                  Open a node of the docs tree, such as
 *                                        cli, cli/api, or cli/api/functions/search
 */

import {
  formatCliCommand,
  getCliInvocation,
} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {
  emit,
  section,
  records,
  text,
  code,
  wrapText,
} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {defineCommand} from '../lib/define-command.mjs';
import {resultSet} from '../../../foundation/debug/index.mjs';
import {docs as docsApi} from '../../../api/docs/docs.mjs';
import {doc as docsCommand} from './docs.doc.mjs';
import {doc as docsFn} from '../../../api/docs/docs.doc.mjs';

// ─── Formatting ──────────────────────────────────────────────────────────────

/**
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns {string}
 */
function formatTable(headers, rows) {
  const widths = headers.map((h, i) =>
    Math.max(h.length, ...rows.map(r => (r[i] || '').length)),
  );
  const sep = widths.map(w => '-'.repeat(w)).join(' | ');
  const head = headers.map((h, i) => h.padEnd(widths[i])).join(' | ');
  const body = rows
    .map(r => r.map((c, i) => (c || '').padEnd(widths[i])).join(' | '))
    .join('\n');
  return `${head}\n${sep}\n${body}`;
}

/**
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns {string}
 */
function formatTableCompact(headers, rows) {
  return rows.map(r => r.join(' = ')).join('\n');
}

/**
 * @param {import('@astryxdesign/cli/authoring').ReferenceContentBlock} block
 * @param {'full' | 'compact' | 'brief'} detail
 * @returns {string | null}
 */
function formatBlock(block, detail) {
  switch (block.type) {
    case 'prose':
      return block.text;

    case 'heading':
      return `${'#'.repeat(block.level || 3)} ${block.text}`;

    case 'code':
      if (detail === 'compact' || detail === 'brief') return null;
      {
        const label = block.label ? `// ${block.label}\n` : '';
        return `\`\`\`${block.lang}\n${label}${block.code}\n\`\`\``;
      }

    case 'table':
      if (detail === 'brief') {
        return block.rows.map(r => r.slice(0, 2).join('=')).join(' | ');
      }
      if (detail === 'compact') {
        return formatTableCompact(block.headers, block.rows);
      }
      return formatTable(block.headers, block.rows);

    case 'list': {
      const prefix =
        block.style === 'ordered'
          ? (/** @type {number} */ i) => `${i + 1}. `
          : block.style === 'dont'
            ? () => 'x '
            : block.style === 'do'
              ? () => '+ '
              : () => '- ';
      return block.items.map((item, i) => `${prefix(i)}${item}`).join('\n');
    }

    default:
      return null;
  }
}

/**
 * @param {import('@astryxdesign/cli/authoring').ReferenceSection} section
 * @param {'full' | 'compact' | 'brief'} detail
 * @returns {string}
 */
function formatSection(section, detail) {
  const blocks = section.content
    .map(b => formatBlock(b, detail))
    .filter(Boolean);

  if (detail === 'brief') {
    const first = blocks[0] || '';
    return `${section.title}: ${first.split('\n')[0]}`;
  }

  const heading =
    detail === 'compact' ? `[${section.title}]` : `## ${section.title}`;
  return `${heading}\n\n${blocks.join('\n\n')}`;
}

/**
 * @param {import('@astryxdesign/cli/authoring').ReferenceDoc} docs
 * @param {'full' | 'compact' | 'brief'} detail
 * @returns {string}
 */
function formatReferenceFull(docs, detail) {
  if (detail === 'brief') {
    const header = `${docs.title}: ${docs.description}`;
    const sections = docs.sections.map(s => formatSection(s, detail));
    return `${header}\n${sections.join('\n')}`;
  }

  const header =
    detail === 'compact'
      ? `# ${docs.title}\n${docs.description}`
      : `# ${docs.title}\n\n${docs.description}`;
  const sections = docs.sections.map(s => formatSection(s, detail));
  const sep = detail === 'compact' ? '\n\n' : '\n\n';
  return `${header}\n\n${sections.join(sep)}`;
}

/**
 * The moves a read offers (spec:AST-047), one runnable command per line: up to
 * the level it sits in, the item before and after it, and the docs it names.
 * @param {import('../../../api/docs/docs.type.mjs').DocsLinks | undefined} links
 * @returns {string[]}
 */
function linkLines(links) {
  if (!links) return [];
  return [
    `Up: ${formatCliCommand(links.up)}`,
    ...(links.previous ? [`Previous: ${formatCliCommand(links.previous)}`] : []),
    ...(links.next ? [`Next: ${formatCliCommand(links.next)}`] : []),
    ...(links.related ?? []).map(
      (command, i) => `${i === 0 ? 'Related: ' : '         '}${formatCliCommand(command)}`,
    ),
  ];
}

/**
 * A topic's section index: what the topic is, one line per section with the
 * key to read it by, and how to read further.
 * @param {import('../../../api/docs/docs.type.mjs').DocsIndex} index
 * @param {string} run
 */
function emitIndex(index, run) {
  emit(
    section(
      index.title,
      index.description ? wrapText(index.description) : undefined,
    ),
    // Summaries wrap rather than being cut: the summary is how a reader picks
    // the one section to open.
    records(index.sections, {
      fields: ['id', 'title', 'summary'],
      layout: 'inline',
    }),
    text(
      [
        `Read one section: ${run} docs ${index.name} <section>`,
        `Read everything:  ${run} docs ${index.name} --full`,
        ...linkLines(index.links),
      ].join('\n'),
    ),
  );
}

/**
 * One child row of a namespace: its route name, then the doc's own title when
 * it is not the route name (`assertResponse()`, `search()`), then its summary.
 * @param {import('../../../api/docs/docs.type.mjs').DocsNodeChild} child
 * @returns {{name: string, summary: string}}
 */
function childRow(child) {
  return {
    name: child.name,
    summary:
      child.title === child.name ? child.summary : `${child.title}: ${child.summary}`,
  };
}

/**
 * One node of the docs tree. A namespace lists each slot's children, one level
 * down, with the command to open one; a typed doc prints its content. Both end
 * with the way back up.
 * @param {import('../../../api/docs/docs.type.mjs').DocsNode} node
 * @param {'full' | 'compact' | 'brief'} detail
 * @param {string} run
 */
function emitNode(node, detail, run) {
  if (node.kind === 'namespace') {
    emit(
      section(node.title, wrapText(node.summary)),
      ...node.slots.flatMap(slot => [
        // A namespace with one slot titled like itself needs no second heading.
        ...(node.slots.length === 1 && slot.title === node.title
          ? []
          : [section(slot.title)]),
        records(slot.children.map(childRow), {
          fields: ['name', 'summary'],
          layout: 'inline',
          overflow: 'truncate',
        }),
      ]),
      text(
        [
          // A child's route is its parent's route and its name, except a flat
          // topic in the Unorganized level, which keeps its own name.
          node.slots.every(slot =>
            slot.children.every(child => child.route.startsWith(`${node.route}/`)),
          )
            ? `Open one: ${run} docs ${node.route}/<name>`
            : `Open one: ${run} docs <name>`,
          ...linkLines(node.links),
        ].join('\n'),
      ),
    );
    return;
  }
  emit(
    code(formatSection({title: node.title, content: node.content}, detail)),
    text(linkLines(node.links).join('\n')),
  );
}

/**
 * What the run answered with. A named topic (or one of its sections) resolves
 * or throws, so it is always a direct match of one doc; the bare form lists
 * every topic there is.
 *
 * @param {import('../../../api/docs/docs.type.mjs').DocsListResponse
 *   | import('../../../api/docs/docs.type.mjs').DocsIndexResponse
 *   | import('../../../api/docs/docs.type.mjs').DocsDetailResponse
 *   | import('../../../api/docs/docs.type.mjs').DocsDetailSectionResponse
 *   | import('../../../api/docs/docs.type.mjs').DocsNodeResponse} result
 * @returns {import('../../../foundation/debug/command-result.mjs').CommandResult}
 */
function summarize(result) {
  return result.type === 'docs.list'
    ? resultSet({count: result.data.length, resultKind: 'doc'})
    : resultSet({count: 1, resultKind: 'doc', directMatch: true});
}

// ─── Command ─────────────────────────────────────────────────────────────────

/**
 * @param {import('commander').Command} program
 */
export function registerDocs(program) {
  defineCommand(program, docsCommand, {
    fn: docsFn,
    action: async (
      /** @type {string | undefined} */ topic,
      /** @type {string | undefined} */ sectionName,
      /** @type {{index?: boolean, full?: boolean}} */ options = {},
    ) => {
      const run = getCliInvocation();
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;

      if (options.index && options.full) {
        return cliError(
          'Ask for the section list or the whole topic, not both: --index and --full cannot both be set.',
          {code: ERROR_CODES.ERR_INVALID_ARGUMENT},
        );
      }
      // Text reads one level: a topic lists its sections (one with a single
      // section prints whole). JSON keeps docs(): the whole topic unless
      // --index. The dense variant is written to be read whole.
      const listSections =
        Boolean(options.index) ||
        (!json &&
          !options.full &&
          !dense &&
          lang !== 'dense' &&
          sectionName == null);
      let result;
      try {
        result = await docsApi(topic, sectionName, {
          lang,
          zh,
          dense,
          index: listSections,
        });
        if (
          !options.index &&
          result.type === 'docs.index' &&
          result.data.sections.length <= 1
        ) {
          result = await docsApi(topic, sectionName, {lang, zh, dense});
        }
      } catch (e) {
        // docs API throws structured errors with {name, reason} suggestions —
        // pass them through untouched so the CLI envelope matches the API.
        const err =
          /** @type {import('../../../api/error.mjs').AstryxError} */ (e);
        return cliError(err.message, {
          suggestions: err.suggestions || [],
          code: err.code,
        });
      }

      const answered = summarize(result);
      if (json) {
        jsonOut(result);
        return answered;
      }

      switch (result.type) {
        case 'docs.list': {
          // The text view mirrors the JSON list, with the docs tree's
          // namespaces (`meta.namespaces`) first under their own heading: that
          // is where the CLI's own docs start, and a namespace reads
          // differently from a topic.
          const namespaces = result.meta?.namespaces ?? [];
          const topics = result.data;
          emit(
            ...(namespaces.length > 0
              ? [
                  section('Docs tree'),
                  records(namespaces, {
                    fields: ['topic', 'description', 'package'],
                    layout: 'inline',
                  }),
                ]
              : []),
            section('Topics'),
            records(topics, {
              fields: ['topic', 'description', 'package'],
              layout: 'inline',
            }),
            text(
              [
                `Usage: ${run} docs <topic>                  list a topic's sections`,
                `       ${run} docs <topic> <section>        read one section`,
                `       ${run} docs <topic> --full           read the whole topic`,
                `       ${run} docs cli/api                  go down the docs tree one level at a time`,
                `With --json, a topic returns its whole doc; add --index for its section list.`,
              ].join('\n'),
            ),
            // A package whose doc files did not load has no topics here; say
            // so, and where to look, instead of leaving them silently missing.
            ...(result.meta?.notLoaded?.length
              ? [
                  section('Not loaded'),
                  records(result.meta.notLoaded, {
                    fields: ['package', 'message'],
                    layout: 'inline',
                  }),
                  text(
                    `Run \`${run} doctor integration docs\` in that package to see every problem.`,
                  ),
                ]
              : []),
          );
          break;
        }

        case 'docs.index': {
          emitIndex(result.data, run);
          break;
        }

        case 'docs.detail': {
          emit(
            code(formatReferenceFull(result.data, detail)),
            text(linkLines(result.data.links).join('\n')),
          );
          break;
        }

        case 'docs.detail.section': {
          // One section ends with its moves: up to its topic's index, and to
          // the sections before and after it.
          emit(
            code(formatSection(result.data, detail)),
            text(linkLines(result.data.links).join('\n')),
          );
          break;
        }

        case 'docs.node': {
          emitNode(result.data, detail, run);
          break;
        }
      }
      return answered;
    },
  });
}
