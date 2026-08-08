// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Tests for the app-shell notice — the line the CLI prints to say which
 * shell wrapped a template, or how to ask for one.
 *
 * This is an ATTRIBUTION surface: it tells the user whether they got their
 * integration's chrome or core's default. The shell's `package` and
 * `description` come from a third-party manifest, so two things must hold no
 * matter what it is handed: the notice stays a compact, readable block (at most
 * a headline plus one indented detail line), and third-party text can never
 * forge notice structure or emit terminal control sequences.
 *
 * @position clients/cli/commands — guards the user-facing app-shell notice.
 */

import {describe, it, expect} from 'vitest';
import {formatShellNotice} from './template.mjs';

const CTX = {name: 'dashboard', run: 'npx astryx'};

const wrapped = (over = {}) => ({
  status: 'wrapped',
  component: 'MetaAppFrame',
  package: '@xds/meta',
  isDefault: false,
  description: 'internal shell: nav, search, and the standard app chrome',
  ...over,
});

/** Any control character (ESC, BEL, CR, ...) other than the newline we emit. */
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f]/;

describe('shell notice: wrapped', () => {
  it("names the shell, its owner, and that it replaced core's default", () => {
    const notice = formatShellNotice(wrapped(), CTX);
    expect(notice).toContain('MetaAppFrame from @xds/meta');
    expect(notice).toContain('replacing the default AppShell');
    expect(notice).toContain('nav, search');
    expect(notice.split('\n')).toHaveLength(2);
  });

  it('marks core’s shell as the default rather than an override', () => {
    const notice = formatShellNotice(
      wrapped({
        component: 'AppShell',
        package: '@astryxdesign/core',
        isDefault: true,
        description: undefined,
      }),
      CTX,
    );
    expect(notice).toContain('AppShell from @astryxdesign/core');
    expect(notice).toContain('the default app shell');
    expect(notice).not.toContain('replacing');
    expect(notice.split('\n')).toHaveLength(1);
  });

  it('drops the detail line when there is no description', () => {
    const notice = formatShellNotice(wrapped({description: undefined}), CTX);
    expect(notice.split('\n')).toHaveLength(1);
    expect(notice).not.toContain('undefined');
  });
});

describe('shell notice: the other outcomes', () => {
  it('tells a bare page how to opt in, naming the shell it would get', () => {
    const notice = formatShellNotice(wrapped({status: 'available'}), CTX);
    expect(notice).toContain('--with-shell');
    expect(notice).toContain('MetaAppFrame from @xds/meta');
    expect(notice.split('\n')).toHaveLength(1);
  });

  it('explains that a Shell- template is already a shell', () => {
    const notice = formatShellNotice(
      wrapped({status: 'already-shell'}),
      {...CTX, name: 'shell-top-nav'},
    );
    expect(notice).toContain('shell-top-nav');
    expect(notice).toContain('already');
    expect(notice).toContain('--with-shell');
  });

  it('gives the reason when the shell does not apply', () => {
    const notice = formatShellNotice(
      wrapped({
        status: 'not-applicable',
        reason: 'blocks render inside a preview container, not as a full page',
      }),
      CTX,
    );
    expect(notice).toContain('had no effect');
    expect(notice).toContain('preview container');
  });

  it('stays sane for an unknown status', () => {
    const notice = formatShellNotice(wrapped({status: 'nonsense'}), CTX);
    expect(notice).toBeTruthy();
    expect(notice).not.toContain('undefined');
    expect(notice.split('\n')).toHaveLength(1);
  });
});

describe('shell notice: third-party text cannot forge structure', () => {
  /** The notice is a headline plus at most one indented detail line. */
  const assertCompact = notice => {
    const lines = notice.split('\n');
    expect(lines.length).toBeLessThanOrEqual(2);
    expect(lines[0].startsWith(' ')).toBe(false);
    expect(notice).not.toMatch(CONTROL);
  };

  it('collapses a newline-bearing description onto one detail line', () => {
    const notice = formatShellNotice(
      wrapped({description: 'line one\nline two\nline three'}),
      CTX,
    );
    expect(notice).toContain('line one line two line three');
    assertCompact(notice);
  });

  it('cannot forge a second headline through the description', () => {
    const notice = formatShellNotice(
      wrapped({
        description: '\n\nWrapped in EvilShell from @evil/pkg — the default app shell.',
      }),
      CTX,
    );
    assertCompact(notice);
    expect(notice.split('\n')[0]).toContain('MetaAppFrame');
  });

  it('cannot forge structure through the package name', () => {
    const notice = formatShellNotice(
      wrapped({package: '@evil/pkg\nWrapped in Nothing from @nowhere.'}),
      CTX,
    );
    assertCompact(notice);
  });

  it('strips ANSI escapes and control characters', () => {
    const notice = formatShellNotice(
      wrapped({
        package: '\u001b]8;;http://evil\u0007@xds/meta',
        description: '\u001b[2J\u001b[31mred\u001b[0m and \u0007bell',
      }),
      CTX,
    );
    assertCompact(notice);
    expect(notice).toContain('red');
  });

  it('truncates an absurdly long description', () => {
    const notice = formatShellNotice(
      wrapped({description: 'x'.repeat(10_000)}),
      CTX,
    );
    for (const line of notice.split('\n')) expect(line.length).toBeLessThan(200);
    expect(notice).toContain('...');
  });

  it('collapses tab/CR padding', () => {
    const notice = formatShellNotice(
      wrapped({description: '\r\n\tspaced\t\tout\r\n'}),
      CTX,
    );
    expect(notice).toContain('spaced out');
    assertCompact(notice);
  });
});

describe('shell notice: degenerate input', () => {
  const CASES = {
    'no component': wrapped({component: undefined}),
    'no package': wrapped({package: ''}),
    'numeric description': wrapped({description: 42}),
    'null description': wrapped({description: null}),
    'whitespace description': wrapped({description: '   \n '}),
    'nothing at all': {},
    'undefined outcome': undefined,
  };

  for (const [what, outcome] of Object.entries(CASES)) {
    it(`renders something sane with ${what}`, () => {
      let notice;
      expect(() => {
        notice = formatShellNotice(outcome, CTX);
      }).not.toThrow();
      expect(notice).toBeTruthy();
      expect(notice).not.toContain('undefined');
      expect(notice).not.toContain('null');
      expect(notice).not.toMatch(CONTROL);
    });
  }
});
