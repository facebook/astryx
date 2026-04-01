/**
 * @file docs command — Print XDS reference docs
 *
 * Auto-discovers .doc.mjs files from the docs/ directory.
 * Supports --detail (full|compact|brief) and --lang (en|zh|dense).
 *
 * Usage:
 *   xds docs                          List available topics
 *   xds docs <topic>                  Print full doc
 *   xds docs <topic> <section>        Print one section
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../utils/paths.mjs';
import {getRunPrefix} from '../utils/package-manager.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

// ─── Discovery ───────────────────────────────────────────────────────────────

/**
 * Discover all .doc.mjs files in the docs directory.
 * Returns a map of topic name -> file path.
 */
function discoverTopics() {
  const topics = {};
  if (!fs.existsSync(DOCS_DIR)) return topics;

  for (const file of fs.readdirSync(DOCS_DIR)) {
    // Match foo.doc.mjs but not foo.doc.dense.mjs or foo.doc.zh.mjs
    const match = file.match(/^(\w+)\.doc\.mjs$/);
    if (match) {
      topics[match[1]] = path.join(DOCS_DIR, file);
    }
  }
  return topics;
}

// ─── Loading ─────────────────────────────────────────────────────────────────

/**
 * Load a reference doc, optionally merging a translation overlay.
 */
async function loadReferenceDocs(docPath, {lang} = {}) {
  const mod = await import(pathToFileURL(docPath).href);
  const docs = mod.docs;

  if (!lang || lang === 'en') return docs;

  // Try loading translation file: foo.doc.zh.mjs or foo.doc.dense.mjs
  const dir = path.dirname(docPath);
  const base = path.basename(docPath, '.doc.mjs');
  const locale = lang === 'dense' ? 'dense' : lang;
  const translationPath = path.join(dir, `${base}.doc.${locale}.mjs`);

  if (!fs.existsSync(translationPath)) return docs;

  const translationMod = await import(pathToFileURL(translationPath).href);
  const translation = translationMod.docsZh || translationMod.docsDense;

  if (!translation) return docs;

  return mergeTranslation(docs, translation);
}

/**
 * Merge a translation overlay onto a base reference doc.
 * Prose and list blocks get swapped. Code and table blocks pass through.
 */
function mergeTranslation(base, translation) {
  return {
    ...base,
    description: translation.description || base.description,
    sections: base.sections.map((section, si) => {
      const ts = translation.sections?.[si];
      if (!ts) return section;

      return {
        ...section,
        title: ts.title || section.title,
        content: section.content.map((block, bi) => {
          const tb = ts.content?.[bi];
          if (!tb) return block;

          if (tb.type === 'prose' && block.type === 'prose') {
            return {...block, text: tb.text};
          }
          if (tb.type === 'list' && block.type === 'list') {
            return {...block, items: tb.items};
          }
          return block;
        }),
      };
    }),
  };
}

// ─── Formatting ──────────────────────────────────────────────────────────────

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

function formatTableCompact(headers, rows) {
  // key=value pairs, one line per row
  return rows.map(r => r.join(' = ')).join('\n');
}

function formatBlock(block, detail) {
  switch (block.type) {
    case 'prose':
      return block.text;

    case 'code':
      if (detail === 'compact' || detail === 'brief') return null;
      const label = block.label ? `// ${block.label}\n` : '';
      return `\`\`\`${block.lang}\n${label}${block.code}\n\`\`\``;

    case 'table':
      if (detail === 'brief') {
        // One-liner: first two columns as key=value
        return block.rows.map(r => r.slice(0, 2).join('=')).join(' | ');
      }
      if (detail === 'compact') {
        return formatTableCompact(block.headers, block.rows);
      }
      return formatTable(block.headers, block.rows);

    case 'list': {
      const prefix = block.style === 'ordered' ? (i) => `${i + 1}. `
        : block.style === 'dont' ? () => '❌ '
        : block.style === 'do' ? () => '✓ '
        : () => '- ';
      return block.items.map((item, i) => `${prefix(i)}${item}`).join('\n');
    }

    default:
      return null;
  }
}

function formatSection(section, detail) {
  const blocks = section.content
    .map(b => formatBlock(b, detail))
    .filter(Boolean);

  if (detail === 'brief') {
    // Just the first prose block or first table one-liner
    const first = blocks[0] || '';
    return `${section.title}: ${first.split('\n')[0]}`;
  }

  const heading = detail === 'compact' ? `[${section.title}]` : `## ${section.title}`;
  return `${heading}\n\n${blocks.join('\n\n')}`;
}

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

export function registerDocs(program) {
  program
    .command('docs [topic] [section]')
    .description('Print XDS reference docs')
    .action(async (topic, section) => {
      const run = getRunPrefix();
      const topics = discoverTopics();
      const lang = program.opts().lang || null;
      const zh = program.opts().zh || false;
      const dense = program.opts().dense || false;
      const detail = program.opts().detail || 'full';
      const effectiveLang = lang || (dense ? 'dense' : zh ? 'zh' : null);

      if (!topic) {
        console.log('\nAvailable docs:\n');
        for (const [name, docPath] of Object.entries(topics)) {
          try {
            const mod = await import(pathToFileURL(docPath).href);
            console.log(`  ${name.padEnd(14)} ${mod.docs.description}`);
          } catch {
            console.log(`  ${name}`);
          }
        }
        console.log(`\nUsage: ${run} xds docs <topic>`);
        console.log(`       ${run} xds docs <topic> <section>\n`);
        return;
      }

      const normalized = topic.toLowerCase();

      if (!topics[normalized]) {
        // Fallback: try legacy .md file
        const mdPath = path.join(DOCS_DIR, `${normalized}.md`);
        if (fs.existsSync(mdPath)) {
          console.log(fs.readFileSync(mdPath, 'utf-8'));
          return;
        }

        console.error(`Error: Unknown topic "${topic}".`);
        console.error(`Available topics: ${Object.keys(topics).join(', ')}`);
        process.exit(1);
      }

      const docs = await loadReferenceDocs(topics[normalized], {lang: effectiveLang});

      if (section) {
        const normalizedSection = section.toLowerCase();
        const match = docs.sections.find(
          s => s.title.toLowerCase().includes(normalizedSection),
        );
        if (!match) {
          console.error(`Error: Section "${section}" not found in "${topic}".`);
          console.error(
            `Available sections: ${docs.sections.map(s => s.title).join(', ')}`,
          );
          process.exit(1);
        }
        console.log(formatSection(match, detail));
        return;
      }

      console.log(formatReferenceFull(docs, detail));
    });
}
