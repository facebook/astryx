// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {afterEach, describe, expect, it} from 'vitest';

import {
  aggregateVerdict,
  buildCommitStatus,
  stageVisualResult,
  summarizeForcedColors,
} from './main-quality-report.mjs';

const ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../..',
);
const SCRIPT = path.join(ROOT, '.github', 'scripts', 'main-quality-report.mjs');
const roots = [];

afterEach(() => {
  for (const root of roots.splice(0))
    fs.rmSync(root, {recursive: true, force: true});
});

function tempRoot() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'main-quality-report-'));
  roots.push(root);
  return root;
}

function writeJSON(file, value) {
  fs.mkdirSync(path.dirname(file), {recursive: true});
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function completeA11y(overrides = {}) {
  return {
    summary: {
      scope: 'full',
      indexStatus: 'parsed',
      totalViolations: 0,
      componentsAudited: 1,
      expectedStories: 1,
      auditedStories: 1,
      failedStories: 0,
      resultStories: 1,
      uniqueResultStories: 1,
      scanStatus: 'complete',
      ...overrides.summary,
    },
    components: {
      Button: {
        storiesAudited: 1,
        violations: [],
        storyDetails: [
          {id: 'core-button--default', story: 'Default', violations: []},
        ],
      },
      ...overrides.components,
    },
  };
}

function composeWithA11y(a11yReport) {
  const root = tempRoot();
  writeJSON(path.join(root, 'visual.json'), {
    status: 'pass',
    counts: {total: 1},
  });
  writeJSON(path.join(root, 'a11y.json'), a11yReport);
  writeJSON(path.join(root, 'rtl.json'), {
    autoDiscovery: {results: []},
    positionalMirror: {results: []},
    curated: {results: []},
  });
  writeJSON(path.join(root, 'forced.json'), {
    numPassedTests: 8,
    numFailedTests: 0,
  });
  const out = path.join(root, 'out');
  execFileSync(
    process.execPath,
    [
      SCRIPT,
      'compose',
      '--out-dir',
      out,
      '--sha',
      'b'.repeat(40),
      '--run-id',
      '124',
      '--run-url',
      'https://github.com/facebook/astryx/actions/runs/124',
      '--report-url',
      'https://facebook.github.io/astryx/main-quality/b/124/',
      '--shadow-mode',
      'true',
      '--visual-verdict',
      path.join(root, 'visual.json'),
      '--a11y-report',
      path.join(root, 'a11y.json'),
      '--a11y-status',
      'clean',
      '--rtl-report',
      path.join(root, 'rtl.json'),
      '--forced-colors-report',
      path.join(root, 'forced.json'),
    ],
    {encoding: 'utf8'},
  );
  return JSON.parse(
    fs.readFileSync(path.join(out, 'main-quality.json'), 'utf8'),
  );
}

function baseReport(overrides = {}) {
  return {
    runUrl: 'https://github.com/facebook/astryx/actions/runs/1',
    reportUrl: 'https://facebook.github.io/astryx/main-quality/abc/1/',
    shadowMode: true,
    suites: {
      visual: {status: 'changed', details: '2 changed'},
      accessibility: {status: 'violations', details: '108 violations'},
      rtl: {status: 'clean', details: '0 findings'},
      forcedColors: {status: 'clean', details: '8 passed'},
    },
    aggregate: {verdict: 'debt'},
    ...overrides,
  };
}

describe('main quality report', () => {
  it('keeps suite debt green only in shadow mode', () => {
    expect(buildCommitStatus(baseReport()).state).toBe('success');
    expect(buildCommitStatus(baseReport({shadowMode: false})).state).toBe(
      'failure',
    );
  });

  it('lets publication health fail independently of suite verdicts', () => {
    const status = buildCommitStatus(baseReport(), {
      publicationState: 'failed',
    });
    expect(status.state).toBe('failure');
    expect(status.description).toContain('publication failed');
    expect(status.target_url).toBe(baseReport().runUrl);
  });

  it('aggregates clean, debt, and crashed suite verdicts', () => {
    expect(
      aggregateVerdict({
        visual: {status: 'pass'},
        accessibility: {status: 'clean'},
      }),
    ).toBe('clean');
    expect(
      aggregateVerdict({
        visual: {status: 'changed'},
        accessibility: {status: 'clean'},
      }),
    ).toBe('debt');
    expect(
      aggregateVerdict({
        visual: {status: 'crashed'},
        accessibility: {status: 'clean'},
      }),
    ).toBe('crashed');
  });

  it('counts only matching forced-colors tests from Vitest JSON', () => {
    const summary = summarizeForcedColors(
      {numPassedTests: 8, numFailedTests: 0, numTotalTests: 200},
      'success',
    );
    expect(summary).toMatchObject({
      status: 'clean',
      passed: 8,
      failed: 0,
      total: 8,
    });
  });

  it('fails closed when an a11y report is missing completeness', () => {
    const report = composeWithA11y({
      summary: {totalViolations: 0, componentsAudited: 1},
      components: {
        Button: {storyDetails: [{story: 'Default', error: 'timeout'}]},
      },
    });
    expect(report.suites.accessibility.status).toBe('crashed');
    expect(report.aggregate.verdict).toBe('crashed');
  });

  it('fails closed when a11y reports duplicate story results', () => {
    const report = composeWithA11y(
      completeA11y({
        summary: {
          expectedStories: 2,
          auditedStories: 2,
          resultStories: 2,
          uniqueResultStories: 1,
        },
        components: {
          Button: {
            storiesAudited: 2,
            violations: [],
            storyDetails: [
              {id: 'core-button--default', story: 'Default', violations: []},
              {
                id: 'core-button--default',
                story: 'Default again',
                violations: [],
              },
            ],
          },
        },
      }),
    );
    expect(report.suites.accessibility.status).toBe('crashed');
  });

  it('fails closed when a11y summary totals disagree with story details', () => {
    const report = composeWithA11y(
      completeA11y({
        summary: {
          expectedStories: 2,
          auditedStories: 2,
          resultStories: 2,
          uniqueResultStories: 2,
        },
      }),
    );
    expect(report.suites.accessibility.status).toBe('crashed');
  });

  it('accepts a complete zero-violation a11y report as clean', () => {
    const report = composeWithA11y(completeA11y());
    expect(report.suites.accessibility.status).toBe('clean');
  });

  it('stages visual capture and report without hidden artifact paths', () => {
    const root = tempRoot();
    const source = path.join(root, '.visual-run');
    writeJSON(path.join(source, 'verdict.json'), {status: 'changed'});
    writeJSON(path.join(source, 'manifest.json'), {shots: {one: {}}});
    fs.mkdirSync(path.join(source, 'shots'), {recursive: true});
    fs.writeFileSync(path.join(source, 'shots', 'one.png'), 'png');
    fs.mkdirSync(path.join(source, 'report', 'diff'), {recursive: true});
    fs.writeFileSync(
      path.join(source, 'report', 'index.html'),
      '<p>report</p>',
    );
    fs.writeFileSync(path.join(source, 'report', 'diff', 'one.png'), 'diff');
    fs.writeFileSync(path.join(root, 'visual-summary.md'), 'summary');

    const out = path.join(root, 'visual-result');
    stageVisualResult({
      sourceDir: source,
      outDir: out,
      summaryFile: path.join(root, 'visual-summary.md'),
    });

    expect(fs.existsSync(path.join(out, 'verdict.json'))).toBe(true);
    expect(fs.existsSync(path.join(out, 'capture', 'shots', 'one.png'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(out, 'capture', 'manifest.json'))).toBe(
      true,
    );
    expect(fs.existsSync(path.join(out, 'report', 'diff', 'one.png'))).toBe(
      true,
    );
    expect(fs.readFileSync(path.join(out, 'summary.md'), 'utf8')).toBe(
      'summary',
    );
  });

  it('composes a self-contained report with rollout dependency text', () => {
    const root = tempRoot();
    writeJSON(path.join(root, 'visual.json'), {
      status: 'changed',
      counts: {total: 4, changed: 1, added: 0, removed: 0, failed: 0},
    });
    writeJSON(
      path.join(root, 'a11y.json'),
      completeA11y({summary: {totalViolations: 108}}),
    );
    writeJSON(path.join(root, 'rtl.json'), {
      autoDiscovery: {total: 2, results: []},
      positionalMirror: {total: 3, results: []},
      curated: {results: []},
    });
    writeJSON(path.join(root, 'forced.json'), {
      numPassedTests: 8,
      numFailedTests: 0,
    });
    const out = path.join(root, 'out');
    execFileSync(
      process.execPath,
      [
        SCRIPT,
        'compose',
        '--out-dir',
        out,
        '--sha',
        'a'.repeat(40),
        '--run-id',
        '123',
        '--run-url',
        'https://github.com/facebook/astryx/actions/runs/123',
        '--report-url',
        'https://facebook.github.io/astryx/main-quality/a/123/',
        '--shadow-mode',
        'true',
        '--visual-verdict',
        path.join(root, 'visual.json'),
        '--a11y-report',
        path.join(root, 'a11y.json'),
        '--rtl-report',
        path.join(root, 'rtl.json'),
        '--forced-colors-report',
        path.join(root, 'forced.json'),
      ],
      {encoding: 'utf8'},
    );

    const report = JSON.parse(
      fs.readFileSync(path.join(out, 'main-quality.json'), 'utf8'),
    );
    expect(report.aggregate.verdict).toBe('debt');
    expect(report.rollout.criteria).toContain('one clean run');
    expect(report.rollout.dependency).toContain('#5608');
    expect(fs.readFileSync(path.join(out, 'index.html'), 'utf8')).toContain(
      'Protected main quality',
    );
  });
});
