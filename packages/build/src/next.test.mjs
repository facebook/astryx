// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next.test.mjs
 * @description Verifies withAstryx() emits webpack resolve rules that (1) build
 *   @astryxdesign/* packages from their `source` (raw TS) export, and (2) force
 *   `lexical`/`@lexical/*` to their built dist output — never the `source`
 *   raw-TS export, which Next's Babel cannot compile (`declare` class fields).
 *   Regression guard for the build-sandbox failure where the `source` condition
 *   leaked into @astryxdesign/lab's `import 'lexical'`.
 */

import {describe, it, expect} from 'vitest';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const {withAstryx} = require('./next.js');

/** Run withAstryx's webpack fn against a minimal config and return the rules. */
function getRules() {
  const cfg = withAstryx();
  const webpackCfg = {resolve: {}, module: {rules: []}};
  cfg.webpack(webpackCfg, {dev: false});
  return webpackCfg.module.rules;
}

/** Find the first rule whose `test` regex matches the given path. */
function ruleFor(rules, path) {
  return rules.find(r => r.test instanceof RegExp && r.test.test(path));
}

describe('withAstryx webpack condition rules', () => {
  it('resolves @astryxdesign packages from their source export', () => {
    const rules = getRules();
    const rule = ruleFor(rules, '/x/node_modules/@astryxdesign/core/index.js');
    expect(rule).toBeTruthy();
    expect(rule.resolve.conditionNames).toContain('source');
  });

  it('forces lexical to built dist (no `source` condition)', () => {
    const rules = getRules();
    const rule = ruleFor(rules, '/x/node_modules/lexical/index.js');
    expect(rule).toBeTruthy();
    expect(rule.resolve.conditionNames).not.toContain('source');
    expect(rule.resolve.conditionNames).toContain('...');
  });

  it('forces @lexical/* packages to built dist (no `source` condition)', () => {
    const rules = getRules();
    const rule = ruleFor(
      rules,
      '/x/node_modules/@lexical/react/index.js',
    );
    expect(rule).toBeTruthy();
    expect(rule.resolve.conditionNames).not.toContain('source');
  });

  it('lexical rule takes precedence over the @astryxdesign source rule', () => {
    const rules = getRules();
    const lexicalIdx = rules.findIndex(
      r => r.test instanceof RegExp && r.test.test('/x/node_modules/lexical/index.js'),
    );
    const astryxIdx = rules.findIndex(
      r =>
        r.test instanceof RegExp &&
        r.test.test('/x/node_modules/@astryxdesign/core/index.js'),
    );
    expect(lexicalIdx).toBeGreaterThanOrEqual(0);
    expect(astryxIdx).toBeGreaterThanOrEqual(0);
    // Lower index = matched first by webpack.
    expect(lexicalIdx).toBeLessThan(astryxIdx);
  });

  it('does not match @astryxdesign with the lexical rule', () => {
    const rules = getRules();
    // The lexical rule must NOT catch @astryxdesign packages.
    const lexicalRule = rules.find(
      r =>
        r.test instanceof RegExp &&
        r.test.test('/x/node_modules/lexical/index.js') &&
        !r.resolve.conditionNames.includes('source'),
    );
    expect(lexicalRule.test.test('/x/node_modules/@astryxdesign/core/x.js')).toBe(
      false,
    );
  });
});
