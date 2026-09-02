// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {createRedactor, isSensitiveKey, REDACTED} from './redact.mjs';

const ctx = {home: '/Users/ada', cwd: '/Users/ada/projects/app'};
const scrub = createRedactor({enabled: true, ...ctx});

describe('isSensitiveKey', () => {
  it.each([
    'token',
    'authToken',
    'GITHUB_TOKEN',
    'password',
    'apiSecret',
    'sessionId',
    'x-signature',
  ])('treats %s as sensitive', key => {
    expect(isSensitiveKey(key)).toBe(true);
  });

  it.each(['out', 'detail', 'component', 'limit', undefined])(
    'leaves %s alone',
    key => {
      expect(isSensitiveKey(key)).toBe(false);
    },
  );
});

describe('path scrubbing', () => {
  it('rewrites the project directory to a relative path', () => {
    expect(scrub(`${ctx.cwd}/src/App.tsx`)).toBe('./src/App.tsx');
  });

  it('rewrites the home directory to ~', () => {
    expect(scrub('/Users/ada/notes.txt')).toBe('~/notes.txt');
  });

  it('keeps only the tail of a path outside home and cwd', () => {
    // The shape of the operation survives; where it lives on disk does not.
    expect(scrub('/mnt/corp/secret-project/themes/ocean.ts')).toBe(
      '/…/themes/ocean.ts',
    );
  });

  it('leaves relative paths untouched', () => {
    expect(scrub('./src/themes/ocean.ts')).toBe('./src/themes/ocean.ts');
  });

  it('rewrites a path inside a stack frame', () => {
    // The paths that carry a username are the ones in a stack, and a stack
    // never puts whitespace before them: `at fn (file:///Users/ada/…)`.
    const frame =
      '    at cliError (file:///opt/tools/astryx/packages/cli/lib/x.mjs:12:5)';
    const out = String(scrub(frame));
    expect(out).not.toContain('/opt/tools/astryx');
    expect(out).toContain('/…/lib/x.mjs:12:5');
  });

  it('rewrites a path wrapped in punctuation', () => {
    expect(String(scrub('read (/mnt/corp/team/build/out.css)'))).toBe(
      'read (/…/build/out.css)',
    );
  });
});

describe('credential scrubbing', () => {
  it.each([
    ['ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'GitHub token'],
    ['xoxb-1234567890-abcdefghij', 'Slack token'],
    ['AKIAIOSFODNN7EXAMPLE', 'AWS key id'],
    ['sk-abcdefghijklmnopqrstuvwxyz012345', 'OpenAI key'],
  ])('removes a %s', value => {
    expect(String(scrub(`--key ${value}`))).not.toContain(value);
  });

  it('removes a bearer token', () => {
    const out = String(scrub('Authorization: Bearer abcdefghijklmnopqrstuvwxyz'));
    expect(out).not.toContain('abcdefghijklmnopqrstuvwxyz');
  });

  it('removes a JWT', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.dozjgNryP4J3jVmNHl0w5N_XgL0n3I9PlFUP0THsR8U';
    expect(String(scrub(jwt))).toBe(REDACTED);
  });

  it('removes an email address', () => {
    expect(String(scrub('failed for ada@example.com'))).toBe(
      `failed for ${REDACTED}`,
    );
  });

  it('removes credentials embedded in a URL', () => {
    expect(String(scrub('https://ada:hunter2@git.example.com/repo'))).toBe(
      `https://${REDACTED}@git.example.com/repo`,
    );
  });

  it('drops the value half of a sensitive assignment', () => {
    expect(scrub('--auth-token=whatever-shape-this-is')).toBe(
      `--auth-token=${REDACTED}`,
    );
  });

  it('drops it inside a larger string too', () => {
    // A rejected flag comes back quoted in the error message, the stack and
    // the captured stderr. Scrubbing only the standalone argv element writes
    // the same secret to the record three more times.
    const out = String(
      scrub("error: unknown option '--token=whatever-shape-this-is'"),
    );
    expect(out).not.toContain('whatever-shape-this-is');
    expect(out).toContain(`--token=${REDACTED}`);
  });

  it('drops every assignment in one string', () => {
    // The anchored rule this replaced would swallow everything after the first
    // `=`, so a case with only sensitive keys passes either way. This one has
    // an ordinary flag in front, which the anchored rule never gets past.
    const out = String(scrub('--out=dist and --secret=two and TOKEN=three'));
    expect(out).toContain('--out=dist');
    expect(out).not.toContain('two');
    expect(out).not.toContain('three');
  });

  it('leaves an ordinary assignment alone', () => {
    expect(scrub('--out=dist/theme.css')).toBe('--out=dist/theme.css');
  });
});

