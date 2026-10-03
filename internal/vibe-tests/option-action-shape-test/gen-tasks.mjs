// Copyright (c) Meta Platforms, Inc. and affiliates.

// Generates the self-contained task prompt sent to each generating agent:
// one per prompt × documented arm, plus one per recall sample. The framing,
// the output contract and the task text are byte-identical across arms
// (Checker Protocol §2); only the inlined reference differs. Ground truth
// (`correct` in prompts.json) never enters a task (§3).
//
// Run `node gen-docs.mjs` first. Run from this directory.

import {mkdirSync, readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(readFileSync(join(here, 'prompts.json'), 'utf8'));

const FRAMING = `You are running a vibe test.

You have NO prior knowledge of the system under test. Do NOT use prior knowledge of any specific component library, product, or convention beyond React and TypeScript themselves.

## Reference

The reference below is your ONLY documentation. Use ONLY what is documented there. Do not invent props, components, or imports that it does not mention; if you need something it does not provide, say so and build it from plain React instead.

<reference>
__DOC__
</reference>
`;

const OUTPUT = `## Output

Reply with exactly two sections:

### Code

One complete TSX component in a single \`\`\`tsx fenced block.

### Notes

Plain prose, no scores: what you reached for first, where you hesitated, anything you wanted but could not find in the reference, and any workarounds you used. Do not grade yourself.
`;

const RECALL_TASK = `## Task

The reference says an option can carry a secondary action but deliberately does not name the prop or key. For EACH of the three scenarios below, write the MultiSelector callsite you would EXPECT to work, inventing the prop or key names and shapes that feel most natural given the rest of the reference. Use the same invented API in all three. Then explain why you chose that shape (a prop on the component vs. a key on the option data; a node vs. described data vs. a list) and what alternatives you rejected.
`;

mkdirSync(join(here, 'tasks'), {recursive: true});
const prompts = Object.fromEntries(spec.prompts.map(p => [p.id, p]));

for (const arm of spec.arms) {
  const doc = readFileSync(join(here, 'docs', `${arm}.md`), 'utf8').trimEnd();
  const head = FRAMING.replace('__DOC__', doc);
  if (arm === 'arm-recall') {
    for (const sample of ['s1', 's2', 's3']) {
      let body = RECALL_TASK;
      for (const id of spec.recall.scenarios) {
        body += `\n### Scenario (${id})\n\n${prompts[id].text}\n`;
      }
      writeFileSync(
        join(here, 'tasks', `${arm}--${sample}.md`),
        `${head}\n${body}\n${OUTPUT}`,
      );
    }
    continue;
  }
  for (const p of spec.prompts) {
    writeFileSync(
      join(here, 'tasks', `${arm}--${p.id}.md`),
      `${head}\n## Task\n\n${p.text}\n\n${OUTPUT}`,
    );
  }
}
