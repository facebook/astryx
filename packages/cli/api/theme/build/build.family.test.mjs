// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * `--family` builds: a base plus the themes that `extends` it, built as one
 * unit. The base stylesheet restates its declarations ONCE, scoped to every
 * member (`@scope` over the member value list, token block wrapped in the
 * zero-specificity `:where(:scope)`), and each member stylesheet carries only
 * its own deltas — instead of every member restating the whole resolved token
 * set it inherited.
 *
 * These drive `resolveThemeFamily()` + `themeBuild({family})`, the API pair
 * behind `astryx theme build --family`.
 */

import {describe, it, expect, beforeEach, afterEach} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import {themeBuild} from './build.mjs';
import {resolveThemeFamily} from './build.mjs';

let tmpDir;
beforeEach(() => {
  tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-theme-family-'));
});
afterEach(() => {
  fs.rmSync(tmpDir, {recursive: true, force: true});
});

/**
 * Write the ocean base + a member that changes exactly one colour.
 *
 * The fixtures are RESOLVED theme objects (what defineTheme returns), plain
 * enough for the loader's object path: `__extends` carries the base the way
 * defineTheme records it (defineTheme.test.ts covers that recording). Keeping
 * them import-free lets the fixtures live in the system temp dir, outside the
 * package tree the manifest/docs walkers scan.
 */
function writeFamily() {
  fs.writeFileSync(
    path.join(tmpDir, 'ocean.mjs'),
    `export default {\n` +
      `  name: 'ocean',\n` +
      `  tokens: {'--color-accent': '#0077b6', '--radius-container': '16px'},\n` +
      `};\n`,
  );
  fs.writeFileSync(
    path.join(tmpDir, 'ocean-deep.mjs'),
    `const base = {\n` +
      `  name: 'ocean',\n` +
      `  tokens: {'--color-accent': '#0077b6', '--radius-container': '16px'},\n` +
      `};\n` +
      `export default {\n` +
      `  name: 'ocean-deep',\n` +
      `  tokens: {'--color-accent': '#48cae4', '--radius-container': '16px'},\n` +
      `  __extends: base,\n` +
      `};\n`,
  );
  return ['ocean.mjs', 'ocean-deep.mjs'];
}

async function buildFamily(files) {
  const roles = await resolveThemeFamily(files, {cwd: tmpDir});
  for (const file of files) {
    await themeBuild(
      file,
      {family: roles.get(path.resolve(tmpDir, file))},
      {cwd: tmpDir},
    );
  }
}

describe('resolveThemeFamily()', () => {
  it('classifies the base and its members from `extends`, not argument order', async () => {
    const [base, member] = writeFamily();
    // Member first: the roles must still come out right.
    const roles = await resolveThemeFamily([member, base], {cwd: tmpDir});
    expect(roles.get(path.resolve(tmpDir, base))?.role).toBe('base');
    expect(roles.get(path.resolve(tmpDir, member))?.role).toBe('child');
    // And the canonical invocation is base-first, members sorted.
    expect(roles.get(path.resolve(tmpDir, base))?.files).toEqual([base, member]);
  });

  it('refuses a set whose members do not all extend the one base', async () => {
    writeFamily();
    fs.writeFileSync(
      path.join(tmpDir, 'stray.mjs'),
      `export default {name: 'stray', tokens: {'--color-accent': '#111111'}};\n`,
    );
    await expect(
      resolveThemeFamily(['ocean.mjs', 'ocean-deep.mjs', 'stray.mjs'], {cwd: tmpDir}),
    ).rejects.toThrow(/exactly one base theme/);
  });
});

describe('themeBuild({family}) — emitted CSS', () => {
  it('the base restates its declarations once for every member, at zero specificity', async () => {
    const files = writeFamily();
    await buildFamily(files);

    const baseCss = fs.readFileSync(path.join(tmpDir, 'ocean.css'), 'utf8');
    // The base's own scope is untouched...
    expect(baseCss).toContain('@scope ([data-astryx-theme="ocean"]) to ([data-astryx-theme])');
    // ...and the family block names the member and holds the shared tokens in
    // :where(:scope), so a member's own `:scope` block wins regardless of
    // stylesheet load order.
    expect(baseCss).toContain('@scope ([data-astryx-theme="ocean-deep"]) to ([data-astryx-theme])');
    expect(baseCss).toContain(':where(:scope) {');
    // The command header is the whole invocation, reproducible as typed.
    expect(baseCss).toContain('astryx theme build --family ocean.mjs ocean-deep.mjs');
  });

  it('a member carries only its own deltas', async () => {
    const files = writeFamily();
    await buildFamily(files);

    const memberCss = fs.readFileSync(path.join(tmpDir, 'ocean-deep.css'), 'utf8');
    // The changed token ships...
    expect(memberCss).toContain('--color-accent: #48cae4');
    // ...the inherited-unchanged one does not (the family block carries it)...
    expect(memberCss).not.toContain('--radius-container');
    // ...and neither do the prose defaults or the data-token defaults, which
    // regenerate byte-identical to the base's family block.
    expect(memberCss).not.toContain(':where(h1');
    expect(memberCss).not.toContain('@layer astryx-base');
    // Same reproducible whole-family command in the member's header.
    expect(memberCss).toContain('astryx theme build --family ocean.mjs ocean-deep.mjs');
  });

  it('the same file set builds byte-identical output whatever the argument order', async () => {
    const files = writeFamily();
    await buildFamily(files);
    const first = fs.readFileSync(path.join(tmpDir, 'ocean.css'), 'utf8');

    await buildFamily([...files].reverse());
    const second = fs.readFileSync(path.join(tmpDir, 'ocean.css'), 'utf8');
    expect(second).toBe(first);
  });

  it('refuses a member that drops a token its base declares', async () => {
    writeFamily();
    fs.writeFileSync(
      path.join(tmpDir, 'ocean-broken.mjs'),
      `const base = {\n` +
        `  name: 'ocean',\n` +
        `  tokens: {'--color-accent': '#0077b6', '--radius-container': '16px'},\n` +
        `};\n` +
        `export default {\n` +
        `  name: 'ocean-broken',\n` +
        `  tokens: {'--color-accent': '#0077b6'},\n` +
        `  __extends: base,\n` +
        `};\n`,
    );
    const files = ['ocean.mjs', 'ocean-broken.mjs'];
    const roles = await resolveThemeFamily(files, {cwd: tmpDir});
    await expect(
      themeBuild(
        'ocean-broken.mjs',
        {family: roles.get(path.resolve(tmpDir, 'ocean-broken.mjs'))},
        {cwd: tmpDir},
      ),
    ).rejects.toThrow(/drops 1 token/);
  });
});
