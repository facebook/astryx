#!/usr/bin/env node
/**
 * @file Lightweight XDS component docs — zero dependencies, ships with @xds/core.
 *
 * Usage:
 *   node node_modules/@xds/core/docs.mjs Button
 *   node node_modules/@xds/core/docs.mjs --list
 *   node node_modules/@xds/core/docs.mjs --list --brief
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {pathToFileURL} from 'node:url';

const coreDir = path.dirname(new URL(import.meta.url).pathname);
const srcDir = path.join(coreDir, 'src');

// ── Discovery ────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  AspectRatio: 'Layout', Center: 'Layout', CollapsibleGroup: 'Layout',
  Grid: 'Layout', Layout: 'Layout', Stack: 'Layout',
  Avatar: 'Display', Badge: 'Display', Divider: 'Display',
  Icon: 'Display', Skeleton: 'Display', Table: 'Display', Text: 'Display',
  CheckboxInput: 'Form', DateInput: 'Form', Field: 'Form',
  NumberInput: 'Form', RadioList: 'Form', Selector: 'Form',
  Slider: 'Form', Switch: 'Form', TextArea: 'Form', TextInput: 'Form',
  TimeInput: 'Form',
  Button: 'Action', CloseButton: 'Action', DropdownMenu: 'Action', Link: 'Action',
  TabList: 'Navigation', TopNav: 'Navigation',
  Calendar: 'Overlay', Dialog: 'Overlay', Layer: 'Overlay',
};
const CATEGORY_ORDER = ['Layout', 'Display', 'Form', 'Action', 'Navigation', 'Overlay', 'Other'];
const SKIP = new Set(['theme', 'hooks', 'utils', '__tests__', 'node_modules']);

function discoverDocs() {
  const results = [];
  if (!fs.existsSync(srcDir)) return results;
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
    const docPath = findDocFile(entry.name);
    if (docPath) results.push({dir: entry.name, docPath});
  }
  return results;
}

function findDocFile(name) {
  const direct = path.join(srcDir, name, `${name}.doc.mjs`);
  if (fs.existsSync(direct)) return direct;
  const dir = path.join(srcDir, name);
  if (!fs.existsSync(dir)) return null;
  for (const sub of fs.readdirSync(dir, {withFileTypes: true})) {
    if (sub.isDirectory()) {
      const nested = path.join(dir, sub.name, `${sub.name}.doc.mjs`);
      if (fs.existsSync(nested)) return nested;
    }
  }
  return null;
}

function findDocByComponent(name) {
  let docPath = findDocFile(name);
  if (docPath) return docPath;
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
    const nested = path.join(srcDir, entry.name, name, `${name}.doc.mjs`);
    if (fs.existsSync(nested)) return nested;
  }
  // Fuzzy: find XDS{Name}.tsx and use parent doc
  for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
    if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
    const dir = path.join(srcDir, entry.name);
    if (hasXDSFile(dir, name)) {
      const doc = findDocInDir(dir);
      if (doc) return doc;
    }
  }
  return null;
}

function hasXDSFile(dir, name) {
  const target = `XDS${name}.tsx`;
  try {
    for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
      if (f.name === target) return true;
      if (f.isDirectory() && hasXDSFile(path.join(dir, f.name), name)) return true;
    }
  } catch {}
  return false;
}

function findDocInDir(dir) {
  try {
    for (const f of fs.readdirSync(dir)) {
      if (f.endsWith('.doc.mjs')) return path.join(dir, f);
    }
  } catch {}
  return null;
}

// ── Loading ──────────────────────────────────────────────────────────

async function loadDoc(docPath) {
  const mod = await import(pathToFileURL(docPath).href);
  return mod.docs;
}

// ── Example extraction ───────────────────────────────────────────────

function extractExamples(docPath) {
  const dir = path.dirname(docPath);
  const examples = [];
  try {
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.tsx') || file.includes('.test')) continue;
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const regex = /@example\s*\n\s*\*\s*```[\w]*\n([\s\S]*?)```/g;
      let match;
      while ((match = regex.exec(content)) !== null) {
        const code = match[1]
          .split('\n')
          .map(line => line.replace(/^\s*\*\s?/, ''))
          .join('\n')
          .trim();
        if (code.includes('declare module')) continue;
        if (code.includes('stylex.create') && !code.includes('XDS')) continue;
        if (code.length > 0) examples.push(code);
      }
    }
  } catch {}
  return examples;
}

// ── Formatting ───────────────────────────────────────────────────────

function formatPropsTable(props) {
  if (!props?.length) return '';
  const lines = ['| Prop | Type | Default | Description |', '|------|------|---------|-------------|'];
  for (const p of props) {
    const def = p.default ? `\`${p.default}\`` : '—';
    const req = p.required ? ' **(required)**' : '';
    lines.push(`| \`${p.name}\` | \`${p.type}\` | ${def} | ${p.description}${req} |`);
  }
  return lines.join('\n');
}

function formatFull(docs, docPath) {
  const s = [];
  s.push(`# ${docs.name}\n`);
  s.push((docs.usage?.description || '') + '\n');

  // Examples from @example JSDoc blocks in component source
  if (docPath) {
    const examples = extractExamples(docPath);
    if (examples.length) {
      s.push('## Example\n');
      s.push('```tsx');
      s.push(examples.join('\n\n'));
      s.push('```\n');
    }
  }

  if (docs.usage?.anatomy?.length) {
    s.push('## Anatomy\n');
    s.push('| Element | Required | Description |');
    s.push('|---------|----------|-------------|');
    for (const el of docs.usage.anatomy)
      s.push(`| ${el.name} | ${el.required ? 'Yes' : 'No'} | ${el.description} |`);
    s.push('');
  }

  if (docs.usage?.bestPractices?.length) {
    s.push('## Best Practices\n');
    for (const bp of docs.usage.bestPractices)
      s.push(`- ${bp.guidance ? '**Do:**' : "**Don't:**"} ${bp.description}`);
    s.push('');
  }

  if ('props' in docs) {
    s.push('## Props\n');
    s.push(formatPropsTable(docs.props) + '\n');
  }

  if ('components' in docs) {
    s.push('## Components\n');
    for (const comp of docs.components) {
      s.push(`### ${comp.name}\n`);
      s.push(comp.description + '\n');
      s.push(formatPropsTable(comp.props) + '\n');
    }
  }

  if (docs.theming?.targets?.length) {
    s.push('## Theming\n');
    s.push('| Class | Variants | States |');
    s.push('|-------|----------|--------|');
    for (const t of docs.theming.targets) {
      const variants = t.visualProps?.join(', ') || '—';
      const states = t.states?.join(', ') || '—';
      s.push(`| \`${t.className}\` | ${variants} | ${states} |`);
    }
    s.push('');
    const publicVars = docs.theming.vars?.filter(v => !v.private && !v.derived) || [];
    if (publicVars.length) {
      s.push('| CSS Variable | Default | Description |');
      s.push('|-------------|---------|-------------|');
      for (const v of publicVars)
        s.push(`| \`${v.name}\` | \`${v.default}\` | ${v.description} |`);
      s.push('');
    }
  }

  return s.join('\n');
}

function formatBrief(docs) {
  const desc = docs.usage?.description || '';
  const short = desc.length > 80 ? desc.slice(0, 77) + '...' : desc;
  const props = docs.props || docs.components?.[0]?.props || [];
  const sig = props
    .filter(p => p.type.includes('|') && !p.type.includes('ReactNode'))
    .map(p => `${p.name}: ${p.type.replace(/['"]/g, '').split('|').map(v => v.trim()).join('|')}`)
    .join(', ');
  return sig ? `XDS${docs.name}(${sig})  ${short}` : `XDS${docs.name}  ${short}`;
}

// ── Main ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isList = args.includes('--list');
const isBrief = args.includes('--brief');
const name = args.find(a => !a.startsWith('--'));

if (isList) {
  const docs = discoverDocs();
  const grouped = {};
  for (const {dir, docPath} of docs) {
    const cat = CATEGORY_MAP[dir] || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({dir, docPath});
  }
  for (const cat of CATEGORY_ORDER) {
    if (!grouped[cat]) continue;
    console.log(`\n${cat}:`);
    for (const {dir, docPath} of grouped[cat]) {
      if (isBrief) {
        try {
          const d = await loadDoc(docPath);
          console.log('  ' + formatBrief(d));
        } catch {
          console.log(`  XDS${dir}  (error loading docs)`);
        }
      } else {
        console.log(`  ${dir}`);
      }
    }
  }
} else if (name) {
  const docPath = findDocByComponent(name);
  if (!docPath) {
    console.error(`Component "${name}" not found. Run with --list to see available components.`);
    process.exit(1);
  }
  const docs = await loadDoc(docPath);
  console.log(formatFull(docs, docPath));
} else {
  console.log('Usage:');
  console.log('  node docs.mjs <ComponentName>   Show full component docs');
  console.log('  node docs.mjs --list            List all components');
  console.log('  node docs.mjs --list --brief    List with brief descriptions');
}
