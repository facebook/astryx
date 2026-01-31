#!/usr/bin/env node
/**
 * @file CLI for accessing XDS AI skill doc
 *
 * Usage:
 *   npx @xds/agent-tools skill          # prints principles to stdout
 *   npx @xds/agent-tools skill --path   # prints file path
 *   npx @xds/agent-tools skill --all    # prints all docs concatenated
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const docsDir = path.resolve(__dirname, '..', 'docs');
const principlesPath = path.resolve(docsDir, 'principles.md');

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
@xds/agent-tools skill

Access XDS documentation for AI agent integration.

Usage:
  npx @xds/agent-tools skill          Print principles (quick reference)
  npx @xds/agent-tools skill --path   Print docs directory path
  npx @xds/agent-tools skill --all    Print all docs concatenated
  npx @xds/agent-tools skill --list   List available doc files

Recommended:
  Use 'npx @xds/agent-tools agents-md' to install AGENTS.md (better approach)
`);
  process.exit(0);
}

if (args.includes('--path')) {
  console.log(docsDir);
} else if (args.includes('--list')) {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md'));
  console.log('Available docs:');
  files.forEach(f => console.log(`  ${f}`));
} else if (args.includes('--all')) {
  const files = fs.readdirSync(docsDir).filter(f => f.endsWith('.md')).sort();
  for (const file of files) {
    const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
    console.log(`\n${'='.repeat(60)}\n${file}\n${'='.repeat(60)}\n`);
    console.log(content);
  }
} else {
  const content = fs.readFileSync(principlesPath, 'utf-8');
  console.log(content);
}
