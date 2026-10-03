// Copyright (c) Meta Platforms, Inc. and affiliates.

import assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, test} from 'node:test';
import {chromium} from 'playwright';
import {
  buildTaskPrompt,
  getDeliverySpecs,
  selectPrompts,
} from './constants.mjs';
import {
  captureAuthoredSources,
  evaluateRun,
  measureAdoptionInDocument,
  scanAuthoredSource,
} from './evaluator.mjs';
import {
  auditAgentContext,
  auditTranscriptCommands,
  countAstryxInvocations,
  countCliLookups,
  createPrivateRunRoot,
} from './process.mjs';
import {
  buildVanillaAgentDocs,
  prepareProject,
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
    buildTaskPrompt(prompt, spec, '<project-dir>', {timeoutMinutes: 15}),
  );
  for (const task of generated) {
    assert.doesNotMatch(task, /expectedComponents|Switch|Path A/);
    assert.match(task, /Build a settings card\./);
    assert.match(task, /use only the documentation and tools installed there/);
    assert.match(task, /You have up to 15 minutes/);
    assert.match(task, /screenshot <file-or-url> \[output\.png\]/);
  }
  assert.equal(
    new Set(
      generated.map(
        task =>
          task.match(/Time and browser:\n([\s\S]*?)\n\nFirst inspect/)?.[1],
      ),
    ).size,
    1,
  );
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

