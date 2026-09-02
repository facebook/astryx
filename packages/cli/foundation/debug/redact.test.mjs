// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, it, expect} from 'vitest';
import {
  createRedactor,
  isSensitiveKey,
  redactArgv,
  REDACTED,
} from './redact.mjs';

/**
 * Fixture credentials are ASSEMBLED, never written whole. A file of literal
 * credential-shaped strings is a file every secret scanner in the world stops
 * on, and this one is in a public repository.
 * @param {string[]} parts
 */
const cred = parts => parts.join('');

const ctx = {home: '/Users/ada', cwd: '/Users/ada/projects/app', user: 'ada'};
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

  it.each(['key', 'pwd', 'sig', 'pat', 'pw', 'creds'])(
    'treats %s as sensitive only when the name was given, not guessed from text',
    key => {
      expect(isSensitiveKey(key, true)).toBe(true);
      expect(isSensitiveKey(key, false)).toBe(false);
    },
  );

  it.each(['token', 'password', 'apiKey', 'auth'])(
    'treats %s as sensitive either way — nothing ordinary is called that',
    key => {
      expect(isSensitiveKey(key, true)).toBe(true);
      expect(isSensitiveKey(key, false)).toBe(true);
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

  it('removes the username left in the middle of a collapsed path', () => {
    // `/mnt/corp/ada/notes.txt` keeps its last two segments, and one of them
    // is the name. Rewriting relative to home only catches paths that start
    // at home.
    expect(String(scrub('/mnt/corp/ada/notes.txt'))).toBe(
      `/…/${REDACTED}/notes.txt`,
    );
  });

  it('removes the username wherever else it appears', () => {
    expect(String(scrub('owner ada pushed'))).toBe(`owner ${REDACTED} pushed`);
  });

  it('does not take ordinary words containing the username with it', () => {
    expect(String(scrub('adapter loaded, badam ready'))).toBe(
      'adapter loaded, badam ready',
    );
  });

  it.each(['ad', 'root', 'build', 'test', 'node', ''])(
    'skips the username %s — too short, or an ordinary word',
    user => {
      // Mangling every occurrence of "build" in a help screen to hide a name
      // the home path already shows is a bad trade.
      const s = createRedactor({enabled: true, ...ctx, user});
      expect(String(s(`running ${user || 'x'} now`))).toContain(user || 'x');
    },
  );

  it('rewrites a Windows path', () => {
    // The posix rule cannot see one: no leading slash, backslash separators.
    expect(String(scrub('at fn (C:\\Users\\ada\\proj\\src\\x.ts:3:1)'))).toBe(
      'at fn (C:\\…\\src\\x.ts:3:1)',
    );
  });

  it('rewrites a UNC path', () => {
    expect(String(scrub('copy \\\\server\\share\\team\\dist\\out.css'))).toBe(
      'copy \\\\…\\dist\\out.css',
    );
  });
});

