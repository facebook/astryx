// Copyright (c) Meta Platforms, Inc. and affiliates.

// Generates one reference doc per arm from a single template.
//
// Checker Protocol §2 ("only the system under test varies") is enforced here
// rather than by inspection: every arm shares a byte-identical intro, base
// prop table, option table, structural paragraph, first example and closing
// note. The ONLY substitutions are the row(s) that declare the action, the
// prose describing that shape, and the second example.
//
// The structural paragraph (STRUCTURE) is deliberately shared: the host is the
// same in every arm — a panel that becomes a grid of option + actions cell when
// any option carries an action — so the arms differ only in how a caller
// declares the action. Arm A documents the shape the open pull request ships.

import {mkdirSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));

const TEMPLATE = `# MultiSelector

\`\`\`
import {MultiSelector} from '@astryxdesign/core';
\`\`\`

\`MultiSelector\` is a form field that opens a panel of options; a person checks
any number of them. The field shows how many are chosen, and the panel can
carry a search box and a select-all row. Each option is one row with a
checkbox, a label, and an optional description and icon.

## Props

| prop | type | default |
| --- | --- | --- |
| \`label\` | \`string\` | — |
| \`options\` | \`MultiSelectorOptionType[]\` | — |
| \`value\` | \`string[]\` | — |
| \`onChange\` | \`(value: string[]) => void\` | — |
| \`placeholder\` | \`string\` | \`'Select...'\` |
| \`hasSearch\` | \`boolean\` | \`false\` |
| \`hasSelectAll\` | \`boolean\` | \`false\` |
| \`isDisabled\` | \`boolean\` | \`false\` |
| \`emptyText\` | \`ReactNode\` | \`'No options'\` |
| \`renderOption\` | \`(option: MultiSelectorOptionData) => ReactNode\` | — |
__PROP_ROWS__

## Options

Each entry of \`options\` is a plain string, or a \`MultiSelectorOptionData\`
object:

| key | type |
| --- | --- |
| \`value\` | \`string\` |
| \`label\` | \`string\` |
| \`description\` | \`ReactNode\` |
| \`icon\` | \`ReactNode\` |
| \`disabled\` | \`boolean\` |
__OPTION_ROWS__

\`renderOption\` replaces what is drawn inside an option's own click target;
anything placed there is part of toggling the option.

\`Icon\`, \`IconButton\` and \`Button\` are also exported from
\`@astryxdesign/core\`. \`<Icon icon="info" />\` takes a name from \`info\`,
\`wrench\`, \`copy\`, \`close\`, \`search\`, \`moreHorizontal\`, \`arrowUp\`.
\`IconButton\` takes \`label\` (its accessible name), \`icon\`, \`onClick\`,
\`variant?: 'primary' | 'secondary' | 'ghost' | 'destructive'\` and
\`size?: 'sm' | 'md' | 'lg'\`; \`Button\` takes the same and shows its \`label\`
as text.

## Actions beside an option

__ACTION_PROSE__

The panel is normally a listbox, which may contain only options, so a control
cannot sit beside an option inside it. When any option carries an action, the
panel becomes a grid instead: each row is one option and one actions cell
holding that option's action or actions. Up and Down move between rows; Left
and Right move between the option and its actions cell; Space toggles the
focused option. An action is a real button, activated with Enter or Space
while it has focus, and activating it never toggles the option. With no
actions, the panel stays a plain listbox and nothing changes.

## Examples

A plain picker:

\`\`\`tsx
<MultiSelector
  label="Labels"
  options={labels}
  value={selected}
  onChange={setSelected}
/>
\`\`\`

__EXAMPLE_2__

## Note

Checking an option is the option's own click. Anything else a person can do
to an option is a secondary action: it must not toggle the option and must
stay reachable by keyboard. __NOTE_TAIL__
`;

