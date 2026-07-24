// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file docs command — Print Astryx reference docs
 *
 * Auto-discovers .doc.mjs files from the docs/ directory.
 * Supports --detail (full|compact|brief) and --lang (en|zh|dense).
 *
 * Usage:
 *   astryx docs                          List available topics
 *   astryx docs <topic>                  Print full doc
 *   astryx docs <topic> <section>        Print one section
 */

import {getCliInvocation} from '../utils/package-manager.mjs';
import {jsonOut, humanLog} from '../lib/json.mjs';
import {cliError} from '../lib/cli-error.mjs';
import {docs as docsApi} from '../api/docs.mjs';

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
 * @param {import('../../../core/src/docs-types').ContentBlock} block
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
      const prefix = block.style === 'ordered' ? (/** @type {number} */ i) => `${i + 1}. `
        : block.style === 'dont' ? () => '❌ '
        : block.style === 'do' ? () => '✓ '
        : () => '- ';
      return block.items.map((item, i) => `${prefix(i)}${item}`).join('\n');
    }

    default:
      return null;
  }
}

/**
 * @param {import('../../../core/src/docs-types').ReferenceSection} section
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

  const heading = detail === 'compact' ? `[${section.title}]` : `## ${section.title}`;
  return `${heading}\n\n${blocks.join('\n\n')}`;
}

/**
 * @param {import('../../../core/src/docs-types').ReferenceDoc} docs
 * @param {'full' | 'compact' | 'brief'} detail
 * @returns {string}
 */
function formatReferenceFull(docs, detail) {
  if (detail === 'brief') {
    const header = `${docs.title}: ${docs.description}`;
    const sections = docs.sections.map(s => formatSection(s, detail));
    return `${header}\n${sections.join('\n')}`;
  }

  const header = detail === 'compact'
    ? `# ${docs.title}\n${docs.description}`
    : `# ${docs.title}\n\n${docs.description}`;
  const sections = docs.sections.map(s => formatSection(s, detail));
  const sep = detail === 'compact' ? '\n\n' : '\n\n';
  return `${header}\n\n${sections.join(sep)}`;
}

// ─── Command ─────────────────────────────────────────────────────────────────

/**
 * @param {import('commander').Command} program
 */
export function registerDocs(program) {
  program
    .command('docs [topic] [section]')
    .description('Print reference docs')
    .action(async (/** @type {string | undefined} */ topic, /** @type {string | undefined} */ section) => {
      const run = getCliInvocation();
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const detail = program.opts().detail || 'full';
      const json = program.opts().json || false;

      let result;
      try {
        result = await docsApi(topic, section, {lang, zh, dense});
      } catch (e) {
        // docs API throws structured errors with {name, reason} suggestions —
        // pass them through untouched so the CLI envelope matches the API.
        const err = /** @type {import('../api/error.mjs').AstryxError} */ (e);
        cliError(err.message, {suggestions: err.suggestions || [], code: err.code});
        return;
      }

      if (json) return jsonOut(result.type, result.data);

      switch (result.type) {
        case 'docs.list': {
          humanLog('\nAvailable docs:\n');
          for (const entry of result.data) {
            humanLog(`  ${entry.topic.padEnd(14)} ${entry.description}`);
          }
          humanLog(`\nUsage: ${run} docs <topic>`);
          humanLog(`       ${run} docs <topic> <section>\n`);
          break;
        }

        case 'docs.detail': {
          humanLog(formatReferenceFull(result.data, detail));
          break;
        }

        case 'docs.detail.section': {
          humanLog(formatSection(result.data, detail));
          break;
        }
      }
    });
}
