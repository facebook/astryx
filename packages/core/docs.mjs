#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Lightweight XDS component docs — zero dependencies, ships with @astryxdesign/core.
 *
 * Usage:
 *   node node_modules/@astryxdesign/core/docs.mjs Button
 *   node node_modules/@astryxdesign/core/docs.mjs --list
 *   node node_modules/@astryxdesign/core/docs.mjs --list --brief
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';

const coreDir = path.dirname(fileURLToPath(import.meta.url));
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
  // Match the current `XDS{Name}.tsx` convention and the post-migration bare
  // `{Name}.tsx` form (XDS-prefix migration P2380608025, P4).
  const targets = [`XDS${name}.tsx`, `${name}.tsx`];
  try {
    for (const f of fs.readdirSync(dir, {withFileTypes: true})) {
      if (targets.includes(f.name)) return true;
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

function dataAttrForName(name) {
  return `data-${name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase()}`;
}

function getTargetDataAttributes(target) {
  return [
    ...(target.visualProps || []).map(dataAttrForName),
    ...(target.states || []).map(dataAttrForName),
  ];
}

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
    s.push('| Component class | Preferred data attributes | Props | States |');
    s.push('|-----------------|---------------------------|-------|--------|');
    for (const t of docs.theming.targets) {
      const dataAttrs = getTargetDataAttributes(t);
      const attrs = dataAttrs.length ? dataAttrs.map(attr => `\`${attr}\``).join(', ') : '—';
      const variants = t.visualProps?.join(', ') || '—';
      const states = t.states?.join(', ') || '—';
      s.push(`| \`${t.className}\` | ${attrs} | ${variants} | ${states} |`);
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
  return sig ? `${docs.name}(${sig})  ${short}` : `${docs.name}  ${short}`;
}

// ── Main ─────────────────────────────────────────────────────────────


// ── Hook Support ─────────────────────────────────────────────────────

const HOOK_CATEGORY_MAP = {
  useFocusTrap: 'Focus',
  useGridFocus: 'Focus',
  useListFocus: 'Focus',
  useMediaQuery: 'Media',
  useOverflow: 'Layout',
  useScrollOverflow: 'Layout',
  useScrollLock: 'Layout',
  useEntryAnimation: 'Animation',
  useStreamingText: 'Streaming',
  useImageMode: 'Media',
  useClickableContainer: 'Interaction',
  useInputContainer: 'Interaction',
};
const HOOK_CATEGORY_ORDER = ['Focus', 'Layout', 'Animation', 'Interaction', 'Media', 'Streaming', 'Other'];

function discoverHookDocs() {
  const results = [];
  const hooksDir = path.join(srcDir, 'hooks');
  if (fs.existsSync(hooksDir)) {
    for (const file of fs.readdirSync(hooksDir)) {
      if (file.endsWith('.doc.mjs')) {
        results.push({name: file.replace('.doc.mjs', ''), docPath: path.join(hooksDir, file)});
      }
    }
  }
  // Also scan component directories for use*.doc.mjs
  if (fs.existsSync(srcDir)) {
    for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
      if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
      const dir = path.join(srcDir, entry.name);
      try {
        for (const file of fs.readdirSync(dir)) {
          if (file.startsWith('use') && file.endsWith('.doc.mjs')) {
            results.push({name: file.replace('.doc.mjs', ''), docPath: path.join(dir, file)});
          }
        }
      } catch {}
    }
  }
  return results;
}

function findHookDocByName(hookName) {
  const normalized = hookName.replace(/^use/i, '');
  const hooksDir = path.join(srcDir, 'hooks');

  // Direct match in hooks/
  for (const variant of [hookName, `use${normalized}`, `useXDS${normalized}`]) {
    const p = path.join(hooksDir, `${variant}.doc.mjs`);
    if (fs.existsSync(p)) return p;
  }

  // Search component directories
  if (fs.existsSync(srcDir)) {
    for (const entry of fs.readdirSync(srcDir, {withFileTypes: true})) {
      if (!entry.isDirectory() || SKIP.has(entry.name)) continue;
      const dir = path.join(srcDir, entry.name);
      for (const variant of [hookName, `use${normalized}`, `useXDS${normalized}`]) {
        const p = path.join(dir, `${variant}.doc.mjs`);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  return null;
}

function formatHookParamsTable(params) {
  if (!params?.length) return '';
  const lines = ['| Param | Type | Default | Description |', '|-------|------|---------|-------------|'];
  for (const p of params) {
    const def = p.default ? `\`${p.default}\`` : '\u2014';
    const req = p.required ? ' **(required)**' : '';
    lines.push(`| \`${p.name}\` | \`${p.type}\` | ${def} | ${p.description}${req} |`);
  }
  return lines.join('\n');
}

function formatHookReturnsTable(returns) {
  if (!returns?.length) return '';
  const lines = ['| Field | Type | Description |', '|-------|------|-------------|'];
  for (const r of returns) {
    lines.push(`| \`${r.name}\` | \`${r.type}\` | ${r.description} |`);
  }
  return lines.join('\n');
}

function formatHookFull(docs) {
  const s = [];
  s.push(`# ${docs.name}\n`);
  s.push((docs.usage?.description || '') + '\n');

  if (docs.params?.length) {
    s.push('## Parameters\n');
    s.push(formatHookParamsTable(docs.params) + '\n');
  }

  if (docs.returns?.length) {
    s.push('## Returns\n');
    s.push(formatHookReturnsTable(docs.returns) + '\n');
  }

  if (docs.usage?.bestPractices?.length) {
    s.push('## Best Practices\n');
    for (const bp of docs.usage.bestPractices)
      s.push(`- ${bp.guidance ? '**Do:**' : "**Don't:**"} ${bp.description}`);
    s.push('');
  }

  const refs = [];
  if (docs.relatedComponents?.length) refs.push(`Components: ${docs.relatedComponents.map(c => c).join(', ')}`);
  if (docs.relatedHooks?.length) refs.push(`Hooks: ${docs.relatedHooks.join(', ')}`);
  if (docs.importPath) refs.push(`Import: ${docs.importPath}`);
  if (refs.length) {
    s.push('## Related\n');
    for (const r of refs) s.push(r);
    s.push('');
  }

  return s.join('\n');
}

function formatHookBrief(docs) {
  const desc = docs.usage?.description || '';
  const short = desc.length > 80 ? desc.slice(0, 77) + '...' : desc;
  const params = (docs.params || []).filter(p => p.required).map(p => `${p.name}: ${p.type}`).join(', ');
  const ret = (docs.returns || []).map(r => r.type).join(' | ');
  const sig = params ? `${docs.name}(${params})` : docs.name;
  return ret ? `${sig}: ${ret}  ${short}` : `${sig}  ${short}`;
}

// ── Main ─────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const isList = args.includes('--list');
const isBrief = args.includes('--brief');
const isHooks = args.includes('--hooks');
const name = args.find(a => !a.startsWith('--'));

if (isHooks) {
  // Hook listing mode
  const hookDocs = discoverHookDocs();
  const grouped = {};
  for (const {name: hookName, docPath} of hookDocs) {
    const cat = HOOK_CATEGORY_MAP[hookName] || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({name: hookName, docPath});
  }
  for (const cat of HOOK_CATEGORY_ORDER) {
    if (!grouped[cat]) continue;
    console.log(`\n${cat}:`);
    for (const {name: hookName, docPath} of grouped[cat]) {
      if (isBrief) {
        try {
          const d = await loadDoc(docPath);
          console.log('  ' + formatHookBrief(d));
        } catch {
          console.log(`  ${hookName}  (error loading docs)`);
        }
      } else {
        console.log(`  ${hookName}`);
      }
    }
  }
} else if (isList) {
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
          console.log(`  ${dir}  (error loading docs)`);
        }
      } else {
        console.log(`  ${dir}`);
      }
    }
  }
} else if (name) {
  // Try hook lookup first for names starting with 'use'
  if (name.startsWith('use') || name.startsWith('Use')) {
    const hookDocPath = findHookDocByName(name);
    if (hookDocPath) {
      const docs = await loadDoc(hookDocPath);
      console.log(formatHookFull(docs));
    } else {
      // Fall through to component lookup
      const docPath = findDocByComponent(name);
      if (!docPath) {
        console.error(`Hook or component "${name}" not found.`);
        console.error('Run with --list to see components, or --hooks to see hooks.');
        process.exit(1);
      }
      const docs = await loadDoc(docPath);
      console.log(formatFull(docs, docPath));
    }
  } else {
    const docPath = findDocByComponent(name);
    if (!docPath) {
      console.error(`Component "${name}" not found. Run with --list to see available components.`);
      process.exit(1);
    }
    const docs = await loadDoc(docPath);
    console.log(formatFull(docs, docPath));
  }
} else {
  console.log('Usage:');
  console.log('  node docs.mjs <ComponentName>   Show full component docs');
  console.log('  node docs.mjs <hookName>        Show full hook docs');
  console.log('  node docs.mjs --list            List all components');
  console.log('  node docs.mjs --list --brief    List with brief descriptions');
  console.log('  node docs.mjs --hooks           List all hooks');
  console.log('  node docs.mjs --hooks --brief   List hooks with brief descriptions');
}
