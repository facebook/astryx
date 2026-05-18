#!/usr/bin/env node
/**
 * Compiles src/vite.ts → dist/vite.mjs for npm distribution.
 *
 * The vite plugin is the only TypeScript source in @xds/build.
 * Node does not support type-stripping for files inside node_modules,
 * so we must ship compiled JS.
 */
import {buildSync} from 'esbuild';
import {readFileSync, writeFileSync} from 'fs';

buildSync({
  entryPoints: ['src/vite.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/vite.mjs',
  external: [
    'vite',
    '@stylexjs/babel-plugin',
    '@stylexjs/unplugin',
    'path',
    'url',
    'node:path',
    'node:url',
  ],
  banner: {js: '// Built from src/vite.ts — do not edit directly'},
});

// Fix babel.js path: dist/vite.mjs resolves __dirname to dist/,
// but babel.js lives in src/
let content = readFileSync('dist/vite.mjs', 'utf8');
content = content.replace(
  'resolve(__dirname, "babel.js")',
  'resolve(__dirname, "../src/babel.js")',
);
writeFileSync('dist/vite.mjs', content);

console.log('Built dist/vite.mjs');
