// Copyright (c) Meta Platforms, Inc. and affiliates.

// Generates one reference doc per arm from a single template.
//
// Checker Protocol §2 ("only the system under test varies") is enforced here
// rather than by inspection:
// - arm B's doc, with its two differing value names mapped back to arm A's,
//   must equal arm A's doc byte for byte, and so must arm C's with its prop
//   name mapped back;
// - the prose outside code spans must not use a word that echoes one arm's
//   value names (pad, inset, inside, outset, outside, hang), and the recall
//   doc's prose must not use a word that would name the prop for the agent.
// The script exits non-zero when either check fails.

import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, 'docs');

/** Arm prop and value names, values in the order inset · flush · outset · bleed. */
const ARMS = {
  'arm-a': {
    prop: 'edge',
    inset: 'inset',
    flush: 'flush',
    outset: 'outset',
    bleed: 'bleed',
  },
  'arm-b': {
    prop: 'edge',
    inset: 'padded',
    flush: 'flush',
    outset: 'hanging',
    bleed: 'bleed',
  },
  // Round 2: the recall probe's most common prop name, with arm A's values.
  'arm-c': {
    prop: 'rowAlignment',
    inset: 'inset',
    flush: 'flush',
    outset: 'outset',
    bleed: 'bleed',
  },
};

const TEMPLATE = `# List

\`\`\`
import {List, ListItem} from '@astryxdesign/core/List';
\`\`\`

\`List\` renders a vertical list of rows. Each \`ListItem\` shows a \`label\`, an
optional \`description\` beneath it, and optional \`startContent\` (an icon or
avatar) and \`endContent\` (a badge or a price). A row becomes clickable with
\`onClick\` or \`href\` and shows a highlight while the pointer is over it;
\`isSelected\` keeps the highlight on.

A list often sits under a heading, and often in a \`Card\`, \`Section\`, or
\`Dialog\`, each of which keeps its content a set distance from its own
borders. They come from \`@astryxdesign/core/Card\`, \`@astryxdesign/core/Section\`,
and \`@astryxdesign/core/Dialog\`; \`Heading\` comes from \`@astryxdesign/core/Text\`.

## Props

### List

| prop | type | default |
| --- | --- | --- |
| \`children\` | \`ReactNode\` | — |
| \`header\` | \`ReactNode\` | — |
| \`density\` | \`'compact' \\| 'balanced' \\| 'spacious'\` | \`'balanced'\` |
| \`hasDividers\` | \`boolean\` | \`false\` |
__EDGE_ROW__

\`header\` renders a label above the rows. \`hasDividers\` draws a thin line
between rows.

__EDGE_PROSE__

### ListItem

| prop | type |
| --- | --- |
| \`label\` | \`ReactNode\` (required) |
| \`description\` | \`ReactNode\` |
| \`startContent\` | \`ReactNode\` |
| \`endContent\` | \`ReactNode\` |
| \`onClick\` | \`() => void\` |
| \`href\` | \`string\` |
| \`isSelected\` | \`boolean\` |
| \`isDisabled\` | \`boolean\` |

## Examples

Default, no configuration:

\`\`\`tsx
<List>
  <ListItem label="Notifications" description="Manage your alerts" />
  <ListItem label="Privacy" description="Control your data" />
</List>
\`\`\`

__EXAMPLE_2__

## Anti-pattern

Don't shift rows with your own styles:

\`\`\`tsx
/* Don't do this */
<List style={{marginInline: -8}}>…</List>
\`\`\`

The highlight and dividers stop matching the row text. __ANTIPATTERN_TAIL__
`;

/**
 * The four looks, described once. `label(key)` renders how each look is
 * named: a value in the arms, "look N" in the recall doc.
 */
function looks(label) {
  return [
    `- ${label('inset', true)}: text sits a short distance away from the list's sides.
  The highlight and dividers span the list and extend a little beyond the
  text, and the text does not line up with a heading above the list: it
  starts a short distance after it.`,
    `- ${label('flush', true)}: text, highlight, and dividers all start and end at the
  list's sides, so the text is in line with a heading above the list. Works
  anywhere.`,
    `- ${label('outset', true)}: text is in line with a heading above the list. The
  highlight and dividers extend a little beyond the text, into the space
  between the list and the borders of the surrounding \`Card\`, \`Section\`, or
  \`Dialog\`, without reaching those borders.`,
    `- ${label('bleed', true)}: text is in line with a heading above the list. The
  highlight and dividers stretch to the borders of the surrounding \`Card\`,
  \`Section\`, or \`Dialog\`, like table rows.`,
  ].join('\n');
}

