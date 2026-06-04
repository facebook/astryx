#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * Vibe test evaluator for XDS MCP server v2.
 * Loads the same registries and simulates the search + get tool flow
 * for the 7-prompt battery from Issue #2306.
 *
 * Run: node scripts/vibe-test.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const GEN_DIR = path.join(__dirname, '..', 'src', 'generated');

// ── Load registries (parse TS as JSON data) ────────────────────────────
function loadRegistry(filename) {
  const content = fs.readFileSync(path.join(GEN_DIR, filename), 'utf-8');
  // Extract the JSON data from the TS file
  const match = content.match(/= (\{[\s\S]*\}|\[[\s\S]*\]);?\s*$/m);
  if (!match) {
    // Try to find the last assignment
    const lines = content.split('\n');
    let braceStart = -1;
    let depth = 0;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('};') || lines[i].includes('];')) {
        braceStart = i;
        break;
      }
    }
    return null;
  }
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

// Actually, let's use a simpler approach - eval the assignments
function extractData(filename, varName) {
  const content = fs.readFileSync(path.join(GEN_DIR, filename), 'utf-8');
  // Find the variable assignment
  const pattern = new RegExp(`export const ${varName}[^=]*= `);
  const match = content.match(pattern);
  if (!match) return null;

  const startIdx = content.indexOf(match[0]) + match[0].length;
  // Find the balanced end
  let depth = 0;
  let i = startIdx;
  const opener = content[i];
  const isArray = opener === '[';
  const closer = isArray ? ']' : '}';

  for (; i < content.length; i++) {
    if (content[i] === opener) depth++;
    else if (content[i] === closer) {
      depth--;
      if (depth === 0) break;
    }
  }

  const jsonStr = content.slice(startIdx, i + 1);
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error(`Failed to parse ${varName} from ${filename}:`, e.message);
    return null;
  }
}

console.log('Loading registries...');
const componentsData = extractData('componentRegistry.ts', 'components');
const docTopicsData = extractData('docsRegistry.ts', 'docTopics');
const blocksData = extractData('blockRegistry.ts', 'blocks');
const templatesData = extractData('templateRegistry.ts', 'templates');

if (!componentsData) { console.error('Failed to load components'); process.exit(1); }
if (!docTopicsData) { console.error('Failed to load docTopics'); process.exit(1); }
if (!blocksData) { console.error('Failed to load blocks'); process.exit(1); }
if (!templatesData) { console.error('Failed to load templates'); process.exit(1); }

const allComponents = Object.values(componentsData).flat();
const visibleComponents = allComponents.filter(c => !c.hidden);

console.log(`Loaded: ${visibleComponents.length} components, ${docTopicsData.length} docs, ${blocksData.length} blocks, ${templatesData.length} templates\n`);

// ── Alias Map (same as route.ts) ───────────────────────────────────────
const ALIASES = {
  'success message': ['Toast', 'useXDSToast'],
  'error message': ['Toast', 'useXDSToast', 'Banner'],
  notification: ['Toast', 'useXDSToast'],
  snackbar: ['Toast', 'useXDSToast'],
  alert: ['Toast', 'Banner', 'AlertDialog'],
  flash: ['Toast', 'useXDSToast'],
  'toast notification': ['Toast', 'useXDSToast'],
  dropdown: ['Selector', 'DropdownMenu'],
  select: ['Selector'],
  picker: ['Selector'],
  combobox: ['Selector'],
  'dropdown menu': ['DropdownMenu'],
  'context menu': ['DropdownMenu'],
  sidebar: ['SideNav', 'AppShell'],
  'side navigation': ['SideNav'],
  navigation: ['SideNav', 'TopNav', 'NavIcon'],
  'nav bar': ['TopNav'],
  header: ['TopNav'],
  'app shell': ['AppShell'],
  layout: ['AppShell', 'Layout'],
  'admin panel': ['AppShell', 'SideNav'],
  dashboard: ['AppShell', 'SideNav', 'Card'],
  form: ['FormLayout', 'TextInput', 'Selector'],
  input: ['TextInput', 'TextArea'],
  'text field': ['TextInput'],
  'text input': ['TextInput'],
  textarea: ['TextArea'],
  'form field': ['FormLayout'],
  'form layout': ['FormLayout'],
  checkbox: ['Checkbox'],
  radio: ['RadioGroup'],
  switch: ['Switch'],
  toggle: ['Switch', 'ToggleButton'],
  table: ['Table', 'useXDSTableSortable', 'useXDSTableSelection'],
  'data table': ['Table', 'useXDSTableSortable', 'useXDSTableSelection'],
  'sort table': ['Table', 'useXDSTableSortable'],
  'select rows': ['Table', 'useXDSTableSelection', 'useXDSTableSelectionState'],
  grid: ['Grid', 'Table'],
  modal: ['Dialog'],
  dialog: ['Dialog', 'AlertDialog'],
  popover: ['Popover'],
  tooltip: ['Tooltip', 'useXDSTooltip'],
  card: ['Card'],
  section: ['Section'],
  tabs: ['TabList', 'Tab'],
  accordion: ['Disclosure'],
  badge: ['Badge'],
  avatar: ['Avatar'],
  button: ['Button'],
  icon: ['Icon'],
  text: ['Text'],
  heading: ['Text'],
  'status indicator': ['StatusDot', 'Badge'],
};

