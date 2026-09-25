// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import jscodeshift from 'jscodeshift';
import manifest from '../index.mjs';
import transform, {
  DEPRECATED_THEME_TARGETS,
} from '../migrate-deprecated-theme-surface.mjs';

const j = jscodeshift.withParser('tsx');
const api = {jscodeshift: j, stats: () => {}, report: () => {}};

function apply(source, filePath = 'theme.ts') {
  return transform({source, path: filePath}, api) ?? source;
}

const EXPECTED_TARGETS = {
  'base-table': 'table',
  checkbox: 'checkbox-indicator',
  codeblock: 'code-block',
  'codeblock-copy-button': 'code-block-copy-button',
  'codeblock-header': 'code-block-header',
  'codeblock-title': 'code-block-title',
  'date-input-clear-icon': 'input-clear-icon',
  'date-range-input-clear-icon': 'input-clear-icon',
  hovercard: 'hover-card',
  'multi-selector-clear-icon': 'input-clear-icon',
  navicon: 'nav-icon',
  'popover-surface': 'popover',
  progressbar: 'progress-bar',
  'progressbar-fill': 'progress-bar-fill',
  'progressbar-mark': 'progress-bar-mark',
  'progressbar-track': 'progress-bar-track',
  radio: 'radio-indicator',
  'radio-dot': 'radio-indicator-dot',
  'selector-clear-icon': 'input-clear-icon',
  statusdot: 'status-dot',
  textarea: 'text-area',
};

