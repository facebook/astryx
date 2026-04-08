#!/usr/bin/env node

/**
 * XDS Bundle Size Analysis
 *
 * Traces chunk dependencies and deduplicates shared code to show
 * the real shipped cost of XDS components.
 *
 * Usage:
 *   node scripts/bundle-analysis.mjs                     # full report
 *   node scripts/bundle-analysis.mjs Button Dialog Text   # specific set
 *   node scripts/bundle-analysis.mjs --json               # machine-readable
 *   node scripts/bundle-analysis.mjs --compare @radix-ui/react-dialog=Dialog @radix-ui/react-tabs=TabList
 *   node scripts/bundle-analysis.mjs --compare @chakra-ui/react  # whole-library
 */

import {readdirSync, readFileSync, existsSync} from 'fs';
import {join} from 'path';
import {gzipSync} from 'zlib';

const DIST = join(import.meta.dirname, '..', 'packages', 'core', 'dist');

function gzSize(fp) {
  const raw = readFileSync(fp);
  return {raw: raw.length, gzip: gzipSync(raw, {level: 9}).length};
}

function getImports(fp) {
  if (!existsSync(fp)) return new Set();
  const c = readFileSync(fp, 'utf-8'), s = new Set();
  for (const m of c.matchAll(/(?:from|import)\s+["'](?:\.\.\/|\.\/)?(chunk-[^"']+\.mjs)["']/g)) s.add(m[1]);
  return s;
}

function allChunks(entry) {
  const v = new Set(), q = [entry], c = new Set();
  while (q.length) {
    const f = q.pop();
    if (v.has(f)) continue; v.add(f);
    for (const ch of getImports(f)) { c.add(ch); q.push(join(DIST, ch)); }
  }
  return c;
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
  const comps = {}, cu = {};
  for (const n of readdirSync(DIST)) {
    const e = join(DIST, n, 'index.mjs');
    if (!existsSync(e)) continue;
    const ch = allChunks(e), css = join(DIST, n, 'styles.css');
    comps[n] = {entry: gzSize(e), css: existsSync(css) ? gzSize(css) : {raw:0,gzip:0}, chunks: ch};
    for (const c of ch) { if (!cu[c]) cu[c] = new Set(); cu[c].add(n); }
  }
  return {comps, cu};
}

function measure(names, comps, cu) {
  const ac = new Set(); let eG=0,eR=0,cG=0,cR=0; const found=[];
  for (const n of names) {
    const comp = comps[n];
    if (!comp) { console.warn(`  \u26a0 "${n}" not found`); continue; }
    found.push(n);
    eG += comp.entry.gzip; eR += comp.entry.raw;
    cG += comp.css.gzip; cR += comp.css.raw;
    for (const ch of comp.chunks) ac.add(ch);
  }
  const ts = new Set(found), excl = new Set(), shr = new Set();
  for (const ch of ac) {
    const u = cu[ch] || new Set();
    [...u].some(x => !ts.has(x)) ? shr.add(ch) : excl.add(ch);
  }
  let xG=0,xR=0,sG=0,sR=0;
  for (const c of excl) { const s = gzSize(join(DIST,c)); xG+=s.gzip; xR+=s.raw; }
  for (const c of shr) { const s = gzSize(join(DIST,c)); sG+=s.gzip; sR+=s.raw; }
  const cc = gzSize(join(DIST, 'common.css'));
  return {
    count: found.length, found,
    entries: {gzip:eG, raw:eR}, exclusive: {gzip:xG, raw:xR, count:excl.size},
    shared: {gzip:sG, raw:sR, count:shr.size}, css: {gzip:cG, raw:cR}, commonCss: cc,
    foundation: {gzip:sG+cc.gzip, raw:sR+cc.raw},
    incremental: {gzip:eG+xG+cG, raw:eR+xR+cR},
    total: {gzip:sG+cc.gzip+eG+xG+cG, raw:sR+cc.raw+eR+xR+cR},
  };
}

function fmt(b) {
  return b >= 102400 ? `${(b/1024).toFixed(0)} KB` : b >= 1024 ? `${(b/1024).toFixed(1)} KB` : `${b.toLocaleString()}B`;
}
const pad = (s,n,a='left') => { s=String(s); return a==='right' ? s.padStart(n) : s.padEnd(n); };

function printSet(label, r) {
  console.log();
  console.log('\u2500'.repeat(65));
  console.log(`${label} (${r.count} components)`);
  console.log('\u2500'.repeat(65));
  console.log(`  Entries:          ${pad(fmt(r.entries.gzip),10,'right')}  (${r.count} files)`);
  console.log(`  Exclusive chunks: ${pad(fmt(r.exclusive.gzip),10,'right')}  (${r.exclusive.count} chunks)`);
  console.log(`  Shared chunks:    ${pad(fmt(r.shared.gzip),10,'right')}  (${r.shared.count} chunks)`);
  console.log(`  Component CSS:    ${pad(fmt(r.css.gzip),10,'right')}`);
  console.log(`  common.css:       ${pad(fmt(r.commonCss.gzip),10,'right')}`);
  console.log();
  console.log(`  Foundation:       ${pad(fmt(r.foundation.gzip),10,'right')}  (shared chunks + common.css)`);
  console.log(`  Incremental:      ${pad(fmt(r.incremental.gzip),10,'right')}  (entries + exclusive + CSS)`);
  console.log(`  ${'\u2500'.repeat(16)}`);
  console.log(`  Total shipped:    ${pad(fmt(r.total.gzip),10,'right')}`);
}