const ARMS = {
  'arm-a-render-prop': {
    PROP_ROWS:
      '| `renderOptionAction` | `(option: MultiSelectorOptionData) => ReactNode` | — |',
    OPTION_ROWS: '',
    ACTION_PROSE:
      '`renderOptionAction` is called once per option and returns the control or\n' +
      "controls for that option's actions cell — an `IconButton`, a `Button`, or a\n" +
      'fragment of several — or `null` for an option without one. It is not\n' +
      'called for the select-all row. The panel becomes a grid whenever\n' +
      '`renderOptionAction` is passed: it cannot tell whether the function will\n' +
      'return something for any row, so pass it only when at least one option has\n' +
      'an action.',
    EXAMPLE_2:
      'Options with a secondary action:\n\n' +
      '```tsx\n' +
      '<MultiSelector\n' +
      '  label="Labels"\n' +
      '  options={labels}\n' +
      '  value={selected}\n' +
      '  onChange={setSelected}\n' +
      '  renderOptionAction={option =>\n' +
      "    option.value.startsWith('custom:') ? (\n" +
      '      <IconButton\n' +
      '        label={`Edit ${option.label}`}\n' +
      '        icon={<Icon icon="wrench" />}\n' +
      '        variant="ghost"\n' +
      '        size="sm"\n' +
      '        onClick={() => edit(option.value)}\n' +
      '      />\n' +
      '    ) : null\n' +
      '  }\n' +
      '/>\n' +
      '```',
    NOTE_TAIL: 'Return it from `renderOptionAction`.',
  },
  'arm-b-node': {
    PROP_ROWS: '',
    OPTION_ROWS: '| `action` | `ReactNode` |',
    ACTION_PROSE:
      "`action` on an option is the control or controls for that option's\n" +
      'actions cell — an `IconButton`, a `Button`, or a fragment of several. Omit\n' +
      'it on an option without one. The panel becomes a grid when any option in\n' +
      '`options` has an `action`.',
    EXAMPLE_2:
      'Options with a secondary action:\n\n' +
      '```tsx\n' +
      'const options = labels.map(label => ({\n' +
      '  value: label.id,\n' +
      '  label: label.name,\n' +
      '  action: label.isCustom ? (\n' +
      '    <IconButton\n' +
      '      label={`Edit ${label.name}`}\n' +
      '      icon={<Icon icon="wrench" />}\n' +
      '      variant="ghost"\n' +
      '      size="sm"\n' +
      '      onClick={() => edit(label.id)}\n' +
      '    />\n' +
      '  ) : undefined,\n' +
      '}));\n\n' +
      '<MultiSelector\n' +
      '  label="Labels"\n' +
      '  options={options}\n' +
      '  value={selected}\n' +
      '  onChange={setSelected}\n' +
      '/>\n' +
      '```',
    NOTE_TAIL: "Put it in the option's `action`.",
  },
  'arm-c-declared': {
    PROP_ROWS: '',
    OPTION_ROWS:
      '| `action` | `{label: string; icon?: ReactNode; onClick: () => void}` |',
    ACTION_PROSE:
      "`action` on an option declares that option's secondary action as data:\n" +
      'the panel renders one button in the actions cell, named by `label` and\n' +
      'showing `icon` when given, and calls `onClick` when it is activated. Omit\n' +
      'it on an option without one. The panel becomes a grid when any option in\n' +
      '`options` has an `action`.',
    EXAMPLE_2:
      'Options with a secondary action:\n\n' +
      '```tsx\n' +
      'const options = labels.map(label => ({\n' +
      '  value: label.id,\n' +
      '  label: label.name,\n' +
      '  action: label.isCustom\n' +
      '    ? {\n' +
      '        label: `Edit ${label.name}`,\n' +
      '        icon: <Icon icon="wrench" />,\n' +
      '        onClick: () => edit(label.id),\n' +
      '      }\n' +
      '    : undefined,\n' +
      '}));\n\n' +
      '<MultiSelector\n' +
      '  label="Labels"\n' +
      '  options={options}\n' +
      '  value={selected}\n' +
      '  onChange={setSelected}\n' +
      '/>\n' +
      '```',
    NOTE_TAIL: "Declare it in the option's `action`.",
  },
  'arm-d-array': {
    PROP_ROWS: '',
    OPTION_ROWS: '| `actions` | `ReactNode[]` |',
    ACTION_PROSE:
      "`actions` on an option lists the controls for that option's actions cell,\n" +
      'rendered in order — `IconButton`s, `Button`s, or any other control. Omit\n' +
      'it, or pass an empty array, on an option without one. The panel becomes a\n' +
      'grid when any option in `options` has a non-empty `actions`.',
    EXAMPLE_2:
      'Options with a secondary action:\n\n' +
      '```tsx\n' +
      'const options = labels.map(label => ({\n' +
      '  value: label.id,\n' +
      '  label: label.name,\n' +
      '  actions: label.isCustom\n' +
      '    ? [\n' +
      '        <IconButton\n' +
      '          key="edit"\n' +
      '          label={`Edit ${label.name}`}\n' +
      '          icon={<Icon icon="wrench" />}\n' +
      '          variant="ghost"\n' +
      '          size="sm"\n' +
      '          onClick={() => edit(label.id)}\n' +
      '        />,\n' +
      '      ]\n' +
      '    : [],\n' +
      '}));\n\n' +
      '<MultiSelector\n' +
      '  label="Labels"\n' +
      '  options={options}\n' +
      '  value={selected}\n' +
      '  onChange={setSelected}\n' +
      '/>\n' +
      '```',
    NOTE_TAIL: "List it in the option's `actions`.",
  },
  // Recall probe: the behavior is described and said to exist, but no prop or
  // key is named and no second example is given. The agent produces the API it
  // expects.
  'arm-recall': {
    PROP_ROWS: '',
    OPTION_ROWS: '',
    ACTION_PROSE:
      'An option can carry a secondary action beside it — an Edit button beside\n' +
      'a saved label, say — that a person activates without toggling the option.\n' +
      'Some options have one and some do not, and an option may have more than\n' +
      'one. **The props or keys that do this are not listed in this reference.**',
    EXAMPLE_2: '',
    NOTE_TAIL: "Use the component's own API for it.",
  },
};

mkdirSync(join(here, 'docs'), {recursive: true});
for (const [name, subs] of Object.entries(ARMS)) {
  let out = TEMPLATE;
  for (const [key, value] of Object.entries(subs)) {
    out = out.replace(`__${key}__`, value);
  }
  // Collapse the blank line left behind by an empty substitution.
  out = out.replace(/\n{3,}/g, '\n\n');
  writeFileSync(join(here, 'docs', `${name}.md`), out);
}