// ── Scoring logic (same as route.ts) ───────────────────────────────────
function score(text, query) {
  const lower = text.toLowerCase();
  const queryLower = query.toLowerCase();
  if (lower === queryLower) return 100;
  if (lower.startsWith(queryLower)) return 90;
  if (lower.includes(queryLower)) return 85;
  const words = queryLower.split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return 0;
  let matched = 0;
  for (const word of words) {
    if (lower.includes(word)) matched++;
  }
  const ratio = matched / words.length;
  if (ratio === 1) return 75;
  if (ratio >= 0.5) return 50;
  if (ratio > 0) return 30;
  return 0;
}

function resolveAliases(query) {
  const lower = query.toLowerCase();
  const resolved = [];
  for (const [alias, targets] of Object.entries(ALIASES)) {
    if (lower.includes(alias)) {
      resolved.push(...targets);
    }
  }
  return [...new Set(resolved)];
}

// ── Simulate search tool ───────────────────────────────────────────────
function simulateSearch(query, limit = 8) {
  const aliasMatches = resolveAliases(query);
  const scored = [];

  for (const comp of visibleComponents) {
    let best = 0;
    if (aliasMatches.includes(comp.name)) {
      best = 95;
    } else {
      const nameScore = score(comp.name, query);
      const descScore = score(comp.description, query);
      const kwScore = Math.max(...comp.keywords.map(k => score(k, query)), 0);
      best = Math.max(nameScore, descScore, kwScore);
    }
    if (best > 0) scored.push({item: comp, score: best, type: 'component'});
  }

  for (const doc of docTopicsData) {
    const topicScore = score(doc.topic, query);
    const titleScore = score(doc.title, query);
    const descScore = score(doc.description, query);
    const sectionScore = Math.max(...doc.sections.map(s => score(s.title, query) * 0.8), 0);
    const best = Math.max(topicScore, titleScore, descScore, sectionScore);
    if (best > 0) scored.push({item: doc, score: best, type: 'doc'});
  }

  for (const t of templatesData) {
    const nameScore = score(t.name, query);
    const descScore = score(t.description, query);
    const best = Math.max(nameScore, descScore);
    if (best > 0) scored.push({item: t, score: best, type: 'template'});
  }

  scored.sort((a, b) => b.score - a.score);
  const top = scored.slice(0, limit);

  return top.map(entry => {
    if (entry.type === 'component') {
      const comp = entry.item;
      return {
        type: 'component',
        name: comp.name,
        moduleName: comp.moduleName,
        group: comp.group,
        description: comp.description,
        import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
        keyProps: comp.props
          .filter(p => p.required || p.name === 'variant' || p.name === 'size' || p.name === 'label' || p.name === 'value' || p.name === 'onChange')
          .slice(0, 6)
          .map(p => `${p.name}${p.required ? '*' : ''}: ${p.type}`),
        ...(comp.params && comp.params.length > 0
          ? { returns: (comp.returns ?? []).map(r => `${r.name}: ${r.type}`) }
          : {}),
        ...((comp.relatedComponents ?? []).length > 0 ? {relatedComponents: comp.relatedComponents.slice(0, 4)} : {}),
        ...((comp.relatedHooks ?? []).length > 0 ? {relatedHooks: comp.relatedHooks.slice(0, 3)} : {}),
      };
    } else if (entry.type === 'doc') {
      const doc = entry.item;
      return {
        type: 'doc',
        topic: doc.topic,
        title: doc.title,
        description: doc.description,
        sections: doc.sections.map(s => s.title),
      };
    } else {
      const t = entry.item;
      return {
        type: 'template',
        slug: t.slug,
        name: t.name,
        description: t.description,
      };
    }
  });
}

