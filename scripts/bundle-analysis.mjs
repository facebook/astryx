#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.


/**
 * XDS Bundle Size Analysis
 *
 * Traces file dependencies to show the real shipped cost of XDS components.
 * Each component is a standalone file tree (no shared chunks).
 *
 * Usage:
 *   node scripts/bundle-analysis.mjs                     # full report
 *   node scripts/bundle-analysis.mjs Button Dialog Text   # specific set
 *   node scripts/bundle-analysis.mjs --json               # machine-readable
 *   node scripts/bundle-analysis.mjs --compare @radix-ui/react-dialog=Dialog @radix-ui/react-tabs=TabList
 *   node scripts/bundle-analysis.mjs --compare @chakra-ui/react  # whole-library
 */

import {readdirSync, readFileSync, existsSync, statSync} from 'node:fs';
import {join, dirname, resolve} from 'node:path';
import {gzipSync} from 'node:zlib';

const DIST = join(import.meta.dirname, '..', 'packages', 'core', 'dist');

function gzSize(fp) {
  const raw = readFileSync(fp);
  return {raw: raw.length, gzip: gzipSync(raw, {level: 9}).length};
}

function resolveImport(fromFile, specifier) {
  const dir = dirname(fromFile);
  const candidates = [
    join(dir, specifier),
    join(dir, specifier + '.js'),
    join(dir, specifier + '.mjs'),
    join(dir, specifier, 'index.js'),
    join(dir, specifier, 'index.mjs'),
  ];
  for (const c of candidates) {
    if (existsSync(c) && statSync(c).isFile()) return c;
  }
  return null;
}

function getImports(fp) {
  if (!existsSync(fp)) return new Set();
  const content = readFileSync(fp, 'utf-8');
  const paths = new Set();
  for (const m of content.matchAll(/(?:from|import)\s+["'](\.\.?\/[^"']+)["']/g)) {
    const resolved = resolveImport(fp, m[1]);
    if (resolved) paths.add(resolved);
  }
  return paths;
}

function allFiles(entry) {
  const visited = new Set(), q = [entry];
  while (q.length) {
    const f = q.pop();
    if (visited.has(f)) continue;
    visited.add(f);
    for (const dep of getImports(f)) q.push(dep);
  }
  return visited;
}

async function fetchSize(pkg) {
  try {
    const r = await fetch(`https://bundlephobia.com/api/size?package=${encodeURIComponent(pkg)}`,
      {headers: {'User-Agent': 'xds', Accept: 'application/json'}});
    if (!r.ok) return null;
    const d = await r.json();
    return {name: d.name, version: d.version, size: d.size, gzip: d.gzip};
  } catch { return null; }
}

function buildMap() {
  const comps = {};
  for (const n of readdirSync(DIST)) {
    const e = existsSync(join(DIST, n, 'index.js')) ? join(DIST, n, 'index.js') : join(DIST, n, 'index.mjs');
    if (!existsSync(e)) continue;
    const files = allFiles(e);
    let totalRaw = 0, totalGzip = 0;
    for (const f of files) {
      const s = gzSize(f);
      totalRaw += s.raw;
      totalGzip += s.gzip;
    }
    comps[n] = {entry: gzSize(e), files, totalRaw, totalGzip, fileCount: files.size};
  }
  return comps;
}

function measure(names, comps) {
  const allDeps = new Set();
  let tG = 0, tR = 0;
  const found = [];
  for (const n of names) {
    const comp = comps[n];
    if (!comp) { console.warn(`  ⚠ "${n}" not found`); continue; }
    found.push(n);
    for (const f of comp.files) allDeps.add(f);
  }
  for (const f of allDeps) {
    const s = gzSize(f);
    tG += s.gzip;
    tR += s.raw;
  }
  const astryxCss = existsSync(join(DIST, 'astryx.css')) ? gzSize(join(DIST, 'astryx.css')) : {raw: 0, gzip: 0};
  return {
    count: found.length, found,
    js: {gzip: tG, raw: tR, files: allDeps.size},
    astryxCss,
    total: {gzip: tG + astryxCss.gzip, raw: tR + astryxCss.raw},
  };
}

function fmt(b) {
  return b >= 102400 ? `${(b/1024).toFixed(0)} KB` : b >= 1024 ? `${(b/1024).toFixed(1)} KB` : `${b.toLocaleString()}B`;
}
const pad = (s, n, a = 'left') => { s = String(s); return a === 'right' ? s.padStart(n) : s.padEnd(n); };

function printSet(label, r) {
  console.log();
  console.log('─'.repeat(65));
  console.log(`${label} (${r.count} components)`);
  console.log('─'.repeat(65));
  console.log(`  JS:               ${pad(fmt(r.js.gzip), 10, 'right')}  (${r.js.files} files)`);
  console.log(`  astryx.css:       ${pad(fmt(r.astryxCss.gzip), 10, 'right')}`);
  console.log(`  ${'─'.repeat(16)}`);
  console.log(`  Total shipped:    ${pad(fmt(r.total.gzip), 10, 'right')}`);
}

