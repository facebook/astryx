// Copyright (c) Meta Platforms, Inc. and affiliates.

// Scores what can be scored mechanically, from results/out/<task id>.md:
// - use: the `edge` value each agent put on <List>, against prompts.json's
//   ground truth, plus undocumented props and custom styles;
// - recall: the prop name and the four value names each agent wrote;
// - reading: each multiple-choice answer, against the real geometry.
// p7 (a deliberate conflict) and every fuzzy dimension go to the judge.
// Prints markdown tables; run after the agents' replies are saved.

import {existsSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'results', 'out');
const spec = JSON.parse(readFileSync(join(HERE, 'prompts.json'), 'utf8'));
const read = id => {
  const path = join(OUT, `${id}.md`);
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
};

const LIST_PROPS = new Set([
  'children',
  'header',
  'density',
  'hasDividers',
  'edge',
  'rowAlignment',
  'key',
]);
const ITEM_PROPS = new Set([
  'label',
  'description',
  'startContent',
  'endContent',
  'onClick',
  'href',
  'isSelected',
  'isDisabled',
  'key',
]);
const STYLE_PROPS = /\b(style|xstyle|className)=/;

/** Props written on each opening tag of `name`, from the reply's code. */
function tagProps(code, name) {
  const found = [];
  const opener = new RegExp(`<${name}\\b`, 'g');
  let match;
  while ((match = opener.exec(code)) != null) {
    // Read attribute names only, skipping quoted values and braced
    // expressions (an icon in startContent has props of its own).
    const props = [];
    let i = match.index + name.length + 1;
    while (i < code.length) {
      const char = code[i];
      if (char === '>' || (char === '/' && code[i + 1] === '>')) break;
      const attr = /^[A-Za-z][\w-]*/.exec(code.slice(i));
      if (attr == null) {
        i++;
        continue;
      }
      props.push(attr[0]);
      i += attr[0].length;
      if (code[i] !== '=') continue;
      i++;
      if (code[i] === '"' || code[i] === "'") {
        i = code.indexOf(code[i], i + 1) + 1;
      } else if (code[i] === '{') {
        for (let depth = 0; i < code.length; i++) {
          if (code[i] === '{') depth++;
          else if (code[i] === '}' && --depth === 0) {
            i++;
            break;
          }
        }
      }
    }
    found.push(props);
  }
  return found;
}

/** The value of `prop` on <List>, or null when the list leaves it unset. */
function edgeValue(code, prop) {
  const m = code.match(
    new RegExp(`<List\\b[^>]*\\b${prop}=(?:"([^"]+)"|\\{['"]([^'"]+)['"]\\})`),
  );
  return m ? (m[1] ?? m[2]) : null;
}

const rows = [];
const correctCount = Object.fromEntries(
  Object.keys(spec.arms).map(arm => [arm, 0]),
);
for (const prompt of spec.generation.prompts) {
  for (const [arm, {values, prop}] of Object.entries(spec.arms)) {
    const reply = read(`gen-${prompt.id}-${arm}`);
    if (reply == null) continue;
    const code = (reply.match(/```tsx\n([\s\S]*?)```/) ?? [, ''])[1];
    const value = edgeValue(code, prop);
    const canonical =
      value == null
        ? 'unset'
        : (Object.keys(values).find(k => values[k] === value) ?? `?${value}`);
    const invented = [
      ...tagProps(code, 'List')
        .flat()
        .filter(p => !LIST_PROPS.has(p)),
      ...tagProps(code, 'ListItem')
        .flat()
        .filter(p => !ITEM_PROPS.has(p)),
    ];
    const styled = STYLE_PROPS.test(code);
    const wrapped = /<(Section|Card|Dialog)\b/.exec(code)?.[1] ?? '—';
    const confidence = (reply.match(/Confidence:\s*(\d)/) ?? [, '?'])[1];
    let verdict;
    if (prompt.correct === 'conflict') verdict = 'judge';
    else if (prompt.correct === 'unset')
      verdict =
        canonical === 'unset'
          ? 'yes'
          : canonical === 'inset'
            ? 'yes (explicit default)'
            : 'no';
    else verdict = canonical === prompt.correct ? 'yes' : 'no';
    if (verdict.startsWith('yes')) correctCount[arm]++;
    rows.push(
      `| ${prompt.id} | ${arm.toUpperCase()} | ${prompt.correct} | ${value ?? '(unset)'} | ${verdict} | ${invented.length ? invented.join(', ') : 'none'} | ${styled ? 'yes' : 'no'} | ${wrapped} | ${confidence}/5 |`,
    );
  }
}