test('seeded stratified sampling is stable and covers every category first', () => {
  const testSet = {
    prompts: [
      {id: 'a1', category: 'a'},
      {id: 'a2', category: 'a'},
      {id: 'b1', category: 'b'},
      {id: 'b2', category: 'b'},
      {id: 'c1', category: 'c'},
      {id: 'c2', category: 'c'},
    ],
  };
  const first = selectPrompts(testSet, {sample: 4, seed: 'fixed-seed'});
  const second = selectPrompts(testSet, {sample: 4, seed: 'fixed-seed'});
  assert.deepEqual(first, second);
  assert.equal(
    new Set(first.slice(0, 3).map(prompt => prompt.category)).size,
    3,
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
  assert.match(starter, /onChange=\$\{setValue\}/);
  assert.doesNotMatch(starter, /event\.target\.value/);
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

test('real React-build and Vanilla markup fixtures score within five points', async () => {
  const root = await fs.promises.mkdtemp(
    path.join(os.tmpdir(), 'delivery-real-fixtures-'),
  );
  temporaryDirectories.push(root);
  const reactDir = path.join(root, 'react');
  const vanillaDir = path.join(root, 'vanilla');
  const screenshotDir = path.join(root, 'screenshots');
  const specs = getDeliverySpecs();

  await prepareProject(specs['react-build'], reactDir);
  await fs.promises.writeFile(
    path.join(reactDir, 'src', 'App.tsx'),
    `import {useState} from 'react';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Heading} from '@astryxdesign/core/Heading';
import {Layout, LayoutContent} from '@astryxdesign/core/Layout';
import {TextInput} from '@astryxdesign/core/TextInput';
import {TopNav, TopNavItem} from '@astryxdesign/core/TopNav';

export function App() {
  const [value, setValue] = useState('');
  return <>
    <TopNav heading="Astryx" startContent={<><TopNavItem label="Overview" href="#overview" isSelected /><TopNavItem label="Projects" href="#projects" /></>} />
    <Banner status="warning" title="Trial ending" description="Choose a plan." endContent={<Button label="Upgrade" />} />
    <Layout content={<LayoutContent>
      <Card><Heading level={2}>Workspace</Heading><TextInput label="Name" value={value} onChange={setValue} /></Card>
      <button>Raw layout action</button>
    </LayoutContent>} />
  </>;
}
`,
  );

  await fs.promises.mkdir(vanillaDir, {recursive: true});
  const markupRoot = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../../packages/vanilla/markup',
  );
  const fragments = await Promise.all([
    readMarkupVariant(markupRoot, 'TopNav.html', 'default'),
    readMarkupVariant(markupRoot, 'Banner.html', 'informational-card'),
    readMarkupVariant(markupRoot, 'Card.html', 'default'),
    readMarkupVariant(markupRoot, 'TextInput.html', 'default'),
    readMarkupVariant(markupRoot, 'Layout.html', 'page-shell'),
  ]);
  fragments[4] = fragments[4].replace(
    '</main>',
    '<button>Raw layout action</button></main>',
  );
  const vanillaHtml = vanillaStarter(specs.vanilla).replace(
    /<body>[\s\S]*<\/body>/,
    `<body>${fragments.join('\n')}</body>`,
  );
  await fs.promises.writeFile(path.join(vanillaDir, 'index.html'), vanillaHtml);

  const [react, vanilla] = await Promise.all([
    evaluateRun({
      config: 'react-build',
      projectDir: reactDir,
      prompt: {prompt: 'Render equivalent fixture.'},
      screenshotPath: path.join(screenshotDir, 'react.png'),
      baselineSources: {},
      skipJudge: true,
    }),
    evaluateRun({
      config: 'vanilla',
      projectDir: vanillaDir,
      prompt: {prompt: 'Render equivalent fixture.'},
      screenshotPath: path.join(screenshotDir, 'vanilla.png'),
      baselineSources: {},
      skipJudge: true,
    }),
  ]);

  assert.equal(react.render.passed, true, JSON.stringify(react.render));
  assert.equal(vanilla.render.passed, true, JSON.stringify(vanilla.render));
  assert.ok(
    Math.abs(react.render.adoptionShare - vanilla.render.adoptionShare) <= 0.05,
    `react=${react.render.adoptionShare}, vanilla=${vanilla.render.adoptionShare}`,
  );
  for (const evaluation of [react, vanilla]) {
    const raw = evaluation.render.adoptionTargets.find(
      target => target.text === 'Raw layout action',
    );
    assert.equal(raw?.adopted, false, JSON.stringify(raw));
  }
  assert.equal(react.typecheck.errorCount, 0, react.typecheck.stderr);
});

async function readMarkupVariant(root, file, variant) {
  const source = await fs.promises.readFile(path.join(root, file), 'utf8');
  const startMarker = `<!-- variant: ${variant} -->`;
  const start = source.indexOf(startMarker);
  assert.notEqual(start, -1, `${file} has ${variant}`);
  const bodyStart = start + startMarker.length;
  const next = source.indexOf('<!-- variant:', bodyStart);
  return source.slice(bodyStart, next < 0 ? source.length : next).trim();
}

test('source scanner separates comments and theme definitions from hard-coded values', async () => {
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
    `<!-- ignored #abc 999px -->
<div style="--brand: #fff; --gap: 12px"></div>
<style>:root[data-astryx-theme="brand"] { --color-accent: #123456; --space: 8px; }</style>`,
  );
  await fs.promises.writeFile(
    path.join(directory, 'new.html'),
    '<div style="color:#fff;margin:12px"></div><!-- #000 400px -->',
  );
  await fs.promises.writeFile(
    path.join(directory, 'new.ts'),
    `// ignored #abc 900px
/* ignored #fff 600px */
const theme = createTheme({accent: '#ff0000'});`,
  );
  const metrics = await scanAuthoredSource(directory, baseline);
  assert.deepEqual(metrics, {
    authoredFileCount: 3,
    inlineStyleAttributes: 1,
    customPropertyOnlyStyles: 1,
    themeDefinitionCount: 5,
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
    'for x in Button; do npx astryx component "$x"; done',
    'value=$(npx astryx docs tokens)',
    '(npx astryx template dashboard)',
    'timeout 10 npx astryx search form',
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

test('transcript audit flags every sensitive host-path command', () => {
  const transcript = [
    'cat index.html',
    'sed s/data-theme="light"/data-theme="dark"/ index.html',
    'cat /proc/1/root/secret',
    '/usr/local/bin/scsc ls',
    'ls /var/facebook/credentials',
    'ls /data/users',
  ]
    .map(command =>
      JSON.stringify({
        type: 'assistant',
        message: {content: [{type: 'tool_use', input: {command}}]},
      }),
    )
    .join('\n');
  const audit = auditTranscriptCommands(transcript);
  assert.equal(audit.passed, false);
  assert.equal(audit.flaggedCommandCount, 4);
  assert.deepEqual(audit.touchedPaths, [
    '/data',
    '/proc',
    '/usr/local/bin',
    '/var/facebook',
  ]);
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
  assert.equal(
    (await fs.promises.stat(path.join(privateRun.root, 'bin', 'screenshot')))
      .mode & 0o777,
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
  assert.equal(row.transcriptFlaggedRuns, 0);
  assert.equal(row.medianAdoptionShare, 0.4);
  assert.equal(row.medianPromptFulfillment, 40);
  assert.equal(row.medianVisualQuality, 40);
  assert.equal(row.samples.adoption, 2);
  assert.equal(row.samples.prompt, 2);
  assert.equal(row.samples.axe, 1);
  assert.equal(row.medianThemeDefinitions, 20);
  assert.equal(row.medianBestBeforeTimeoutPrompt, 70);
  assert.equal(row.medianBestBeforeTimeoutVisual, 75);
  assert.equal(row.samples.bestBeforeTimeoutPrompt, 1);
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
      transcriptAudit: {passed: true},
    },
    evaluation: {
      build: {passed},
      render: {passed, adoptionShare: value / 100},
      source: {
        hardCodedStyleCount: value,
        themeDefinitionCount: value / 2,
      },
      accessibility: {violationCount: passed ? 0 : null},
      judge: {promptFulfillment: value, visualQuality: value},
      bestBeforeTimeout: timedOut
        ? {promptFulfillment: 70, visualQuality: 75}
        : undefined,
      typecheck: null,
    },
  };
}