// ── Simulate get tool ──────────────────────────────────────────────────
function simulateGet(name, section) {
  const normalized = name.replace(/^XDS/i, '');
  const lower = normalized.toLowerCase();

  const comp = visibleComponents.find(
    c => c.name.toLowerCase() === lower || c.moduleName.toLowerCase() === `xds${lower}` || c.moduleName.toLowerCase() === lower,
  );

  if (comp) {
    // Search by name, directory, or group for hooks
    const exampleNames = [
      comp.name.toLowerCase(),
      ...(comp.directory ? [comp.directory.toLowerCase()] : []),
      ...(comp.group && comp.group !== comp.name ? [comp.group.toLowerCase()] : []),
    ];
    const showcase = blocksData.find(
      b => exampleNames.includes(b.exampleFor.toLowerCase()) && b.isShowcase,
    );
    const relatedBlocks = blocksData
      .filter(b => exampleNames.includes(b.exampleFor.toLowerCase()) && !b.isShowcase)
      .slice(0, 1);
    const groupMembers = comp.group
      ? visibleComponents.filter(c => c.group === comp.group && c.name !== comp.name && !c.hidden)
      : [];

    return {
      found: true,
      type: 'component',
      data: {
        name: comp.name,
        moduleName: comp.moduleName,
        import: `import {${comp.moduleName}} from '@xds/core/${comp.name}';`,
        group: comp.group,
        description: comp.description,
        props: comp.props,
        usage: comp.usage,
        theming: comp.theming,
        relatedComponents: comp.relatedComponents,
        relatedHooks: comp.relatedHooks,
        ...(comp.params ? {params: comp.params, returns: comp.returns} : {}),
        ...(showcase ? {example: {name: showcase.name, description: showcase.description, source: showcase.source}} : {}),
        ...(relatedBlocks.length > 0 ? {moreExamples: relatedBlocks.map(b => ({name: b.name, description: b.description, source: b.source}))} : {}),
        ...(groupMembers.length > 0 ? {
          groupMembers: groupMembers.slice(0, 6).map(m => ({
            name: m.name,
            moduleName: m.moduleName,
            import: `import {${m.moduleName}} from '@xds/core/${m.name}';`,
            description: m.description.slice(0, 120),
            ...(m.params ? {returns: (m.returns ?? []).slice(0, 2).map(r => `${r.name}: ${r.type}`)} : {}),
          })),
        } : {}),
      },
    };
  }

  const doc = docTopicsData.find(d => d.topic.toLowerCase() === lower);
  if (doc) {
    return {found: true, type: 'doc', data: doc};
  }

  const template = templatesData.find(t => t.slug?.toLowerCase() === lower || t.name.toLowerCase() === lower);
  if (template) {
    return {found: true, type: 'template', data: template};
  }

  return {found: false};
}

// ── Evaluation criteria ────────────────────────────────────────────────
/**
 * For each prompt, we evaluate:
 * 1. Compiles (0/1) — Would a generated component compile?
 * 2. Correct imports (0/1) — Are correct @xds/core/X paths present?
 * 3. Correct API usage (0-3) — Props, hooks, composition correct?
 * 4. Follows best practices (0-2) — Uses tokens, follows guidance?
 * 5. No design system escape (0-2) — No raw HTML/CSS fallback?
 * 6. Would render correctly (0/1) — Would it look right?
 */

