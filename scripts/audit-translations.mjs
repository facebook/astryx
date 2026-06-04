#!/usr/bin/env node
// @ts-check
/**
 * Audit XDS component docs for translation fidelity.
 *
 * Checks every .doc.mjs file in packages/core/src/ for issues that cause
 * `--lang dense` and `--lang zh` translations to silently lose information:
 *
 *   C1  no docsDense       (silent fallback to English)
 *   C2  bullet drops       (docsDense.usage.bestPractices shorter than docs)
 *   C3  missing propDescriptions
 *   C4  sub-component drops (Dialog dropping useXDSImperativeDialog, etc.)
 *   C5  required-marker drops on prop descriptions
 *   C6  no docsZh (zh fallback to English)
 *   C7  zh bullet drops
 *
 * Usage:
 *   node scripts/audit-translations.mjs              # text report
 *   node scripts/audit-translations.mjs --json       # JSON report
 *   node scripts/audit-translations.mjs --component=Dialog   # one component
 *
 * Exit codes:
 *   0  no issues
 *   1  issues found (CI gate)
 *   2  fatal error
 */
import {readFileSync, readdirSync, statSync} from 'node:fs';
import {join, relative, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO = join(__dirname, '..');
const CORE = join(REPO, 'packages/core/src');

const args = process.argv.slice(2);
const JSON_OUT = args.includes('--json');
const COMPONENT_FILTER = args.find(a => a.startsWith('--component='))?.slice(12);

const UNIVERSAL_PROPS = new Set([
  'children', 'ref', 'key', 'style', 'className', 'xstyle',
]);

/** @returns {string[]} all .doc.mjs files under packages/core/src/ */
function listDocFiles() {
  const out = [];
  function walk(d) {
    for (const e of readdirSync(d)) {
      const p = join(d, e);
      const s = statSync(p);
      if (s.isDirectory()) walk(p);
      else if (e.endsWith('.doc.mjs')) out.push(p);
    }
  }
  walk(CORE);
  return out.sort();
}

/** Extract `export const NAME = { ... };` block as a string. */
function readExport(src, name) {
  const m = src.match(new RegExp(`export const ${name}\\s*=\\s*\\{`));
  if (!m) return null;
  let depth = 0, i = m.index + m[0].length - 1;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) return src.slice(i, j + 1);
    }
  }
  return null;
}

/** Count guidance bullets in a section by regex. */
function countBullets(section) {
  if (!section) return [0, 0];
  const dos = (section.match(/guidance:\s*true/g) || []).length;
  const donts = (section.match(/guidance:\s*false/g) || []).length;
  return [dos, donts];
}

