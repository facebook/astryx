#!/usr/bin/env node
/**
 * @file CLI for accessing XDS AI skill doc
 *
 * Usage:
 *   npx @xds/core ai-skill          # prints to stdout
 *   npx @xds/core ai-skill --path   # prints file path
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const skillDocPath = path.resolve(__dirname, '..', 'xds.md');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
@xds/core ai-skill

Access the XDS AI skill document for LLM integration.

Usage:
  npx @xds/core ai-skill          Print skill doc to stdout
  npx @xds/core ai-skill --path   Print file path only

Integration:
  Claude Code:  Add to CLAUDE.md: "See @xds/core/xds.md for component docs"
  Cursor:       Reference in .cursorrules
  Direct API:   Load file and inject as system prompt
`);
  process.exit(0);
}

if (args.includes('--path')) {
  console.log(skillDocPath);
} else {
  const content = fs.readFileSync(skillDocPath, 'utf-8');
  console.log(content);
}