const PROMPTS = [
  {
    id: 'A1',
    prompt: 'Build me a finance dashboard app. The brand is dark navy with gold accents. Use XDS.',
    queries: ['dashboard', 'theming', 'sidebar navigation'],
    gets: ['AppShell', 'SideNav', 'Card'],
    expectations: {
      components: ['AppShell', 'SideNav', 'Card', 'TopNav'],
      imports: true,
      hasExamples: true,
      hasTheming: true,
    },
  },
  {
    id: 'B1',
    prompt: 'Build me an admin panel with a sidebar and main content area',
    queries: ['admin panel sidebar'],
    gets: ['AppShell', 'SideNav'],
    expectations: {
      components: ['AppShell', 'SideNav'],
      imports: true,
      hasExamples: true,
    },
  },
  {
    id: 'C1',
    prompt: 'I need a table of users that you can sort and select rows',
    queries: ['table sort select rows'],
    gets: ['Table'],
    expectations: {
      components: ['Table', 'useXDSTableSortable', 'useXDSTableSelection'],
      imports: true,
      hasExamples: true,
      hasCompoundAwareness: true,
    },
  },
  {
    id: 'E1',
    prompt: 'Add a form with name, email, and a role dropdown',
    queries: ['form inputs dropdown'],
    gets: ['FormLayout', 'TextInput', 'Selector'],
    expectations: {
      components: ['FormLayout', 'TextInput', 'Selector'],
      imports: true,
      hasExamples: true,
    },
  },
  {
    id: 'F1',
    prompt: 'Show a success message after the form submits',
    queries: ['success message'],
    gets: ['useXDSToast'],
    expectations: {
      components: ['Toast', 'useXDSToast'],
      imports: true,
      hasExamples: true,
      hasHookPattern: true,
    },
  },
  {
    id: 'G1',
    prompt: 'Add a sidebar with sections for Dashboard, Users, and Settings',
    queries: ['sidebar navigation sections'],
    gets: ['SideNav'],
    expectations: {
      components: ['SideNav'],
      imports: true,
      hasExamples: true,
    },
  },
  {
    id: 'H1',
    prompt: 'Add a dropdown to pick the user\'s role',
    queries: ['dropdown picker role'],
    gets: ['Selector'],
    expectations: {
      components: ['Selector'],
      imports: true,
      hasExamples: true,
    },
  },
];

// ── Run the vibe test ──────────────────────────────────────────────────
let totalTokens = 0;
const results = [];

