// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file disabled-cursor-audit.test.mjs
 * Covers the parts of the disabled-cursor gate that do not need a browser:
 * the story-scoping contract it shares with the a11y audit, the verdict it
 * draws from a set of sampled points, and the report it prints. The Chromium
 * sweep itself is exercised by the CI job that runs it against the real
 * Storybook build.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {describe, it, expect} from 'vitest';

const SCRIPTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const SCRIPT = path.join(SCRIPTS_DIR, 'disabled-cursor-audit.js');
const {selectStories, verdictFor, formatViolations, DISABLED_SELECTOR} =
  createRequire(import.meta.url)(SCRIPT);

const story = (id, title) => ({id, title, type: 'story'});
const sample = (relation, cursor) => ({relation, cursor});

describe('selectStories', () => {
  const entries = [
    story('core-button--default', 'Core/Button'),
    story('core-button--disabled', 'Core/Button'),
    story('core-button--docs', 'Core/Button'),
    story('lab-stepper--default', 'Lab/Stepper'),
    story('example-introduction--page', 'Example/Introduction'),
  ];

  it('audits every core and lab story when no components are named', () => {
    expect(selectStories(entries, []).map(e => e.id)).toEqual([
      'core-button--default',
      'core-button--disabled',
      'lab-stepper--default',
    ]);
  });

  it('scopes to the named components, case-insensitively', () => {
    expect(selectStories(entries, ['button']).map(e => e.id)).toEqual([
      'core-button--default',
      'core-button--disabled',
    ]);
  });

  it('skips docs entries', () => {
    expect(
      selectStories(entries, ['button']).some(e => e.id.endsWith('--docs')),
    ).toBe(false);
  });
});

describe('verdictFor', () => {
  it('passes a control that answers with the disabled cursor', () => {
    expect(verdictFor([sample('self', 'default')])).toEqual({
      status: 'ok',
      cursor: 'default',
    });
  });

  it('fails a disabled control that still promises a click', () => {
    expect(verdictFor([sample('self', 'pointer')])).toEqual({
      status: 'violation',
      cursor: 'pointer',
    });
  });

  it('fails on a child that declares its own cursor', () => {
    const verdict = verdictFor([
      sample('self', 'default'),
      sample('descendant', 'text'),
    ]);
    expect(verdict).toEqual({status: 'violation', cursor: 'text'});
  });

  it('counts a pointer-events:none subtree as unreachable, not a violation', () => {
    // The pointer lands on the ancestor, so whatever it shows — even the
    // right cursor — is the ancestor's doing, not the control's.
    expect(verdictFor([sample('ancestor', 'auto')])).toEqual({
      status: 'unreachable',
      cursor: 'auto',
    });
  });

  it('skips an element nothing can point at', () => {
    expect(
      verdictFor([sample('covered', 'pointer'), sample('none', null)]),
    ).toEqual({status: 'skipped', cursor: null});
  });

  it('lets one reachable point decide over an unreachable one', () => {
    expect(
      verdictFor([sample('ancestor', 'auto'), sample('self', 'pointer')]),
    ).toEqual({status: 'violation', cursor: 'pointer'});
  });
});

describe('DISABLED_SELECTOR', () => {
  it('covers the aria-disabled pattern as well as the native state', () => {
    expect(DISABLED_SELECTOR).toContain(':disabled');
    expect(DISABLED_SELECTOR).toContain('[aria-disabled="true"]');
  });
});

describe('formatViolations', () => {
  it('says so plainly when there is nothing to report', () => {
    expect(formatViolations([])).toContain('default');
  });

  it('groups by component and names the story and the cursor', () => {
    const output = formatViolations([
      {
        component: 'Core/Button',
        story: 'core-button--disabled',
        element: '<button.astryx-button>',
        cursor: 'pointer',
      },
    ]);
    expect(output).toContain('Core/Button (1)');
    expect(output).toContain('core-button--disabled');
    expect(output).toContain('cursor: pointer (expected default)');
  });
});

describe('CLI contract', () => {
  /** Run the audit in an empty temp cwd; returns {status, stdout}. */
  function runAudit(args) {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'disabled-cursor-'));
    try {
      const result = execFileSync(process.execPath, [SCRIPT, ...args], {
        cwd: dir,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
      return {status: 0, stdout: result};
    } catch (error) {
      return {
        status: error.status,
        stdout: (error.stdout || '') + (error.stderr || ''),
      };
    } finally {
      fs.rmSync(dir, {recursive: true, force: true});
    }
  }

  // Same contract as accessibility-audit.js so the two CI steps can share one
  // component list: an EMPTY --components means the PR touched no component,
  // and must pass without fanning out into a full sweep.
  it('passes and audits nothing when --components is empty', () => {
    const {status, stdout} = runAudit(['--components', '']);
    expect(status).toBe(0);
    expect(stdout).toContain('skipping');
  });

  it('fails loudly when the storybook build is missing', () => {
    const {status, stdout} = runAudit([
      '--storybook-dir',
      'nope',
      '--components',
      'Button',
    ]);
    expect(status).toBe(1);
    expect(stdout).toContain('Storybook build not found');
  });
});
