/**
 * @file docs command — Print XDS reference docs
 *
 * `xds docs` lists available topics.
 * `xds docs <topic>` prints the doc content.
 * Supports --lang for translations (dense, zh).
 */

import * as path from 'node:path';
import {pathToFileURL} from 'node:url';
import {CLI_ROOT} from '../utils/paths.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

const TOPICS = {
  principles: 'XDS design principles, rules, and anti-patterns',
  tokens: 'Full design token reference (spacing, colors, radius, typography)',
  theme: 'Theme system: XDSTheme, custom themes, overrides, light/dark mode',
};

/**
 * Load a reference doc, respecting --lang for translations.
 */
async function loadRefDoc(topic, {lang} = {}) {
  const docPath = path.join(DOCS_DIR, `${topic}.doc.mjs`);
  const mod = await import(pathToFileURL(docPath).href);

  const locale = lang || null;
  if (!locale) return mod.docs.content;

  const translationKey = locale === 'zh' ? 'docsZh' : locale === 'dense' ? 'docsDense' : null;
  if (!translationKey || !mod[translationKey]) return mod.docs.content;

  return mod[translationKey].content;
}

export function registerDocs(program) {
  program
    .command('docs [topic]')
    .description('Print XDS reference docs (principles, tokens, theme)')
    .action(async (topic) => {
      if (!topic) {
        console.log('\nAvailable docs:\n');
        for (const [name, desc] of Object.entries(TOPICS)) {
          console.log(`  ${name.padEnd(14)} ${desc}`);
        }
        console.log('\nUsage: npx xds docs <topic>\n');
        return;
      }

      const normalized = topic.toLowerCase().replace(/\.md$/, '');

      if (!TOPICS[normalized]) {
        console.error(`Error: Unknown topic "${topic}".`);
        console.error(
          `Available topics: ${Object.keys(TOPICS).join(', ')}`,
        );
        process.exit(1);
      }

      const lang = program.opts().lang || null;
      const content = await loadRefDoc(normalized, {lang});
      console.log(content);
    });
}