for (const prompt of PROMPTS) {
  console.log(`\n${'═'.repeat(70)}`);
  console.log(`[${prompt.id}] ${prompt.prompt}`);
  console.log(`${'─'.repeat(70)}`);

  let promptTokens = 0;
  let scoreTotal = 0;
  const issues = [];

  // Phase 1: Search
  const searchResults = [];
  for (const q of prompt.queries) {
    const sr = simulateSearch(q);
    const srJson = JSON.stringify(sr, null, 2);
    promptTokens += srJson.length;
    searchResults.push(...sr);
    console.log(`  search("${q}") → ${sr.length} results (${(srJson.length / 4).toFixed(0)} tokens)`);
    console.log(`    Top: ${sr.slice(0, 4).map(r => `${r.name || r.topic || r.slug} (${r.type})`).join(', ')}`);
  }

  // Phase 2: Get (based on search results + expected gets)
  const getResults = [];
  for (const name of prompt.gets) {
    const gr = simulateGet(name);
    if (gr.found) {
      const grJson = JSON.stringify(gr.data, null, 2);
      promptTokens += grJson.length;
      getResults.push(gr);
      console.log(`  get("${name}") → ${gr.type} (${(grJson.length / 4).toFixed(0)} tokens)`);
    } else {
      console.log(`  get("${name}") → NOT FOUND ❌`);
      issues.push(`get("${name}") returned nothing`);
    }
  }

  // ── Evaluate ─────────────────────────────────────────────────────
  const allSearchNames = searchResults.map(r => r.name || '');
  const allGetData = getResults.map(r => r.data);

  // 1. Compiles (0/1) — Are imports present that would make code compile?
  const hasImports = allGetData.some(d => d.import);
  if (hasImports) {
    scoreTotal += 1;
  } else {
    issues.push('No import paths found');
  }

  // 2. Correct imports (0/1) — All expected components found?
  const foundComponents = new Set([
    ...allSearchNames,
    ...allGetData.map(d => d.name),
    ...allGetData.flatMap(d => (d.groupMembers || []).map(m => m.name)),
  ]);
  const expectedFound = prompt.expectations.components.filter(c => foundComponents.has(c));
  if (expectedFound.length >= prompt.expectations.components.length * 0.75) {
    scoreTotal += 1;
  } else {
    issues.push(`Missing components: ${prompt.expectations.components.filter(c => !foundComponents.has(c)).join(', ')}`);
  }

  // 3. Correct API usage (0-3)
  let apiScore = 0;
  // Props documented?
  const hasProps = allGetData.some(d => (d.props && d.props.length > 0) || (d.params) || (d.returns && d.returns.length > 0));
  if (hasProps) apiScore += 1;
  // Usage/best practices documented?
  const hasUsage = allGetData.some(d => d.usage);
  if (hasUsage) apiScore += 1;
  // Related components/hooks surfaced for compound patterns?
  if (prompt.expectations.hasCompoundAwareness) {
    const hasGroup = allGetData.some(d => d.groupMembers && d.groupMembers.length > 0);
    if (hasGroup) apiScore += 1;
    else issues.push('Compound component awareness missing');
  } else if (prompt.expectations.hasHookPattern) {
    const hasHookInfo = allGetData.some(d => d.returns && d.returns.length > 0);
    if (hasHookInfo) apiScore += 1;
    else issues.push('Hook return type info missing');
  } else {
    apiScore += 1; // Default pass for simple components
  }
  scoreTotal += apiScore;

  // 4. Follows best practices (0-2)
  let bpScore = 0;
  const hasBestPractices = allGetData.some(d => d.usage?.bestPractices?.length > 0);
  if (hasBestPractices) bpScore += 1;
  // Has code example?
  const hasExample = allGetData.some(d => d.example || (d.moreExamples && d.moreExamples.length > 0));
  if (hasExample) bpScore += 1;
  else issues.push('No code examples found');
  scoreTotal += bpScore;

  // 5. No design system escape (0-2)
  // If the MCP provides enough info, agent won't need to escape
  let escapeScore = 0;
  // Enough component variety for the task?
  if (expectedFound.length >= prompt.expectations.components.length * 0.5) escapeScore += 1;
  // Has template or example showing full composition?
  if (hasExample || searchResults.some(r => r.type === 'template')) escapeScore += 1;
  scoreTotal += escapeScore;

  // 6. Would render correctly (0/1)
  // Based on whether props + examples are sufficient
  if (hasProps && (hasExample || hasUsage)) {
    scoreTotal += 1;
  } else {
    issues.push('Insufficient info for correct rendering');
  }

  const maxScore = 10;
  const pct = ((scoreTotal / maxScore) * 100).toFixed(0);
  const tokenEstimate = Math.round(promptTokens / 4);
  totalTokens += tokenEstimate;

  console.log(`\n  Score: ${scoreTotal}/${maxScore} (${pct}%)`);
  if (issues.length > 0) {
    console.log(`  Issues: ${issues.join('; ')}`);
  }
  console.log(`  Tokens: ~${tokenEstimate.toLocaleString()}`);

  results.push({id: prompt.id, score: scoreTotal, maxScore, tokens: tokenEstimate, issues});
}

// ── Summary ────────────────────────────────────────────────────────────
console.log(`\n${'═'.repeat(70)}`);
console.log('VIBE TEST RESULTS SUMMARY');
console.log(`${'═'.repeat(70)}`);
console.log('');
console.log('| Prompt | Score | % | Tokens | Issues |');
console.log('|--------|-------|-----|--------|--------|');
for (const r of results) {
  const issueStr = r.issues.length > 0 ? r.issues[0] : '✓';
  console.log(`| ${r.id} | ${r.score}/${r.maxScore} | ${((r.score/r.maxScore)*100).toFixed(0)}% | ~${r.tokens.toLocaleString()} | ${issueStr} |`);
}
const avgScore = results.reduce((s, r) => s + r.score, 0) / results.length;
const avgPct = ((avgScore / 10) * 100).toFixed(1);
console.log('');
console.log(`Average: ${avgScore.toFixed(1)}/10 (${avgPct}%)`);
console.log(`Total tokens: ~${totalTokens.toLocaleString()}`);
console.log(`Target: 90%+ quality, ≤40K tokens`);
console.log(`Status: ${parseFloat(avgPct) >= 90 ? '✅ PASS' : '❌ NEEDS WORK'}`);