async function printCompare(mappings, comps, cu) {
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
    const xr = measure(xn, comps, cu);
    const et = results.reduce((s,r) => s + r.bp.gzip, 0);
    console.log(`\n${'='.repeat(75)}\nXDS vs External\n${'='.repeat(75)}\n`);
    console.log(`${pad('XDS',20)} ${pad('XDS gz',14,'right')} ${pad('Ext gz',14,'right')} ${pad('Package',25)}`);
    console.log('-'.repeat(75));
    let xt = 0;
    for (const r of results) {
      if (!r.xds) continue;
      const comp = comps[r.xds]; if (!comp) continue;
      const x = comp.entry.gzip + comp.css.gzip; xt += x;
      console.log(`${pad(r.xds,20)} ${pad(fmt(x),14,'right')} ${pad(fmt(r.bp.gzip),14,'right')} ${r.bp.name}@${r.bp.version}`);
    }
    console.log('-'.repeat(75));
    console.log(`${pad('Entry+CSS total',20)} ${pad(fmt(xt),14,'right')} ${pad(fmt(et),14,'right')}`);
    printSet(`XDS (${xn.length} matched)`, xr);
    console.log(`\n  External total: ${fmt(et)} (JS only)`);
    console.log(`  XDS marginal:   ${fmt(xr.incremental.gzip)} (fully styled)`);
  } else {
    const an = Object.keys(comps);
    const xr = measure(an, comps, cu);
    console.log(`\n${'='.repeat(65)}\nLibrary Comparison\n${'='.repeat(65)}\n`);
    console.log(`${pad('Package',42)} ${pad('Min',10,'right')} ${pad('Gzip',10,'right')}`);
    console.log('-'.repeat(65));
    console.log(`${pad(`XDS @xds/core (${an.length} groups)`,42)} ${pad(fmt(xr.total.raw),10,'right')} ${pad(fmt(xr.total.gzip),10,'right')}`);
    for (const r of results)
      console.log(`${pad(`${r.bp.name}@${r.bp.version}`,42)} ${pad(fmt(r.bp.size),10,'right')} ${pad(fmt(r.bp.gzip),10,'right')}`);
  }
}

function printFull(comps, cu) {
  const an = Object.keys(comps).sort();
  console.log(`${'='.repeat(75)}\nXDS BUNDLE SIZE ANALYSIS\n${'='.repeat(75)}\n`);
  console.log(`${pad('Component',22)} ${pad('Entry',8,'right')} ${pad('CSS',8,'right')} ${pad('Chunks',8,'right')} ${pad('Solo',10,'right')} ${pad('#ch',5,'right')}`);
  console.log('-'.repeat(75));
  const sorted = an.map(n => {
    const comp = comps[n]; let cg = 0;
    for (const ch of comp.chunks) cg += gzSize(join(DIST, ch)).gzip;
    return {n, e: comp.entry.gzip, c: comp.css.gzip, cg, solo: comp.entry.gzip + comp.css.gzip + cg, ch: comp.chunks.size};
  }).sort((a, b) => b.solo - a.solo);
  for (const c of sorted)
    console.log(`${pad(c.n,22)} ${pad(fmt(c.e),8,'right')} ${pad(fmt(c.c),8,'right')} ${pad(fmt(c.cg),8,'right')} ${pad(fmt(c.solo),10,'right')} ${pad(String(c.ch),5,'right')}`);
  const scenarios = [
    ['Small app (5)', ['Button','Text','Dialog','TextInput','Stack']],
    ['Medium app (15)', ['Button','Text','Dialog','TextInput','Stack','Table','DropdownMenu','Selector','TabList','Card','Badge','Avatar','Tooltip','Banner','Spinner']],
    ['Full library', an],
  ];
  console.log(`\n${'='.repeat(65)}\nSCENARIOS\n${'='.repeat(65)}`);
  for (const [l, ns] of scenarios) printSet(l, measure(ns, comps, cu));
}

// Main
if (!existsSync(DIST)) { console.error('Run `yarn build` first.'); process.exit(1); }
const args = process.argv.slice(2);
const jsonMode = args.includes('--json');
const cmpIdx = args.indexOf('--compare');
const {comps, cu} = buildMap();

if (jsonMode) {
  const ca = args.filter(a => !a.startsWith('--'));
  console.log(JSON.stringify(measure(ca.length ? ca : Object.keys(comps), comps, cu), null, 2));
} else if (cmpIdx !== -1) {
  const ca = args.slice(cmpIdx + 1).filter(a => !a.startsWith('--'));
  const mappings = ca.map(a => {
    const [pkg, xds] = a.includes('=') ? a.split('=', 2) : [a, null];
    return {pkg, xds};
  });
  await printCompare(mappings, comps, cu);
} else {
  const ca = args.filter(a => !a.startsWith('--'));
  if (ca.length) printSet('Custom set', measure(ca, comps, cu));
  else printFull(comps, cu);
}
