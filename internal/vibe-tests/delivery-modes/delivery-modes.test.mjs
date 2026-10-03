// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {afterEach, test} from 'node:test';
import {chromium} from 'playwright';
import {
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {
  captureAuthoredSources,
  measureAdoptionInDocument,
  scanAuthoredSource,
} from './evaluator.mjs';
import {
  auditAgentContext,
  countAstryxInvocations,
  countCliLookups,
  createPrivateRunRoot,
} from './process.mjs';
import {
  buildVanillaAgentDocs,
  reactNoBuildStarter,
  vanillaStarter,
} from './projects.mjs';
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

test('generated prompts never leak expected components or Path A coaching', () => {
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
    assert.doesNotMatch(task, /expectedComponents|Switch|Path A/);
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

test('React no-build starter externalizes React for core and theme and exercises hooks/icons', () => {
  const starter = reactNoBuildStarter('0.6.5');
  assert.match(
    starter,
    /@astryxdesign\/core@0\.6\.5\?external=react,react-dom/,
  );
  assert.match(
    starter,
    /@astryxdesign\/theme-neutral@0\.6\.5\/built\?external=react,react-dom/,
  );
  assert.match(starter, /React\.useState/);
  assert.match(starter, /A\.Banner/);
  assert.match(starter, /A\.TextInput/);
});

test('vanilla has a working starter and HTML-only agent documentation', () => {
  const spec = getDeliverySpecs().vanilla;
  const starter = vanillaStarter(spec);
  assert.match(starter, /<!doctype html>/i);
  assert.match(starter, /astryx-vanilla\.css/);
  assert.match(starter, /class="ax-card"/);

  const publicDocs = `# Astryx
## Path A — Build-less HTML
### A1. Page setup
Pinned ${spec.vanillaCdnRef}.
**Option 1 — install the preview CLI (Node 22.13+):**
\`\`\`sh
npm install -g https://cdn.jsdelivr.net/gh/facebook/astryx@894a494af1323add3d837c7a7c9e308943231d5a/packages/vanilla/dist/cli/astryx-cli-vanilla.tgz

astryx component --list --html
\`\`\`
**Fallback — clone the pinned source commit:**
\`\`\`sh
git clone https://github.com/facebook/astryx.git astryx
\`\`\`
**Option 2 — direct file URLs:**
### A4. Rules for Path A
- HTML only.
## Path B — React with a dev server
React instructions.`;
  const docs = buildVanillaAgentDocs(publicDocs, spec);
  assert.match(docs, /npx astryx component --list --html/);
  assert.doesNotMatch(docs, /Path A|Path B|git clone|npm install -g|React/);
});

test('adoption metric gives equivalent React and vanilla fixtures and raw HTML near zero', async () => {
  const browser = await chromium.launch({headless: true});
  try {
    const fixture = prefix => `
      <style>*{display:block;width:20px;height:20px}</style>
      <main class="${prefix}-stack">
        <article class="${prefix}-card">
          <h2 class="${prefix}-heading">Title</h2>
          <div class="${prefix}-text-input"><label>Name<input /></label></div>
          <button class="${prefix}-button">Save</button>
          <button class="${prefix}-stack">Raw nested action</button>
        </article>
        <dialog><button class="${prefix}-button">Hidden dialog action</button></dialog>
        <div aria-hidden="true"><button class="${prefix}-button">Hidden</button></div>
        <button id="inactive-tab" role="tab" aria-selected="false">Inactive tab</button>
        <div role="tabpanel" aria-labelledby="inactive-tab"><button class="${prefix}-button">Inactive panel action</button></div>
      </main>`;
    const raw = `
      <style>*{display:block;width:20px;height:20px}</style>
      <main><article><h2>Title</h2><label>Name<input /></label><button>Save</button></article></main>`;
    const scores = [];
    for (const html of [fixture('astryx'), fixture('ax'), raw]) {
      const page = await browser.newPage({viewport: {width: 800, height: 600}});
      await page.setContent(html);
      scores.push(await page.evaluate(measureAdoptionInDocument));
      await page.close();
    }
    assert.ok(
      Math.abs(scores[0].adoptionShare - scores[1].adoptionShare) <= 0.05,
    );
    assert.ok(scores[2].adoptionShare <= 0.05);
    assert.equal(
      scores[0].eligibleElementCount,
      scores[1].eligibleElementCount,
    );
    assert.equal(scores[0].eligibleElementCount, 6);
  } finally {
    await browser.close();
  }
});

test('source scanner scans only authored changes and ignores custom-property-only inline styles', async () => {
  const directory = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-source-'),
  );
  temporaryDirectories.push(directory);
  await fs.promises.writeFile(
    path.join(directory, 'index.html'),
    '<div style="color:#fff;margin:12px"></div>',
  );
  const baseline = await captureAuthoredSources(directory);
  await fs.promises.writeFile(
    path.join(directory, 'index.html'),
    '<div style="--brand: #fff; --gap: 12px"></div>',
  );
  await fs.promises.writeFile(
    path.join(directory, 'new.html'),
    '<div style="color:#fff;margin:12px"></div>',
  );
  const metrics = await scanAuthoredSource(directory, baseline);
  assert.deepEqual(metrics, {
    authoredFileCount: 2,
    inlineStyleAttributes: 1,
    customPropertyOnlyStyles: 1,
    rawHexValues: 1,
    rawPixelValues: 1,
    hardCodedStyleCount: 3,
  });
});

test('all supported Astryx CLI invocation forms are counted', () => {
  const commands = [
    'npx astryx component Button',
    'npx --yes @astryxdesign/cli@0.6.5 docs tokens',
    'npm exec astryx -- search form',
    'pnpm exec astryx template dashboard',
    '/tmp/project/node_modules/.bin/astryx component Card',
    'node packages/cli/clients/cli/bin/astryx.mjs docs',
    'astryx help',
  ];
  assert.equal(
    commands.reduce((sum, command) => sum + countAstryxInvocations(command), 0),
    commands.length,
  );
  const transcript = commands
    .map(command =>
      JSON.stringify({
        type: 'assistant',
        message: {content: [{type: 'tool_use', input: {command}}]},
      }),
    )
    .join('\n');
  assert.equal(countCliLookups(transcript), commands.length);
});

test('context audit rejects external Claude context and accepts bare init', () => {
  const clean = JSON.stringify({
    type: 'system',
    subtype: 'init',
    cwd: '/mnt/run/project',
    tools: ['Bash', 'Read', 'Write', 'Edit'],
    mcp_servers: [],
    plugins: [
      {
        name: 'cc-plugin-agents-md',
        source: 'cc-plugin-agents-md@builtin',
      },
    ],
  });
  assert.equal(auditAgentContext('claude', clean, '').passed, true);
  const contaminated = JSON.stringify({
    type: 'system',
    subtype: 'init',
    mcp_servers: [{name: 'meta'}],
    plugins: [{name: 'forbidden-external', source: 'remote-registry'}],
  });
  assert.equal(auditAgentContext('claude', contaminated, '').passed, false);

  const muse = auditAgentContext(
    'muse',
    JSON.stringify({
      payload_type: 'task.lifecycle.proposed',
      payload: {event: {task_kind: 'reminder.agent.skill-reminder'}},
    }),
    'muse: gate plugins: off (MUSE_EXPERIMENTAL_PLUGINS)',
  );
  assert.equal(muse.passed, true);
  assert.equal(muse.builtInReminderEvents, 1);
});

test('private run roots use mode 0700', async () => {
  const privateRun = await createPrivateRunRoot('test-');
  temporaryDirectories.push(privateRun.root);
  assert.equal((await fs.promises.stat(privateRun.root)).mode & 0o777, 0o700);
  assert.equal(
    (await fs.promises.stat(privateRun.projectDir)).mode & 0o777,
    0o700,
  );
});

test('summary includes failure zeros in medians and reports sample counts', () => {
  const results = [
    makeResult({passed: true, value: 80}),
    makeResult({passed: false, value: 0, timedOut: true}),
  ];
  const [row] = summarize(results);
  assert.equal(row.passRate, 0.5);
  assert.equal(row.timeouts, 1);
  assert.equal(row.medianAdoptionShare, 0.4);
  assert.equal(row.medianPromptFulfillment, 40);
  assert.equal(row.medianVisualQuality, 40);
  assert.equal(row.samples.adoption, 2);
  assert.equal(row.samples.prompt, 2);
  assert.equal(row.samples.axe, 1);
});

function makeResult({passed, value, timedOut = false}) {
  return {
    config: 'vanilla',
    agent: 'muse',
    runner: {
      durationMs: value * 1000,
      usage: {inputTokens: value, outputTokens: 0},
      cliLookups: 0,
      timedOut,
      contextAudit: {passed: true},
    },
    evaluation: {
      build: {passed},
      render: {passed, adoptionShare: value / 100},
      source: {hardCodedStyleCount: value},
      accessibility: {violationCount: passed ? 0 : null},
      judge: {promptFulfillment: value, visualQuality: value},
      typecheck: null,
    },
  };
}
