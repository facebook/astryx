// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file CLI-level accessibility audit readiness fixtures.
 * Runs the real command, routing, server lifecycle, and report path with only
 * the browser transport replaced by a deterministic page implementation.
 */

import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(SCRIPTS_DIR, '../..');
const SCRIPT = path.join(SCRIPTS_DIR, 'accessibility-audit.js');
let nextPort = 40000 + (process.pid % 10000);

const BROWSER_MOCK = String.raw`
const Module = require('node:module');
const originalLoad = Module._load;
let requestedUrl = '';
let reads = 0;

function scenarioState() {
  const scenario = process.env.A11Y_TEST_SCENARIO;
  reads += 1;
  if (scenario === 'redirect') {
    return {url: 'chrome-error://chromewebdata/', classes: [], content: false};
  }
  if (scenario === 'error') {
    return {url: requestedUrl, classes: ['sb-show-errordisplay'], content: false};
  }
  if (scenario === 'empty') {
    return {url: requestedUrl, classes: ['sb-show-main'], content: false};
  }
  return {
    url: requestedUrl,
    classes: ['sb-show-main'],
    content: reads >= 3,
  };
}

function evaluateInFixture(fn, arg) {
  const state = scenarioState();
  const previousWindow = global.window;
  const previousDocument = global.document;
  global.window = {location: {href: state.url}};
  global.document = {
    body: {classList: {contains: name => state.classes.includes(name)}},
    querySelector: selector =>
      selector === '#storybook-root'
        ? {childElementCount: state.content ? 1 : 0, textContent: ''}
        : null,
  };
  try {
    return fn(arg);
  } finally {
    global.window = previousWindow;
    global.document = previousDocument;
  }
}

const page = {
  goto: async url => { requestedUrl = url; },
  addStyleTag: async () => {},
  evaluate: async (fn, arg) => evaluateInFixture(fn, arg),
  close: async () => {},
};
const context = {newPage: async () => page, close: async () => {}};
const browser = {newContext: async () => context, close: async () => {}};

class FakeAxeBuilder {
  disableRules() { return this; }
  async analyze() { return {violations: []}; }
}

Module._load = function(request, parent, isMain) {
  if (request === 'playwright') {
    return {chromium: {launch: async () => browser}};
  }
  if (request === '@axe-core/playwright') {
    return {AxeBuilder: FakeAxeBuilder};
  }
  return originalLoad.call(this, request, parent, isMain);
};
`;

function runFixture(scenario, indexContent, components = 'core/Button') {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'a11y-cli-fixture-'));
  const storybook = path.join(dir, 'storybook');
  const output = path.join(dir, 'report.json');
  const mock = path.join(dir, 'browser-mock.cjs');
  fs.mkdirSync(storybook, {recursive: true});
  fs.writeFileSync(path.join(storybook, 'index.json'), indexContent);
  fs.writeFileSync(path.join(storybook, 'iframe.html'), '<!doctype html>');
  fs.writeFileSync(mock, BROWSER_MOCK);
  const port = nextPort++;
  try {
    const result = spawnSync(
      process.execPath,
      [
        SCRIPT,
        '--storybook-dir',
        storybook,
        '--output',
        output,
        '--components',
        components,
        '--port',
        String(port),
      ],
      {
        cwd: REPO_ROOT,
        encoding: 'utf8',
        env: {
          ...process.env,
          A11Y_TEST_SCENARIO: scenario,
          NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --require=${mock}`.trim(),
        },
      },
    );
    return {
      ...result,
      report: fs.existsSync(output)
        ? JSON.parse(fs.readFileSync(output, 'utf8'))
        : null,
    };
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}

const VALID_INDEX = JSON.stringify({
  entries: {
    'core-button--fixture': {
      id: 'core-button--fixture',
      title: 'Core/Button',
      name: 'Fixture',
      type: 'story',
    },
  },
});

const PATTERN_INDEX = JSON.stringify({
  entries: {
    'a11y-button-pattern--clickable-card-disabled': {
      id: 'a11y-button-pattern--clickable-card-disabled',
      title: 'a11y/Button pattern',
      name: 'Clickable Card Disabled',
      type: 'story',
    },
  },
});

describe.sequential('accessibility-audit CLI readiness', () => {
  it('waits through a delayed valid Storybook root and writes audited evidence', () => {
    const result = runFixture('delayed', VALID_INDEX);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain('✓ Audited: Button / Fixture');
    expect(result.report.auditedStoryKeys).toHaveLength(1);
  });

  it('routes a11y contract fixtures to canonical owners and legacy aliases', () => {
    const result = runFixture(
      'delayed',
      PATTERN_INDEX,
      'core/ClickableCard',
    );
    expect(result.status).toBe(0);
    expect(result.report.ownerStoryRoutes).toEqual({
      'core/ClickableCard': [
        'a11y-button-pattern--clickable-card-disabled',
      ],
    });
    expect(result.report.legacyBaselineAliases).toEqual({
      'ClickableCard::Disabled': [
        'core/ClickableCard::a11y-button-pattern--clickable-card-disabled',
      ],
    });
  });

  it('fails a redirect without writing a report', () => {
    const result = runFixture('redirect', VALID_INDEX);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain(
      'story navigation ended at chrome-error://chromewebdata/',
    );
    expect(result.report).toBeNull();
  });

  it('fails a Storybook render-error state without writing a report', () => {
    const result = runFixture('error', VALID_INDEX);
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Storybook reported a story render error');
    expect(result.report).toBeNull();
  });

  it(
    'fails an attached but empty Storybook root without writing a report',
    () => {
      const result = runFixture('empty', VALID_INDEX);
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain(
        'Storybook root did not render story content before timeout',
      );
      expect(result.report).toBeNull();
    },
    10000,
  );

  it('fails an invalid index before browser readiness or routing', () => {
    const result = runFixture('delayed', '{invalid json');
    expect(result.status).not.toBe(0);
    expect(result.stderr).toContain('Could not read Storybook index');
    expect(result.stderr).not.toContain('No owned Storybook stories resolved');
    expect(result.report).toBeNull();
  });
});
