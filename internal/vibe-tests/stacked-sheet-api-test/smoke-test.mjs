#!/usr/bin/env node
// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file smoke-test.mjs
 * @input Experiment conditions, prompts, rubric, and variant contract drafts
 * @output Exits nonzero when the preregistered comparison invariants drift
 * @position No-model validation for the stacked-sheet API vibe-test design
 */

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {stdout} from 'node:process';

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = name =>
  JSON.parse(fs.readFileSync(path.join(here, name), 'utf8'));
const readText = name => fs.readFileSync(path.join(here, name), 'utf8');

const conditions = readJson('conditions.json');
const prompts = readJson('prompts.json');
const rubric = readJson('rubric.json');

assert.equal(conditions.conditions.length, 4, 'exactly four API conditions');
assert.equal(
  new Set(conditions.conditions.map(condition => condition.id)).size,
  conditions.conditions.length,
  'condition IDs are unique',
);
assert.equal(
  conditions.conditions.filter(condition => condition.role === 'reference')
    .length,
  1,
  'exactly one preregistered reference condition',
);

const requiredHeadings = [
  '## Import',
  '## Basic usage',
  '## State and ordering',
  '## Dismissal',
  '## Focus',
  '## Modality and scrim',
  '## Deep links and multiple stacks',
  '## Rules',
];
const expectedProbes = [...conditions.coreCapabilities].sort();
const docWordCounts = [];
for (const condition of conditions.conditions) {
  const fullPath = path.join(here, condition.variantDoc);
  assert.ok(fs.existsSync(fullPath), `${condition.id} variant doc exists`);
  const doc = fs.readFileSync(fullPath, 'utf8');
  for (const heading of requiredHeadings) {
    assert.ok(doc.includes(heading), `${condition.id} contains ${heading}`);
  }
  const marker = doc.match(/<!-- CORE_PROBES: ([^>]+) -->/);
  assert.ok(marker, `${condition.id} declares the shared core probe checklist`);
  assert.deepEqual(
    marker[1]
      .split(',')
      .map(value => value.trim())
      .sort(),
    expectedProbes,
    `${condition.id} covers the same core probes`,
  );
  assert.ok(
    !doc.toLowerCase().includes('recommended candidate'),
    `${condition.id} docs do not label a preferred answer`,
  );
  docWordCounts.push(doc.trim().split(/\s+/).length);
}
const shortestDoc = Math.min(...docWordCounts);
const longestDoc = Math.max(...docWordCounts);
assert.ok(
  longestDoc / shortestDoc <= 1.2,
  `variant docs stay within a 20% length band (${docWordCounts.join(', ')})`,
);

assert.equal(prompts.prompts.length, 8, 'eight preregistered product prompts');
assert.equal(
  new Set(prompts.prompts.map(prompt => prompt.id)).size,
  prompts.prompts.length,
  'prompt IDs are unique',
);
assert.equal(
  prompts.prompts.filter(prompt => prompt.track === 'core').length,
  6,
  'six core prompts',
);
assert.equal(
  prompts.prompts.filter(prompt => prompt.track === 'policy').length,
  2,
  'two separately reported policy prompts',
);
assert.ok(
  prompts.prompts.filter(prompt => prompt.holdout).length >= 2,
  'at least two confirmation holdouts',
);

const bannedPromptTerms = [
  'BottomSheet',
  'SheetStack',
  'openSheetIds',
  'onOpenSheetIdsChange',
  'hasStackRecede',
  'forStack',
  'finalFocusRef',
  'hasScrim',
  'stackingAnimation',
  'sheetId',
  'onOpenChange',
  'isOpen',
];
for (const prompt of prompts.prompts) {
  assert.ok(
    ['core', 'policy'].includes(prompt.track),
    `${prompt.id} has a track`,
  );
  assert.ok(prompt.prompt.trim().length > 0, `${prompt.id} has task text`);
  assert.ok(
    Array.isArray(prompt.expectedBehavior) &&
      prompt.expectedBehavior.length >= 4,
    `${prompt.id} has evaluation-only behavioral assertions`,
  );
  assert.ok(
    Array.isArray(prompt.driver) && prompt.driver.length >= 3,
    `${prompt.id} has an evaluation-only driver`,
  );
  const agentText = `${prompt.prompt}\n${prompt.followUp ?? ''}`;
  for (const term of bannedPromptTerms) {
    assert.ok(
      !agentText.includes(term),
      `${prompt.id} does not leak candidate identifier ${term}`,
    );
  }
}

const promptById = new Map(prompts.prompts.map(prompt => [prompt.id, prompt]));
for (const id of prompts.pilotDefault) {
  assert.ok(promptById.has(id), `pilot prompt ${id} exists`);
  assert.ok(
    !promptById.get(id).holdout,
    `pilot does not consume holdout ${id}`,
  );
}

assert.equal(rubric.conditionBlind, true, 'evaluator is condition-blind');
assert.deepEqual(
  [...rubric.tracksReportedSeparately].sort(),
  ['core', 'policy'],
  'core and policy tracks remain separate',
);
assert.ok(
  rubric.qualificationGates.length >= 3,
  'rubric has compile, runtime, and component-family gates',
);
const rubricText = JSON.stringify(rubric);
for (const condition of conditions.conditions) {
  assert.ok(
    !rubricText.includes(condition.id),
    `rubric does not branch on ${condition.id}`,
  );
}

// The plan is also part of the deliverable; catch an accidentally missing file.
assert.ok(readText('PLAN.md').includes('## 10. Analysis and decision rule'));

stdout.write('stacked-sheet API vibe-test design is internally consistent\n');
stdout.write(`variant doc words: ${docWordCounts.join(', ')}\n`);
stdout.write(
  `prompts: ${prompts.prompts.length} (${prompts.pilotDefault.length} pilot)\n`,
);
