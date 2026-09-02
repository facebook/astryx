// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  createRedactor,
  isSensitiveKey,
  redactArgv,
  REDACTED,
} from './redact.mjs';

const ctx = {home: '/Users/ada', cwd: '/Users/ada/projects/app'};
const scrub = createRedactor({enabled: true, ...ctx});

describe('isSensitiveKey', () => {
  it.each(['token', 'authToken', 'GITHUB_TOKEN', 'password', 'apiSecret', 'sessionId', 'x-signature', 'api-key', 'apiKey', 'API_KEY', 'accessKey', 'key', 'pat', 'pw'])(
    'treats %s as sensitive',
    key => {
      expect(isSensitiveKey(key)).toBe(true);
    },
  );

  it.each(['out', 'detail', 'component', 'limit', 'path', 'keyboard', 'sortkey', 'pattern', 'compatible', undefined])(
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

  it.each(['--api-key', '--api_key', '--apiKey', '--APIKEY'])(
    'drops the value of %s',
    flag => {
      // `key` is not a substring rule — it would take `--keyboard` with it —
      // so the spellings have to normalize to one entry.
      const out = String(scrub(`unknown option '${flag}=shhSECRETVALUE'`));
      expect(out).not.toContain('shhSECRETVALUE');
    },
  );

  it.each(['--key', '--pat', '--pw', '--pwd', '--creds', '--sig'])(
    'drops the value of the whole-word key %s',
    flag => {
      expect(String(scrub(`${flag}=shhSECRETVALUE`))).not.toContain(
        'shhSECRETVALUE',
      );
    },
  );

  it.each(['--keyboard', '--path', '--sortkey', '--pattern', '--signal'])(
    'leaves %s alone — a whole-word rule must not eat ordinary flags',
    flag => {
      expect(String(scrub(`${flag}=ordinaryvalue`))).toContain('ordinaryvalue');
    },
  );

  it.each([
    ['a quoted flag value', '--token="shhSECRETVALUE"'],
    ['a single-quoted value', "--secret='shhSECRETVALUE'"],
    ['a JSON string pair', '{"token":"shhSECRETVALUE"}'],
    ['a spaced JSON pair', '{ "apiKey": "shhSECRETVALUE" }'],
    ['a yaml pair', 'password: shhSECRETVALUE'],
  ])('drops %s', (_label, input) => {
    // The value half has to take the quotes with it. Stopping AT the opening
    // quote leaves the secret standing with quotes around it — which is the
    // shape a config blob or a quoted argument arrives in.
    expect(String(scrub(input))).not.toContain('shhSECRETVALUE');
  });

  it('keeps the quoting so the surrounding shape still parses', () => {
    const out = String(scrub('{"token":"shhSECRETVALUE","name":"astryx"}'));
    expect(() => JSON.parse(out)).not.toThrow();
    expect(JSON.parse(out).name).toBe('astryx');
    expect(JSON.parse(out).token).toBe(REDACTED);
  });

  it.each([
    ['a URL', 'GET https://api.github.com/repos/facebook/astryx/pulls/4812'],
    ['a websocket URL', 'ws://localhost:5173/hmr/client'],
    ['a proxy URL', 'http://127.0.0.1:8931/a/b/c'],
    ['a time', 'elapsed 12:30 done'],
    ['a ratio', 'aspect: 16/9'],
    ['an ordinary JSON pair', '{"name":"astryx"}'],
  ])('leaves %s untouched — `:` is a separator, not an invitation', (_l, input) => {
    expect(String(scrub(input))).toBe(input);
  });
});

describe('argv, where the flag and its value are separate elements', () => {
  it('drops the element after a sensitive flag', () => {
    // `--flag value` is the ordinary CLI spelling. Redacting it in `options`
    // and printing it in `argv` would be the worst of both.
    expect(redactArgv(['docs', '--token', 'hunter2SECRET'], scrub)).toEqual([
      'docs',
      '--token',
      REDACTED,
    ]);
  });

  it('keeps the flag name itself', () => {
    const out = /** @type {string[]} */ (
      redactArgv(['--api-key', 'shhSECRET'], scrub)
    );
    expect(out[0]).toBe('--api-key');
    expect(out[1]).toBe(REDACTED);
  });

  it('leaves an ordinary flag and its value alone', () => {
    expect(redactArgv(['theme', 'build', '--out', 'dist'], scrub)).toEqual([
      'theme',
      'build',
      '--out',
      'dist',
    ]);
  });

  it('still scrubs each element on its own merits', () => {
    expect(redactArgv(['docs', 'ada@example.com'], scrub)).toEqual([
      'docs',
      REDACTED,
    ]);
  });

  it('does not treat the value after `--token=x` as sensitive', () => {
    // The `=` form carries its own value; the NEXT element is unrelated.
    expect(redactArgv(['--token=x', 'docs'], scrub)).toEqual([
      `--token=${REDACTED}`,
      'docs',
    ]);
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
    ['a word run then a colon keyword', `${'y'.repeat(500_000)} token:abc`],
    ['colons', ':'.repeat(500_000)],
    ['quoted pairs', '"k":"xxxxxxxxxxxxxxxxxxxx" '.repeat(19_000)],
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