describe('credential scrubbing', () => {
  it.each([
    ['ghp_abcdefghijklmnopqrstuvwxyz0123456789', 'GitHub token'],
    ['xoxb-1234567890-abcdefghij', 'Slack token'],
    ['AKIAIOSFODNN7EXAMPLE', 'AWS key id'],
    ['sk-abcdefghijklmnopqrstuvwxyz012345', 'OpenAI key'],
    [cred(['glp', 'at-', 'AbCdEfGhIjKlMnOpQrSt']), 'GitLab token'],
    [cred(['sk-', 'ant-', 'api03-', 'AbCdEfGh_IjKlMnOpQrStUv']), 'Anthropic key'],
    [cred(['sk', '_live_', '4eC39HqLyjWDarjtT1zdp7dc']), 'Stripe key'],
    [cred(['AIza', 'SyD-1234567890abcdefghijklmnopqrstuvw']), 'Google API key'],
    [cred(['npm', '_', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789']), 'npm token'],
    [cred(['hf', '_', 'AbCdEfGhIjKlMnOpQrStUvWxYz0123456789']), 'HuggingFace token'],
    [cred(['AC', '0123456789abcdef0123456789abcdef']), 'Twilio sid'],
  ])('removes a %s', value => {
    expect(String(scrub(`--key ${value}`))).not.toContain(value);
  });

  it('removes a PEM private key however it was wrapped', () => {
    const pem = [
      `-----BEGIN RSA ${cred(['PRIV', 'ATE KEY'])}-----`,
      'MIIEow',
      'IBAAKC',
      `-----END RSA ${cred(['PRIV', 'ATE KEY'])}-----`,
    ].join('\n');
    expect(String(scrub(pem))).toBe(REDACTED);
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

  it.each([
    ['a React key prop', '<Avatar key={user.id} src={user.src} />'],
    ['the help text describing key: value output', 'shape: aligned "key: value" lines'],
    ['a JSON key field', '{"key":"listItem"}'],
    ['a signature note', 'sig=(a: string) => void'],
  ])('leaves %s alone — a bare word is not a name someone chose', (_l, input) => {
    // The whole-word names (`key`, `pwd`, `sig`…) are sensitive when someone
    // DECLARED them — an option, an object field, a `--flag`. Applied to bare
    // text they eat the CLI's own answers: every React example it prints
    // contains `key={…}`, and `--help` documents its output as `key: value`.
    // Found by scrubbing 1.1MB of real command output, not by imagination.
    expect(String(scrub(input))).toBe(input);
  });

  it('leaves shell pwd output readable', () => {
    // The path is still collapsed, as any path is — but the value is not
    // thrown away wholesale for being called `pwd`.
    expect(String(scrub('pwd=/srv/www/build'))).toBe('pwd=/…/www/build');
  });

  it('still drops a bare assignment whose name is unambiguous', () => {
    // The substring list is not affected: nothing ordinary is called `token`.
    expect(String(scrub('token=shhSECRETVALUE'))).toBe(`token=${REDACTED}`);
    expect(String(scrub('{"password":"shhSECRETVALUE"}'))).toBe(
      `{"password":"${REDACTED}"}`,
    );
  });

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

describe('a bare secret, with nothing to identify it by', () => {
  // The documented hole in the first version: a secret passed as a plain
  // argument has no key, no flag and no recognizable prefix, so it landed in
  // `args`, the error message and the captured stderr at once. Randomness is
  // the only signal left, and the gates around the measurement are what stop
  // it eating the record.

  it.each([
    ['a random alphanumeric token', 'aB3xK9mQ7pL2vN8rT5wY6zC4dF1gH0jS'],
    ['a longer one', 'Xk7Pq2Lm9Rt4Ws8Nb3Vc6Zy1Ha5Jd0Ge7Fu4Io2M'],
    ['a base64url secret', 'dBjftJeZ4CVPmB92K27uhbUJU1p1r-wW1gFWFOEjXkQ'],
    ['one at the length floor', 'M4nP8qR2tV6xZ9bD3fH7jL5s'],
    ['a generated password', 'k2Qz9zx3w7ep1r5t8yu4io6pa0sdF2ghj9kl3zxc7vbn5m1qwe'],
  ])('redacts %s passed as a bare argument', (_label, secret) => {
    expect(String(scrub(`docs ${secret}`))).toBe(`docs ${REDACTED}`);
  });

  it('redacts one quoted inside an error message', () => {
    const secret = 'aB3xK9mQ7pL2vN8rT5wY6zC4dF1gH0jS';
    expect(String(scrub(`Unknown topic "${secret}"`))).not.toContain(secret);
  });

  it.each([
    ['a component name', 'RichTextEditorAutoLinkPlugin'],
    ['a hook name', 'useTableGroupedRowsWithSelection'],
    ['a commit sha', 'a3e3d179dcb1f4e5a2b8c7d6e9f0a1b2c3d4e5f6'],
    ['a uuid', '550e8400-e29b-41d4-a716-446655440000'],
    ['a prerelease version', '1.10.0-canary.20260902.1'],
    ['a timestamp', '2026-09-02T07:25:14.000Z'],
    ['a branch name', 'fix-debug-redaction-followups-2'],
    ['a StyleX class', 'x1n2onr6x1ja2u2zx78zum5x1q0g3np'],
    ['a file name', 'DateRangeInput.stories.tsx'],
    ['a package tarball', 'astryxdesign-core-0.5.2.tgz'],
    ['a relative path', 'packages/cli/foundation/debug/recorder.mjs'],
  ])('leaves %s alone', (_label, value) => {
    // Every one of these is longer than the floor and looks random to a naive
    // entropy rule. A record that redacts commit shas and component names is
    // useless for the thing it exists for.
    expect(String(scrub(value))).toBe(value);
  });

  it('leaves a whole line of ordinary output alone', () => {
    const line = 'Compile one or more defineTheme files to CSS and JS';
    expect(String(scrub(line))).toBe(line);
  });

  it('catches a letters-only passphrase and a lowercase token too', () => {
    // Both are shapes a character-class gate would have thrown away.
    expect(String(scrub('QwErTyUiOpAsDfGhJkLzXcVbNm'))).toBe(REDACTED);
    expect(String(scrub('k3m9x2qb7ft4wz8vn5hd1jr6ps0y'))).toBe(REDACTED);
  });

  it('reports the margin the ordinary strings survive on', () => {
    // The threshold is the whole rule, so the number that matters is how much
    // room the closest ordinary string has. If a change eats into this, the
    // table above starts failing — this is here to say by how much.
    const closest = 'RichTextEditorAutoLinkPlugin';
    expect(String(scrub(closest))).toBe(closest);
    expect(String(scrub(`${closest}1`))).toBe(`${closest}1`);
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
    ['random-looking tokens', 'aB3xK9mQ7pL2vN8rT5wY6zC4dF1gH0jS '.repeat(15_000)],
    ['hex runs', 'a3e3d179dcb1f4e5a2b8c7d6e9f0a1b2c3d4e5f6 '.repeat(12_000)],
    ['one long base64 run', 'QWxhZGRpbjpvcGVuIHNlc2FtZQ'.repeat(19_000)],
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
