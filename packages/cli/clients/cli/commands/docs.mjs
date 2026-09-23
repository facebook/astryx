// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs command — Print Astryx reference docs
 *
 * Reads are progressive: the topic list, then one topic's section index, then
 * one section by its key, or the whole topic with `--detail full`.
 * Supports --detail (full|compact|brief) and --lang (en|zh|dense).
 *
 * Usage:
 *   astryx docs                          List available topics
 *   astryx docs <topic>                  List the topic's sections
 *   astryx docs <topic> <section>        Print one section
 *   astryx docs <topic> --detail full    Print the whole topic
 */

import {getCliInvocation} from '../../../foundation/env/package-manager.mjs';
import {jsonOut} from '../../../foundation/response/json.mjs';
import {
  emit,
  section,
  records,
  text,
  code,
  wrapText,
  WRAP_WIDTH,
} from '../formatters/index.mjs';
import {cliError} from '../lib/cli-error.mjs';
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
 * A table too wide for {@link WRAP_WIDTH}: one `header: cell` line per cell and
 * a blank line between rows, so nothing runs off the side of a terminal.
 * @param {string[]} headers
 * @param {string[][]} rows
 * @returns {string}
 */
function formatTableVertical(headers, rows) {
  const width = Math.max(...headers.map(h => h.length)) + 2;
  return rows
    .map(row =>
      headers
        .map((h, i) =>
          wrapText(`${`${h}:`.padEnd(width)}${row[i] ?? ''}`, {
            indent: ' '.repeat(width),
          }),
        )
        .join('\n'),
    )
    .join('\n\n');
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
      return wrapText(block.text);

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
      {
        const table = formatTable(block.headers, block.rows);
        return table.split('\n').some(line => line.length > WRAP_WIDTH)
          ? formatTableVertical(block.headers, block.rows)
          : table;
      }

    case 'list': {
      const prefix =
        block.style === 'ordered'
          ? (/** @type {number} */ i) => `${i + 1}. `
          : block.style === 'dont'
            ? () => 'x '
            : block.style === 'do'
              ? () => '+ '
              : () => '- ';
      return block.items
        .map((item, i) => {
          const head = prefix(i);
          return wrapText(`${head}${item}`, {indent: ' '.repeat(head.length)});
        })
        .join('\n');
    }

    case 'workflow':
    case 'collection':
    case 'reference':
      throw new Error(
        `Documentation block "${block.type}" requires the compiled graph renderer.`,
      );

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
 * A topic's section index: what the topic is, one line per section with the
 * key to read it by, and how to read further.
 * @param {import('../../../api/docs/docs.type.mjs').DocsIndex} index
 * @param {string} run
 */
function emitIndex(index, run) {
  emit(
    section(index.title, index.description ? wrapText(index.description) : undefined),
    records(index.sections, {
      fields: ['id', 'title', 'summary'],
      layout: 'inline',
      overflow: 'truncate',
    }),
    text(
      [
        `Read one section: ${run} docs ${index.name} <section>`,
        `Read everything:  ${run} docs ${index.name} --detail full`,
      ].join('\n'),
    ),
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
 *   | import('../../../api/docs/docs.type.mjs').DocsDetailSectionResponse} result
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
    ) => {
      const run = getCliInvocation();
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;
      // --detail defaults to full, so only an explicit `--detail full` asks for
      // a whole topic; a plain topic read is its section index.
      const wholeTopic =
        detail === 'full' && program.getOptionValueSource?.('detail') === 'cli';

      let result;
      try {
        result = await docsApi(topic, sectionName, {
          lang,
          zh,
          dense,
          ...(wholeTopic ? {detail: 'full'} : {}),
        });
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
          // The text view mirrors the JSON list: one record per topic (topic +
          // description), then the usage footer as plain prose.
          emit(
            section('Available docs'),
            records(result.data, {
              fields: ['topic', 'description'],
              layout: 'inline',
            }),
            text(
              [
                `Usage: ${run} docs <topic>                  list its sections`,
                `       ${run} docs <topic> <section>        read one section`,
                `       ${run} docs <topic> --detail full    read everything`,
              ].join('\n'),
            ),
          );
          break;
        }

        case 'docs.index': {
          emitIndex(result.data, run);
          break;
        }

        case 'docs.detail': {
          emit(code(formatReferenceFull(result.data, detail)));
          break;
        }

        case 'docs.detail.section': {
          emit(code(formatSection(result.data, detail)));
          break;
        }
      }
      return answered;
    },
  });
}