async function printCompare(mappings, comps) {
  const hasMap = mappings.some(m => m.xds);
  console.log('\nFetching sizes from bundlephobia...');
  const results = [];
  for (const m of mappings) {
    const d = await fetchSize(m.pkg);
    if (!d) { console.warn(`  Could not fetch ${m.pkg}`); continue; }
    results.push({...m, bp: d});
    console.log(`  ${d.name}@${d.version}: ${fmt(d.gzip)} gzip`);
  }
  if (!results.length) { console.error('No packages fetched.'); return; }
  if (hasMap) {
    const xn = results.filter(r => r.xds).map(r => r.xds);
    const xr = measure(xn, comps);
    const et = results.reduce((s, r) => s + r.bp.gzip, 0);
    console.log(`\n${'='.repeat(75)}\nXDS vs External\n${'='.repeat(75)}\n`);
    console.log(`${pad('XDS', 20)} ${pad('XDS gz', 14, 'right')} ${pad('Ext gz', 14, 'right')} ${pad('Package', 25)}`);
    console.log('-'.repeat(75));
    let xt = 0;
    for (const r of results) {
      if (!r.xds) continue;
      const comp = comps[r.xds]; if (!comp) continue;
      xt += comp.totalGzip;
      console.log(`${pad(r.xds, 20)} ${pad(fmt(comp.totalGzip), 14, 'right')} ${pad(fmt(r.bp.gzip), 14, 'right')} ${r.bp.name}@${r.bp.version}`);
    }
    console.log('-'.repeat(75));
    console.log(`${pad('Total', 20)} ${pad(fmt(xt), 14, 'right')} ${pad(fmt(et), 14, 'right')}`);
    printSet(`XDS (${xn.length} matched)`, xr);
    console.log(`\n  External total: ${fmt(et)} (JS only)`);
    console.log(`  XDS total:      ${fmt(xr.js.gzip)} (JS, fully styled)`);
  } else {
    const an = Object.keys(comps);
    const xr = measure(an, comps);
    console.log(`\n${'='.repeat(65)}\nLibrary Comparison\n${'='.repeat(65)}\n`);
    console.log(`${pad('Package', 42)} ${pad('Min', 10, 'right')} ${pad('Gzip', 10, 'right')}`);
    console.log('-'.repeat(65));
    console.log(`${pad(`XDS @astryxdesign/core (${an.length} groups)`, 42)} ${pad(fmt(xr.total.raw), 10, 'right')} ${pad(fmt(xr.total.gzip), 10, 'right')}`);
    for (const r of results)
      console.log(`${pad(`${r.bp.name}@${r.bp.version}`, 42)} ${pad(fmt(r.bp.size), 10, 'right')} ${pad(fmt(r.bp.gzip), 10, 'right')}`);
  }
}

function printFull(comps) {
  const an = Object.keys(comps).sort();
  console.log(`${'='.repeat(75)}\nXDS BUNDLE SIZE ANALYSIS\n${'='.repeat(75)}\n`);
  console.log(`${pad('Component', 22)} ${pad('Solo', 10, 'right')} ${pad('Files', 6, 'right')}`);
  console.log('-'.repeat(40));
  const sorted = an.map(n => {
    const comp = comps[n];
    return {n, solo: comp.totalGzip, files: comp.fileCount};
  }).sort((a, b) => b.solo - a.solo);
  for (const c of sorted)
    console.log(`${pad(c.n, 22)} ${pad(fmt(c.solo), 10, 'right')} ${pad(String(c.files), 6, 'right')}`);
  const scenarios = [
    ['Small app (5)', ['Button', 'Text', 'Dialog', 'TextInput', 'Stack']],
    ['Medium app (15)', ['Button', 'Text', 'Dialog', 'TextInput', 'Stack', 'Table', 'DropdownMenu', 'Selector', 'TabList', 'Card', 'Badge', 'Avatar', 'Tooltip', 'Banner', 'Spinner']],
    ['Full library', an],
  ];
  console.log(`\n${'='.repeat(65)}\nSCENARIOS\n${'='.repeat(65)}`);
  for (const [l, ns] of scenarios) printSet(l, measure(ns, comps));
}

// Main
if (!existsSync(DIST)) { console.error('Run `pnpm build` first.'); process.exit(1); }
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const cmpIdx = args.indexOf('--compare');
const comps = buildMap();

if (jsonMode) {
  const ca = args.filter(a => !a.startsWith('--'));
  console.log(JSON.stringify(measure(ca.length ? ca : Object.keys(comps), comps), null, 2));
} else if (cmpIdx !== -1) {
  const ca = args.slice(cmpIdx + 1).filter(a => !a.startsWith('--'));
  const mappings = ca.map(a => {
    const [pkg, xds] = a.includes('=') ? a.split('=', 2) : [a, null];
    return {pkg, xds};
  });
  await printCompare(mappings, comps);
} else {
  const ca = args.filter(a => !a.startsWith('--'));
  if (ca.length) printSet('Custom set', measure(ca, comps));
  else printFull(comps);
}
