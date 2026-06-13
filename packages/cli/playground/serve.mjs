#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Standalone, zero-dependency XLE/XLO playground.
 *
 * The docsite playground (apps/docsite) is the production home, but it needs
 * the full Next/Monaco/StyleX toolchain. This is a dependency-free way to
 * exercise the layout language in a browser — handy offline, in CI smoke
 * checks, or for a quick demo. It serves the pure browser barrel as native
 * ESM and builds the registry on the fly with the same code the CLI uses, so
 * it never goes stale.
 *
 *   node packages/cli/playground/serve.mjs [--port 4321]
 *
 * Routes:
 *   GET /                  the playground page
 *   GET /registry.json     buildRegistry() + serializeRegistry() + blocks
 *   GET /xle/<file>.mjs    the pure lib/xle modules + string-utils
 *
 * @position dev tool — no build step; imports lib/xle directly
 */

import {createServer} from 'node:http';
import {readFileSync} from 'node:fs';
import {join, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CLI_SRC = join(__dirname, '..', 'src');
const REPO = join(__dirname, '..', '..', '..');

const portArg = process.argv.indexOf('--port');
const PORT = portArg !== -1 ? Number(process.argv[portArg + 1]) : 4321;

const {buildRegistry, serializeRegistry} = await import(join(CLI_SRC, 'lib/xle/registry.mjs'));
const {discoverTemplates} = await import(join(CLI_SRC, 'api/template.mjs'));

function send(res, status, type, body) {
  res.writeHead(status, {'content-type': type, 'cache-control': 'no-store'});
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const path = url.pathname;

    if (path === '/') {
      return send(res, 200, 'text/html; charset=utf-8', readFileSync(join(__dirname, 'index.html')));
    }

    if (path === '/registry.json') {
      const registry = await buildRegistry({cwd: REPO});
      let blocks = [];
      try {
        const all = await discoverTemplates(REPO);
        blocks = all.filter(t => t.type === 'block').map(b => ({dirName: b.dirName, description: b.description || ''}));
      } catch {
        /* blocks optional */
      }
      return send(res, 200, 'application/json', JSON.stringify({registry: serializeRegistry(registry), blocks}));
    }

    if (path.startsWith('/xle/')) {
      // Serve the pure language modules (+ levenshtein from lib/) as ESM.
      const file = path.slice('/xle/'.length);
      const abs = file === 'levenshtein.mjs'
        ? join(CLI_SRC, 'lib/levenshtein.mjs')
        : join(CLI_SRC, 'lib/xle', file);
      if (!abs.startsWith(CLI_SRC) || !file.endsWith('.mjs')) return send(res, 403, 'text/plain', 'forbidden');
      // validate.mjs imports '../levenshtein.mjs' — rewrite to a flat /xle path.
      const body = readFileSync(abs, 'utf-8').replace(/from '\.\.\/levenshtein\.mjs'/g, "from './levenshtein.mjs'");
      return send(res, 200, 'text/javascript; charset=utf-8', body);
    }

    send(res, 404, 'text/plain', 'not found');
  } catch (e) {
    send(res, 500, 'text/plain', String(e && e.stack ? e.stack : e));
  }
});

server.listen(PORT, () => {
  console.log(`XLE/XLO playground → http://localhost:${PORT}`);
});