describe('structure preservation', () => {
  it('keeps shape while replacing sensitive values', () => {
    expect(
      scrub({out: `${ctx.cwd}/dist/theme.css`, token: 'abc', check: true}),
    ).toEqual({out: './dist/theme.css', token: REDACTED, check: true});
  });

  it('recurses into arrays and nested objects', () => {
    expect(scrub({a: [{password: 'x'}, 'ada@example.com']})).toEqual({
      a: [{password: REDACTED}, REDACTED],
    });
  });

  it('leaves numbers and booleans as their own type', () => {
    expect(scrub({n: 42, b: false})).toEqual({n: 42, b: false});
  });

  it('records the type of a non-serializable value, never the value', () => {
    expect(scrub({fn: () => 'secret'})).toEqual({fn: '[function]'});
  });

  it('stops recursing on a deeply nested structure', () => {
    /** @type {any} */
    let deep = 'leaf';
    for (let i = 0; i < 20; i += 1) deep = {next: deep};
    expect(() => scrub(deep)).not.toThrow();
  });

  it('survives a circular reference', () => {
    /** @type {any} */
    const circular = {name: 'a'};
    circular.self = circular;
    expect(() => scrub(circular)).not.toThrow();
  });
});

describe('cost on hostile input', () => {
  // Scrubbing runs before the length clamp and over captured output, so every
  // rule has to stay linear in the size of the string. Two guards keep the
  // assignment rule linear and BOTH are load-bearing: a cheap keyword
  // pre-check skips strings that cannot match, and bounded quantifiers either
  // side of the keyword save the ones that get past it. Measured on the
  // unbounded version, a 500KB word run followed by `token=` took over seven
  // minutes; it is 200ms here.
  const big = createRedactor({...ctx, maxLength: Number.MAX_SAFE_INTEGER});

  it.each([
    ['plain word characters', 'x'.repeat(500_000)],
    ['a word run then a keyword', `${'y'.repeat(500_000)} token=abc`],
    ['a keyword between two word runs', `${'x'.repeat(250_000)}token=${'y'.repeat(250_000)}`],
    ['a word run then an equals sign', `${'x'.repeat(500_000)}=`],
    ['repeated assignments', 'token=abc '.repeat(50_000)],
    ['deep paths', '/a/b/c/d/e/f '.repeat(38_000)],
    ['stack frames', '    at fn (file:///opt/x/y/z.mjs:1:2)\n'.repeat(13_000)],
  ])('scrubs 500KB of %s in well under a second', (_label, input) => {
    const started = Date.now();
    big(input);
    expect(Date.now() - started).toBeLessThan(1000);
  });
});

describe('disabled mode', () => {  it('keeps sensitive content verbatim', () => {
    const raw = createRedactor({enabled: false});
    expect(raw({token: 'ghp_secret', path: '/Users/ada/x'})).toEqual({
      token: 'ghp_secret',
      path: '/Users/ada/x',
    });
  });

  it('still clamps oversized values', () => {
    // Length limits are a size guard, not a privacy one, so they survive
    // turning scrubbing off — otherwise one huge value costs the whole event.
    const raw = createRedactor({enabled: false, maxLength: 10});
    expect(String(raw({big: 'y'.repeat(500)}).big)).toMatch(
      /^y{10}…\[\+490 chars\]$/,
    );
  });
});
