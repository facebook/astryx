// Copyright (c) Meta Platforms, Inc. and affiliates.

import {createRequire} from 'node:module';
import path from 'node:path';

import {withAstryx} from '@astryxdesign/build/next';

const require = createRequire(import.meta.url);

/**
 * Locate lexical's built ESM entry for the alias below. `require.resolve`
 * lands on the CJS entry inside dist/, so walk up to the package root rather
 * than resolving `lexical/package.json` (not export-mapped). Returns null when
 * lexical isn't installed so the alias is simply omitted.
 */
function resolveLexicalDist() {
  try {
    let dir = path.dirname(require.resolve('lexical'));
    while (path.basename(dir) !== 'lexical') {
      dir = path.dirname(dir);
    }
    return path.join(dir, 'dist', 'Lexical.mjs');
  } catch {
    return null;
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: process.env.NODE_ENV === 'production' ? 'export' : undefined,
  reactStrictMode: false,
  trailingSlash: true,
  basePath: process.env.SANDBOX_BASE_PATH || '',
  env: {
    NEXT_PUBLIC_BASE_PATH: process.env.SANDBOX_BASE_PATH || '',
  },
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack(config, {dev}) {
    // withAstryx resolves requests issued FROM @astryxdesign modules with the
    // `source` condition so astryx packages build from TS source. lexical also
    // ships a `source` export, so lab's bare runtime `import ... from
    // 'lexical'` (RichTextEditor keyboard commands) would resolve to lexical's
    // raw TS — whose `declare` class fields this app's Babel pipeline rejects.
    // Pin bare `lexical` to its built ESM entry (an env-switching wrapper, so
    // dev/prod selection is preserved). App-local on purpose: lab is a private
    // package, so no external withAstryx consumer can hit this — the shared
    // build package stays agnostic to non-core libraries.
    // Scoped by issuer (same shape as withAstryx's source-condition rule) so
    // only astryx-issued requests are pinned — everything else keeps normal
    // export-map resolution (e.g. Lexical.node.mjs in the server bundle).
    const lexicalDist = resolveLexicalDist();
    if (lexicalDist != null) {
      config.module = config.module || {};
      config.module.rules = config.module.rules || [];
      config.module.rules.unshift({
        test: /[\\/]node_modules[\\/]@astryxdesign[\\/]/,
        resolve: {alias: {lexical$: lexicalDist}},
      });
    }

    // Workarounds for Node v24+ where webpack's hashing/caching feeds
    // `undefined` to Hash.update and crashes the dev server.
    config.output = config.output || {};
    // Use a Node-crypto JS hash instead of the bundled WASM xxhash64.
    config.output.hashFunction = 'sha512';
    if (dev) {
      // Disable the persistent filesystem cache in dev — its async pack/unpack
      // queue is the source of the recurring `Hash.update(undefined)` crash
      // on Node 24+. Cold rebuilds are slightly slower, but the server stays
      // alive across requests.
      config.cache = false;
    }
    return config;
  },
};

export default withAstryx(nextConfig);
