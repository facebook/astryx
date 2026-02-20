/**
 * @file docs command — Print XDS reference docs
 *
 * `xds docs` lists available topics.
 * `xds docs <topic>` prints the doc content.
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {CLI_ROOT} from '../utils/paths.mjs';

const DOCS_DIR = path.join(CLI_ROOT, 'docs');

const TOPICS = {
  principles: 'XDS design principles, rules, and anti-patterns',
  tokens: 'Full design token reference (spacing, colors, radius, typography)',
  theme: 'Theme system: XDSTheme, custom themes, overrides, light/dark mode',
};

export function registerDocs(program) {
  program
    .command('docs [topic]')
    .description('Print XDS reference docs (principles, tokens)')
    .action(topic => {
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

      const docPath = path.join(DOCS_DIR, `${normalized}.md`);

      if (!fs.existsSync(docPath)) {
        console.error(`Error: Doc file not found at ${docPath}`);
        process.exit(1);
      }

      const content = fs.readFileSync(docPath, 'utf-8');
      console.log(content);
    });
}
