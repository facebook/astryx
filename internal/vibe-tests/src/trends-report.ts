#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Build the self-contained Vibe Test Trends dashboard from trends.json
 * @position internal/vibe-tests/src/trends-report.ts
 *
 * Injects the collected time series into a single static HTML file (no build
 * step, no external deps — inline SVG charts). Open the output directly or
 * publish it to gh-pages alongside the per-iteration reports.
 *
 * Usage:
 *   tsx src/trends-report.ts
 *   tsx src/trends-report.ts --in ../trends.json --out ../trends-dashboard.html
 *   tsx src/trends-report.ts --collect        # run trends-collect first
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {execFileSync} from 'node:child_process';
import type {TrendsFile} from './trends-collect.js';

const HERE = import.meta.dirname;
const TEMPLATE = path.join(HERE, 'trends-template', 'dashboard.html');

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    in: path.join(HERE, '..', 'trends.json'),
    out: path.join(HERE, '..', 'trends-dashboard.html'),
    collect: false,
  };
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--in' && args[i + 1]) {
      opts.in = path.resolve(args[++i]);
    } else if (args[i] === '--out' && args[i + 1]) {
      opts.out = path.resolve(args[++i]);
    } else if (args[i] === '--collect') {
      opts.collect = true;
    }
  }
  return opts;
}

function main() {
  const opts = parseArgs();

  if (opts.collect || !fs.existsSync(opts.in)) {
    console.log('Collecting trends from GitHub…');
    execFileSync(
      'npx',
      ['tsx', path.join(HERE, 'trends-collect.ts'), '--out', opts.in],
      {
        stdio: 'inherit',
      },
    );
  }

  const data = JSON.parse(fs.readFileSync(opts.in, 'utf8')) as TrendsFile;
  if (!data.records?.length) {
    throw new Error(`No records in ${opts.in}. Run trends-collect first.`);
  }

  const template = fs.readFileSync(TEMPLATE, 'utf8');
  // JSON is embedded in a <script type="application/json"> block; escape only
  // the closing-tag sequence so the payload can't break out of the element.
  const json = JSON.stringify(data).replace(/<\//g, '<\\/');
  const html = template.replace('__DATA__', json);

  fs.writeFileSync(opts.out, html);
  console.log(
    `Built dashboard with ${data.records.length} runs ` +
      `(${data.meta.dateMin} → ${data.meta.dateMax}).`,
  );
  console.log(`Wrote ${opts.out}`);
}

main();