const NO_CONTAINER = label =>
  `Without a surrounding \`Card\`, \`Section\`, or \`Dialog\`, ${label('outset')} and
${label('bleed')} place text, highlight, and dividers as ${label('inset')} does.`;

function armSubs(names) {
  const value = key => `\`'${names[key]}'\``;
  const union = ['inset', 'flush', 'outset', 'bleed']
    .map(key => `'${names[key]}'`)
    .join(' \\| ');
  return {
    EDGE_ROW: `| \`${names.prop}\` | \`${union}\` | \`'${names.inset}'\` |`,
    EDGE_PROSE: `\`${names.prop}\` sets where each row's text, highlight, and divider sit, relative to
the list's sides and to the borders of a surrounding \`Card\`, \`Section\`, or
\`Dialog\`. A list uses one value:

${looks(value)}

${NO_CONTAINER(value)}`,
    EXAMPLE_2: `Row text in line with a heading above the list:

\`\`\`tsx
<Heading level={3}>Shortcuts</Heading>
<List ${names.prop}="${names.flush}">
  <ListItem label="Search" endContent="⌘K" />
  <ListItem label="New file" endContent="⌘N" />
</List>
\`\`\``,
    ANTIPATTERN_TAIL: `Use \`${names.prop}\` instead.`,
  };
}

const LOOK_NUMBERS = {inset: 1, flush: 2, outset: 3, bleed: 4};

const RECALL_SUBS = {
  EDGE_ROW: '',
  EDGE_PROSE: `Each list uses one of four row looks. The looks set where each row's text,
highlight, and divider sit, relative to the list's sides and to the borders of
a surrounding \`Card\`, \`Section\`, or \`Dialog\`:

${looks(
  (key, isBullet) =>
    `${isBullet ? 'Look' : 'look'} ${LOOK_NUMBERS[key]}${key === 'inset' && isBullet ? ' (the default)' : ''}`,
)}

${NO_CONTAINER(key => `look ${LOOK_NUMBERS[key]}`)}

**The API for choosing a look is not listed in this reference.**`,
  EXAMPLE_2: '',
  ANTIPATTERN_TAIL: "Use the component's own API instead.",
};

function render(subs) {
  let out = TEMPLATE;
  for (const [key, value] of Object.entries(subs)) {
    out = out.replace(`__${key}__`, value);
  }
  return out.replace(/\n{3,}/g, '\n\n');
}

/** The prose a reader sees outside code fences and inline code. */
function prose(doc) {
  return doc.replace(/```[\s\S]*?```/g, ' ').replace(/`[^`]*`/g, ' ');
}

const ECHO = /pad|inset|inside|outset|outside|hang/i;
const NAMES_THE_PROP = /edge|inset|bleed|flush|gutter|spacing|padding|align/i;

const docs = {
  'arm-a': render(armSubs(ARMS['arm-a'])),
  'arm-b': render(armSubs(ARMS['arm-b'])),
  'arm-c': render(armSubs(ARMS['arm-c'])),
  'arm-recall': render(RECALL_SUBS),
};

const problems = [];
const mappedB = docs['arm-b']
  .replaceAll("'padded'", "'inset'")
  .replaceAll("'hanging'", "'outset'");
if (mappedB !== docs['arm-a']) {
  problems.push('arm-b differs from arm-a beyond the two value names');
}
if (docs['arm-c'].replaceAll('rowAlignment', 'edge') !== docs['arm-a']) {
  problems.push('arm-c differs from arm-a beyond the prop name');
}
for (const [name, doc] of Object.entries(docs)) {
  const echo = prose(doc).match(ECHO);
  if (echo) problems.push(`${name}: prose echoes a value name ("${echo[0]}")`);
}
const naming = prose(docs['arm-recall']).match(NAMES_THE_PROP);
if (naming) problems.push(`arm-recall: prose names the prop ("${naming[0]}")`);

mkdirSync(OUT, {recursive: true});
for (const [name, doc] of Object.entries(docs)) {
  writeFileSync(join(OUT, `${name}.md`), doc);
  const words = doc.split(/\s+/).filter(Boolean).length;
  console.log(`${name.padEnd(12)} ${String(words).padStart(4)} words`);
}
if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log('parity and echo checks passed');
