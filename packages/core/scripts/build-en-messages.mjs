#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file build-en-messages.mjs
 * @description Generates packages/core/src/i18n/enMessages.ts from
 *   locales/en.json: the shipped English catalog projected to the one field
 *   the runtime reads, `defaultMessage`. en.json is the translators' source
 *   and carries a `description` beside every message (the context Crowdin
 *   shows); `resolve.ts` never reads it, yet importing the JSON shipped the
 *   whole file to every consumer's first load. The projection is committed
 *   and `scripts/check-i18n-catalog.mjs` fails when it drifts from en.json.
 *
 * Usage:
 *   node packages/core/scripts/build-en-messages.mjs          # write
 *   node packages/core/scripts/build-en-messages.mjs --check  # exit 1 on drift
 *
 * Runs as part of `pnpm build:i18n`, beside the pseudo-locale.
 */

import {readFileSync, writeFileSync} from 'node:fs';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import prettier from 'prettier';

const HERE = dirname(fileURLToPath(import.meta.url));
export const EN_PATH = resolve(HERE, '..', 'locales', 'en.json');
export const OUT_PATH = resolve(HERE, '..', 'src', 'i18n', 'enMessages.ts');

/** The projection, keyed in en.json's own order so the diff follows the source. */
export function projectEnMessages(catalog) {
  const messages = {};
  for (const [key, entry] of Object.entries(catalog)) {
    messages[key] = entry.defaultMessage;
  }
  return messages;
}

/**
 * The module source, formatted with the repository's prettier config so the
 * commit hook's `prettier --write` is a no-op and `--check` compares like
 * with like.
 */
export async function renderEnMessagesModule(catalog) {
  const messages = projectEnMessages(catalog);
  const lines = Object.entries(messages).map(
    ([key, message]) => `  ${JSON.stringify(key)}: ${JSON.stringify(message)},`,
  );
  const source = [
    '// Copyright (c) Meta Platforms, Inc. and affiliates.',
    '',
    '/**',
    ' * @file enMessages.ts',
    ' * @input Generated from /packages/core/locales/en.json by',
    ' *   /packages/core/scripts/build-en-messages.mjs — DO NOT EDIT BY HAND.',
    ' * @output EN_MESSAGES — the shipped English catalog as key → message.',
    ' * @position The runtime half of en.json. The JSON keeps a `description`',
    ' *   beside every message for translators; the runtime reads only the',
    ' *   message, so this projection is what `resolve.ts` ships, about a tenth',
    ' *   of the JSON. Edit en.json, then run `pnpm -F @astryxdesign/core build:i18n`;',
    ' *   `check:i18n-catalog` fails when the two drift.',
    ' *',
    ' * SYNC: When modified, update these files to stay in sync:',
    ' * - /packages/core/locales/en.json',
    ' * - /packages/core/scripts/build-en-messages.mjs',
    ' */',
    '',
    'export const EN_MESSAGES: Readonly<Record<string, string>> = {',
    ...lines,
    '};',
    '',
  ].join('\n');
  const options = (await prettier.resolveConfig(OUT_PATH)) ?? {};
  return prettier.format(source, {...options, filepath: OUT_PATH});
}

async function main() {
  const catalog = JSON.parse(readFileSync(EN_PATH, 'utf8'));
  const rendered = await renderEnMessagesModule(catalog);
  if (process.argv.includes('--check')) {
    let current = '';
    try {
      current = readFileSync(OUT_PATH, 'utf8');
    } catch {
      // A missing module is drift too.
    }
    if (current !== rendered) {
      console.error(
        '✗ packages/core/src/i18n/enMessages.ts is out of date with locales/en.json — run `pnpm -F @astryxdesign/core build:i18n`',
      );
      process.exit(1);
    }
    console.log('✓ enMessages.ts matches en.json');
    return;
  }
  writeFileSync(OUT_PATH, rendered, 'utf8');
  console.log(
    `Built src/i18n/enMessages.ts — ${Object.keys(catalog).length} keys`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main();
}
