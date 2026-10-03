// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, test} from 'node:test';
import {
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {scanAuthoredSource} from './evaluator.mjs';
import {summarize} from './report.mjs';

const temporaryDirectories = [];
afterEach(async () => {
  await Promise.all(
    temporaryDirectories
      .splice(0)
      .map(directory =>
        fs.promises.rm(directory, {recursive: true, force: true}),
      ),
  );
});

test('generated prompts never leak expected components', () => {
  const specs = getDeliverySpecs();
  const prompt = {
    id: 'x-1',
    prompt: 'Build a settings card.',
    expectedComponents: ['Card', 'Switch'],
  };
  const generated = Object.values(specs).map(spec =>
    buildTaskPrompt(prompt, spec, '<project-dir>'),
  );
  for (const task of generated) {
    assert.doesNotMatch(task, /expectedComponents|Switch/);
    assert.match(task, /Build a settings card\./);
    assert.match(task, /use only the documentation and tools installed there/);
  }
});

test('stratified sampling chooses distinct categories first', () => {
  const testSet = {
    prompts: [
      {id: 'a1', category: 'a'},
      {id: 'a2', category: 'a'},
      {id: 'b1', category: 'b'},
      {id: 'c1', category: 'c'},
    ],
  };
  assert.deepEqual(
    selectPrompts(testSet, {sample: 3}).map(prompt => prompt.id),
    ['a1', 'b1', 'c1'],
  );
});

test('source scanner applies the same hard-coded style rules', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-source-'),
  );
  temporaryDirectories.push(directory);
  await fs.promises.writeFile(
    path.join(directory, 'index.html'),
    '<div style="color:#fff;margin:12px"></div>',
  );
  const metrics = await scanAuthoredSource(directory);
  assert.deepEqual(metrics, {
    authoredFileCount: 1,
    inlineStyleAttributes: 1,
    rawHexValues: 1,
    rawPixelValues: 1,
    hardCodedStyleCount: 3,
  });
});

test('summary groups config and agent with medians', () => {
  const results = [10, 30].map((value, index) => ({
    config: 'vanilla',
    agent: 'muse',
    runner: {
      durationMs: value * 1000,
      usage: {inputTokens: value, outputTokens: 0},
      cliLookups: index,
    },
    evaluation: {
      render: {passed: true, adoptionShare: value / 100},
      source: {hardCodedStyleCount: value},
      accessibility: {violationCount: index},
      judge: {promptFulfillment: value, visualQuality: value},
    },
  }));
  const [row] = summarize(results);
  assert.equal(row.passRate, 1);
  assert.equal(row.medianWallTimeMs, 20_000);
  assert.equal(row.medianAdoptionShare, 0.2);
  assert.equal(row.medianVisualQuality, 20);
});