/** Pull all `name: 'XDSFoo'` and `name: 'useXDSFoo'` entries from a section. */
function extractSubcomponentNames(section) {
  if (!section) return [];
  const out = [];
  const re = /name:\s*['"`](XDS\w+|use\w+)['"`]/g;
  let m;
  while ((m = re.exec(section)) !== null) out.push(m[1]);
  return out;
}

/** Pull props array entries by name. */
function extractPropNames(docsSection) {
  if (!docsSection) return [];
  // Find `props: [` block
  const m = docsSection.match(/props:\s*\[/);
  if (!m) return [];
  let depth = 1, i = m.index + m[0].length;
  let block = '';
  for (let j = i; j < docsSection.length; j++) {
    const c = docsSection[j];
    if (c === '[') depth++;
    else if (c === ']') {
      depth--;
      if (depth === 0) {
        block = docsSection.slice(i, j);
        break;
      }
    }
  }
  const out = [];
  const re = /name:\s*['"`]([^'"`]+)['"`]/g;
  let mm;
  while ((mm = re.exec(block)) !== null) out.push(mm[1]);
  return out;
}

/** Pull keys in a propDescriptions object. */
function extractPropDescriptionKeys(translationSection) {
  if (!translationSection) return [];
  const m = translationSection.match(/propDescriptions:\s*\{/);
  if (!m) return [];
  let depth = 1, i = m.index + m[0].length;
  let block = '';
  for (let j = i; j < translationSection.length; j++) {
    const c = translationSection[j];
    if (c === '{') depth++;
    else if (c === '}') {
      depth--;
      if (depth === 0) {
        block = translationSection.slice(i, j);
        break;
      }
    }
  }
  const out = [];
  // Match `key:` or `'key':` at line start
  const re = /^\s*['"`]?([A-Za-z][\w-]*)['"`]?\s*:/gm;
  let mm;
  while ((mm = re.exec(block)) !== null) out.push(mm[1]);
  return out;
}

/** Count `required: true` entries in props array. */
function countRequired(section) {
  if (!section) return 0;
  return (section.match(/required:\s*true/g) || []).length;
}

function audit() {
  const issues = {
    C1_no_dense: [],
    C2_bullet_drops: [],
    C3_missing_prop_descs: [],
    C4_subcomp_drops: [],
    C5_required_drops: [],
    C6_no_zh: [],
    C7_zh_bullet_drops: [],
  };

  const files = listDocFiles();
  const filtered = COMPONENT_FILTER
    ? files.filter(f => f.includes(`/${COMPONENT_FILTER}/`))
    : files;

  for (const fp of filtered) {
    const rel = relative(REPO, fp);
    const src = readFileSync(fp, 'utf8');
    const docs = readExport(src, 'docs');
    if (!docs) continue; // not a real doc file

    const dense = readExport(src, 'docsDense');
    const zh = readExport(src, 'docsZh');

    // C1
    if (!dense) issues.C1_no_dense.push(rel);

    // C2
    if (dense) {
      const [fdo, fdn] = countBullets(docs);
      const [ddo, ddn] = countBullets(dense);
      if (fdo > ddo || fdn > ddn) {
        issues.C2_bullet_drops.push({
          file: rel,
          full: [fdo, fdn],
          dense: [ddo, ddn],
          do_lost: fdo - ddo,
          dont_lost: fdn - ddn,
        });
      }
    }

    // C3 — propDescriptions completeness
    if (dense) {
      const fullProps = extractPropNames(docs);
      const denseKeys = new Set(extractPropDescriptionKeys(dense));
      const missing = fullProps.filter(p => !denseKeys.has(p) && !UNIVERSAL_PROPS.has(p));
      if (missing.length > 0) {
        issues.C3_missing_prop_descs.push({file: rel, missing});
      }
    }

    // C4 — sub-component coverage
    if (dense) {
      const fullSubs = extractSubcomponentNames(docs);
      const denseSubs = new Set(extractSubcomponentNames(dense));
      const missing = fullSubs.filter(s => !denseSubs.has(s));
      if (missing.length > 0) {
        issues.C4_subcomp_drops.push({file: rel, missing});
      }
    }

    // C5 — required markers
    if (dense) {
      const fullReq = countRequired(docs);
      const denseReq = countRequired(dense);
      // Dense is allowed to omit required if propDescriptions use **(required)** strings
      const denseMarkers = (dense.match(/\*\*\(required\)\*\*/g) || []).length;
      if (fullReq > denseReq + denseMarkers) {
        issues.C5_required_drops.push({
          file: rel,
          full_required: fullReq,
          dense_required: denseReq,
          dense_markers: denseMarkers,
        });
      }
    }

    // C6
    if (!zh) issues.C6_no_zh.push(rel);

    // C7
    if (zh) {
      const [fdo, fdn] = countBullets(docs);
      const [zdo, zdn] = countBullets(zh);
      if (fdo > zdo || fdn > zdn) {
        issues.C7_zh_bullet_drops.push({
          file: rel,
          full: [fdo, fdn],
          zh: [zdo, zdn],
          do_lost: fdo - zdo,
          dont_lost: fdn - zdn,
        });
      }
    }
  }

  return issues;
}

function summary(issues) {
  const totals = {};
  for (const [k, v] of Object.entries(issues)) {
    totals[k] = Array.isArray(v) ? v.length : 0;
  }
  return totals;
}

function printReport(issues) {
  const sums = summary(issues);
  const totalIssues = Object.values(sums).reduce((a, b) => a + b, 0);

  console.log('XDS Translation Audit');
  console.log('='.repeat(70));
  console.log();
  console.log('Summary');
  console.log('-------');
  const checks = [
    ['C1', 'components missing docsDense', sums.C1_no_dense],
    ['C2', 'docsDense bullet drops vs docs', sums.C2_bullet_drops],
    ['C3', 'missing propDescriptions in docsDense', sums.C3_missing_prop_descs],
    ['C4', 'sub-component drops in docsDense', sums.C4_subcomp_drops],
    ['C5', 'required-marker drops in docsDense', sums.C5_required_drops],
    ['C6', 'components missing docsZh', sums.C6_no_zh],
    ['C7', 'docsZh bullet drops vs docs', sums.C7_zh_bullet_drops],
  ];
  for (const [code, desc, n] of checks) {
    const flag = n > 0 ? '✗' : '✓';
    console.log(`  ${flag} ${code}: ${desc}: ${n}`);
  }
  console.log();
  console.log(`Total issues: ${totalIssues}`);
  console.log();

  if (totalIssues === 0) return;

  // Detail sections
  if (issues.C1_no_dense.length) {
    console.log('C1 — Missing docsDense (silent English fallback)');
    console.log('-'.repeat(70));
    for (const f of issues.C1_no_dense) console.log(`  ${f}`);
    console.log();
  }
  if (issues.C2_bullet_drops.length) {
    console.log('C2 — Bullet drops (docs vs docsDense)');
    console.log('-'.repeat(70));
    for (const x of issues.C2_bullet_drops) {
      console.log(`  ${x.file}: full ${x.full[0]}/${x.full[1]} -> dense ${x.dense[0]}/${x.dense[1]} (lost ${x.do_lost} Do, ${x.dont_lost} Don't)`);
    }
    console.log();
  }
  if (issues.C3_missing_prop_descs.length) {
    console.log('C3 — Missing propDescriptions');
    console.log('-'.repeat(70));
    for (const x of issues.C3_missing_prop_descs) {
      console.log(`  ${x.file}: missing ${x.missing.join(', ')}`);
    }
    console.log();
  }
  if (issues.C4_subcomp_drops.length) {
    console.log('C4 — Sub-component drops');
    console.log('-'.repeat(70));
    for (const x of issues.C4_subcomp_drops) {
      console.log(`  ${x.file}: missing ${x.missing.join(', ')}`);
    }
    console.log();
  }
  if (issues.C5_required_drops.length) {
    console.log("C5 — required: true drops not compensated by **(required)** markers");
    console.log('-'.repeat(70));
    for (const x of issues.C5_required_drops) {
      console.log(`  ${x.file}: full has ${x.full_required} required, dense has ${x.dense_required} + ${x.dense_markers} markers`);
    }
    console.log();
  }
  if (issues.C6_no_zh.length) {
    console.log('C6 — Missing docsZh');
    console.log('-'.repeat(70));
    for (const f of issues.C6_no_zh) console.log(`  ${f}`);
    console.log();
  }
  if (issues.C7_zh_bullet_drops.length) {
    console.log('C7 — docsZh bullet drops');
    console.log('-'.repeat(70));
    for (const x of issues.C7_zh_bullet_drops) {
      console.log(`  ${x.file}: full ${x.full[0]}/${x.full[1]} -> zh ${x.zh[0]}/${x.zh[1]} (lost ${x.do_lost} Do, ${x.dont_lost} Don't)`);
    }
    console.log();
  }
}

function main() {
  const issues = audit();
  if (JSON_OUT) {
    console.log(JSON.stringify({summary: summary(issues), issues}, null, 2));
  } else {
    printReport(issues);
  }
  const total = Object.values(issues).reduce(
    (a, v) => a + (Array.isArray(v) ? v.length : 0), 0
  );
  process.exit(total === 0 ? 0 : 1);
}

main();