console.log('## Use (scripted)\n');
console.log(
  '| prompt | arm | correct look | value written | correct | undocumented props | custom styles | wrapper | confidence |',
);
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
console.log(rows.join('\n'));
console.log(
  `\nScripted correct, excluding p7: ${Object.entries(correctCount)
    .map(([arm, n]) => `${arm.toUpperCase()} (${spec.arms[arm].prop}) ${n}/6`)
    .join(', ')}.\n`,
);

console.log('## Recall (scripted)\n');
console.log('| sample | prop | look 1 | look 2 | look 3 | look 4 | shape |');
console.log('| --- | --- | --- | --- | --- | --- | --- |');
for (let i = 1; i <= spec.recall.samples; i++) {
  const reply = read(`recall-${i}`);
  if (reply == null) continue;
  const api = (reply.match(/```ts\n([\s\S]*?)```/) ?? [, ''])[1];
  const union = api.match(/(\w+)\??:\s*((?:'[^']+'\s*\|\s*)+'[^']+')/);
  const alias = api.match(/type\s+\w+\s*=\s*((?:'[^']+'\s*\|\s*)+'[^']+')/);
  const propLine = api.match(/^\s*(\w+)\??:\s*(\w+);/m);
  const prop = union?.[1] ?? propLine?.[1] ?? '?';
  const values =
    (union?.[2] ?? alias?.[1] ?? '')
      .match(/'([^']+)'/g)
      ?.map(v => v.slice(1, -1)) ?? [];
  const booleans = (api.match(/\w+\??:\s*boolean/g) ?? []).length;
  const shape =
    values.length === 4
      ? 'one prop, four values'
      : booleans > 0
        ? `${booleans} booleans`
        : '?';
  console.log(
    `| ${i} | \`${prop}\` | ${values.map(v => `\`${v}\``).join(' | ') || '? | ? | ? | ?'} | ${shape} |`,
  );
}

console.log('\n## Reading (scripted)\n');
console.log(
  '| prop | value | editor type shown | sample | text | highlight | dividers | all three right | confidence |',
);
console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
const CANON = {
  inset: 'inset',
  padded: 'inset',
  flush: 'flush',
  outset: 'outset',
  hanging: 'outset',
  bleed: 'bleed',
};
const conditions = [
  ...Object.entries(spec.reading.samples).map(([value, samples]) => ({
    id: `read-${value}`,
    prop: 'edge',
    value,
    samples,
    union: null,
  })),
  ...(spec.round2?.reading ?? []).map(c => ({
    ...c,
    id: `read2-${c.prop}-${c.value}${c.union ? '-union' : ''}`,
    union: c.union ?? null,
  })),
];
/** @type {Map<string, {right: number, total: number, textRight: number}>} */
const tally = new Map();
for (const c of conditions) {
  for (let i = 1; i <= c.samples; i++) {
    const reply = read(`${c.id}-${i}`);
    if (reply == null) continue;
    const answer = JSON.parse(
      reply.slice(reply.indexOf('{'), reply.lastIndexOf('}') + 1),
    );
    const truth = spec.reading.correct[CANON[c.value]];
    const mark = key =>
      answer[key] === truth[key]
        ? `${answer[key]} ✓`
        : `${answer[key]} ✗ (${truth[key]})`;
    const all = ['text', 'highlight', 'dividers'].every(
      k => answer[k] === truth[k],
    );
    console.log(
      `| \`${c.prop}\` | \`${c.value}\` | ${c.union ? 'yes' : 'no'} | ${c.id.startsWith('read2') ? 'r2' : 'r1'}·${i} | ${mark('text')} | ${mark('highlight')} | ${mark('dividers')} | ${all ? 'yes' : 'no'} | ${answer.confidence}/5 |`,
    );
    const key = `${c.prop}|${c.value}|${c.union ? 'type shown' : 'bare'}`;
    const t = tally.get(key) ?? {right: 0, total: 0, textRight: 0};
    t.total++;
    if (all) t.right++;
    if (answer.text === truth.text) t.textRight++;
    tally.set(key, t);
  }
}
console.log('\n### Reading totals\n');
console.log(
  '| prop | value | editor type shown | all three right | text placement right |',
);
console.log('| --- | --- | --- | --- | --- |');
for (const [key, t] of tally) {
  const [prop, value, shown] = key.split('|');
  console.log(
    `| \`${prop}\` | \`${value}\` | ${shown === 'type shown' ? 'yes' : 'no'} | ${t.right}/${t.total} | ${t.textRight}/${t.total} |`,
  );
}