describe('migrate-deprecated-theme-surface', () => {
  it('is staged as a required next-release code codemod', () => {
    const entry = manifest.find(
      candidate => candidate.name === 'migrate-deprecated-theme-surface',
    );
    expect(entry).toBeDefined();
    expect(entry?.optional).not.toBe(true);
    expect(entry?.meta.fileExtensions).toContain('.css');
    expect(entry?.meta.fileExtensions).toContain('.ts');
  });

  it('owns the complete approved 21-target mapping', () => {
    expect(DEPRECATED_THEME_TARGETS).toEqual(EXPECTED_TARGETS);
    expect(Object.keys(DEPRECATED_THEME_TARGETS)).toHaveLength(21);
  });

  it.each(Object.entries(EXPECTED_TARGETS))(
    'renames static target key %s to %s inside a components map',
    (oldKey, newKey) => {
      const output = apply(
        `const theme = {components: {${JSON.stringify(oldKey)}: {base: {color: 'red'}}}};`,
      );

      expect(output).not.toContain(`${JSON.stringify(oldKey)}:`);
      expect(output).toContain(`'${newKey}':`);
    },
  );

  it('renames root, mode, and adaptation component maps', () => {
    const output = apply(`const theme = defineTheme({
  components: {progressbar: {base: {color: 'red'}}},
  onDark: {components: {'statusdot': {base: {color: 'white'}}}},
  adaptations: {rules: [{value: {components: {'popover-surface': {base: {padding: 8}}}}}]},
});`);

    expect(output).toContain("'progress-bar':");
    expect(output).toContain("'status-dot':");
    expect(output).toContain("'popover':");
    expect(output).not.toMatch(/(?:progressbar|statusdot|popover-surface)\s*:/);
  });

  it('renames a statically declared components variable used by defineTheme', () => {
    const output = apply(`const components = {textarea: {base: {color: 'red'}}};
export const theme = defineTheme({name: 'brand', components});`);
    expect(output).toContain("'text-area':");
  });

  it('does not rewrite an unrelated object property named components', () => {
    const input = `const registry = {components: {checkbox: Checkbox}};`;
    expect(apply(input)).toBe(input);
  });

  it('uses lexical scope when a theme components variable shadows a registry', () => {
    const input = `const components = {checkbox: Checkbox};
function makeTheme() {
  const components = {textarea: {base: {color: 'red'}}};
  return defineTheme({components});
}`;
    const output = apply(input);
    expect(output).toContain('const components = {checkbox: Checkbox};');
    expect(output).toContain("'text-area':");
  });

  it('does not rename matching keys outside a components map or dynamic keys', () => {
    const input = `const labels = {progressbar: 'Progress'};
const oldTarget = 'progressbar';
const theme = {components: {[oldTarget]: {base: {color: 'red'}}}};`;
    expect(apply(input)).toBe(input);
  });

  it('flags a static old/new collision instead of silently dropping either rule', () => {
    const input = `const theme = {components: {
  progressbar: {base: {color: 'red'}},
  'progress-bar': {base: {backgroundColor: 'blue'}},
}};`;
    const output = apply(input);
    expect(output).toContain('TODO(astryx upgrade)');
    expect(output).toContain('merge deprecated theme target `progressbar`');
    expect(output).toContain('progressbar:');
    expect(output).toContain("'progress-bar':");
    expect(apply(output)).toBe(output);
  });

  it('renames every removed target class in CSS selectors', () => {
    const input = Object.keys(EXPECTED_TARGETS)
      .map(key => `.astryx-${key} { color: red; }`)
      .join('\n');
    const output = apply(input, 'theme.css');

    for (const [oldKey, newKey] of Object.entries(EXPECTED_TARGETS)) {
      expect(output).not.toMatch(
        new RegExp(
          `\\.astryx-${oldKey.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}(?![a-z0-9-])`,
        ),
      );
      expect(output).toContain(`.astryx-${newKey}`);
    }
  });

  it('replaces target-qualified bare classes with reflected data selectors', () => {
    const output = apply(
      `.astryx-button.primary.sm:hover { color: red; }
.astryx-heading.level-2 { margin: 0; }
.astryx-switch.checked { opacity: 1; }
.astryx-grid.center { place-content: center; }`,
      'theme.css',
    );

    expect(output).toContain(
      '.astryx-button:is([data-variant="primary"]):is([data-size="sm"]):hover',
    );
    expect(output).toContain('.astryx-heading:is([data-level="2"])');
    expect(output).toContain('.astryx-switch:is([data-checked="checked"])');
    expect(output).toContain(
      '.astryx-grid:is([data-align="center"],[data-justify="center"])',
    );
    expect(output).not.toMatch(
      /\.(?:primary|sm|level-2|checked|center)(?![a-z0-9_-])/,
    );
  });

  it('canonicalizes aliases before emitting data-attribute selectors', () => {
    const output = apply(
      '.astryx-progressbar.success > .astryx-progressbar-mark.fill {}',
      'theme.css',
    );
    expect(output).toContain(
      '.astryx-progress-bar:is([data-variant="success"])',
    );
    expect(output).toContain(
      '.astryx-progress-bar-mark:is([data-placement="fill"])',
    );
    expect(output).not.toContain('astryx-progressbar');
    expect(output).not.toMatch(/\.(?:success|fill)(?![a-z0-9_-])/);
  });

  it('finishes selectors produced by the 0.6 compatibility codemod', () => {
    const output = apply(
      '.astryx-button:is(.primary,[data-variant="primary"]) {}',
      'theme.css',
    );
    expect(output).toContain('.astryx-button:is([data-variant="primary"])');
    expect(output).not.toContain('.primary');
  });

  it('leaves unqualified and unknown consumer classes unchanged', () => {
    const input = `.primary { color: red; }
.astryx-button.brand { color: blue; }`;
    expect(apply(input, 'theme.css')).toBe(input);
  });

  it('does not remove a data-selector union from a different selector compound', () => {
    const output = apply(
      '.astryx-button.primary .consumer:is(.primary,[data-custom="x"]) {}',
      'theme.css',
    );
    expect(output).toContain('.astryx-button:is([data-variant="primary"])');
    expect(output).toContain('.consumer:is(.primary,[data-custom="x"])');
  });

  it('never rewrites CSS examples in JavaScript strings', () => {
    const input = `const selector = '.astryx-progressbar.success';`;
    expect(apply(input)).toBe(input);
  });

  it('is byte-idempotent after JavaScript and CSS migration', () => {
    const js = `const theme = {components: {statusdot: {base: {color: 'red'}}}};`;
    const css = '.astryx-textarea.sm {}';
    const jsOnce = apply(js);
    const cssOnce = apply(css, 'theme.css');
    expect(apply(jsOnce)).toBe(jsOnce);
    expect(apply(cssOnce, 'theme.css')).toBe(cssOnce);
  });
});
