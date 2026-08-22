// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file splitLayers.test.ts
 * @description Bucketing rules for compiled StyleX CSS. The shapes here are
 *   taken from real Storybook output: merged selector lists, `:root` token
 *   blocks, conditional at-rules and prefixed keyframes.
 */

import {describe, it, expect} from 'vitest';
import postcss from 'postcss';
import {splitStylexLayers} from './splitLayers';

const OPTIONS = {
  libraryLayer: 'astryx-base',
  productLayer: 'product',
  libraryPrefix: 'astryx',
};

const split = (css: string) => splitStylexLayers(css, OPTIONS);

/** The CSS text of one top-level layer. */
function layer(css: string, name: string): string {
  let found = '';
  postcss.parse(css).each(node => {
    if (
      node.type === 'atrule' &&
      node.name === 'layer' &&
      node.params === name
    ) {
      found += node.toString();
    }
  });
  return found;
}

describe('splitStylexLayers', () => {
  it('sorts atoms into the library and product layers by prefix', () => {
    const out = split(`@layer priority2 {
  .astryx1q8g9m5 { background-color: var(--color-warning); }
  .x1n0khkq { color: #639; }
}`);

    expect(layer(out, 'astryx-base')).toContain('.astryx1q8g9m5');
    expect(layer(out, 'astryx-base')).not.toContain('.x1n0khkq');
    expect(layer(out, 'product')).toContain('.x1n0khkq');
    expect(layer(out, 'product')).not.toContain('.astryx1q8g9m5');
  });

  it('splits a selector list shared by a library and a product atom', () => {
    // StyleX merges identical declarations across both compilation targets.
    const out = split(`@layer priority2 {
  .astryx11g6tue, .astryx1md70p1, .x1md70p1 { background: none; }
}`);

    expect(layer(out, 'astryx-base')).toContain(
      '.astryx11g6tue, .astryx1md70p1',
    );
    expect(layer(out, 'astryx-base')).not.toContain('.x1md70p1');
    expect(layer(out, 'product')).toContain('.x1md70p1 {');
  });

  it('keeps :root token defaults in the library layer', () => {
    // Tokens must stay below the theme layer, or a theme cannot retint them.
    const out = split(`@layer priority10 {
  :root, .astryxj0fimd { --color-accent: #0064e0; }
}`);

    expect(layer(out, 'astryx-base')).toContain(':root, .astryxj0fimd');
    expect(layer(out, 'product')).toBe('');
  });

  it('splits inside conditional at-rules', () => {
    const out = split(`@layer priority4 {
  @media (width >= 768px) {
    .astryxabc123 { display: flex; }
    .xdef456 { display: grid; }
  }
}`);

    expect(layer(out, 'astryx-base')).toContain('.astryxabc123');
    expect(layer(out, 'astryx-base')).not.toContain('.xdef456');
    expect(layer(out, 'product')).toContain('@media (width >= 768px)');
    expect(layer(out, 'product')).toContain('.xdef456');
  });

  it('routes keyframes by the prefix in their name', () => {
    const out = split(`@layer priority10 {
  @keyframes astryx1k48ry3-B { from { opacity: 0; } }
  @keyframes x1ofn8cw-B { from { opacity: 1; } }
}`);

    expect(layer(out, 'astryx-base')).toContain('@keyframes astryx1k48ry3-B');
    expect(layer(out, 'product')).toContain('@keyframes x1ofn8cw-B');
  });

  it('preserves the relative order of the priority layers', () => {
    const out = split(`@layer priority2 { .astryxa1 { color: red; } }
@layer priority5 { .astryxb2 { color: blue; } }`);

    const base = layer(out, 'astryx-base');
    expect(base.indexOf('priority2')).toBeLessThan(base.indexOf('priority5'));
    // The order statement covers layers whose rules all landed in one bucket.
    expect(layer(out, 'product')).toBe('');
    expect(base).toContain('@layer priority2, priority5;');
  });

  it('leaves other layers and unlayered CSS untouched', () => {
    const css = `@layer reset{:where(*){box-sizing:border-box}}
.legacy{color:red}
@layer priority2 { .astryxa1 { color: red; } }`;

    const out = split(css);
    expect(out).toContain('@layer reset{:where(*){box-sizing:border-box}}');
    expect(out).toContain('.legacy{color:red}');
  });

  it('is a no-op on CSS it has already split', () => {
    const once = split(`@layer priority2 {
  .astryx1q8g9m5 { background-color: var(--color-warning); }
  .x1n0khkq { color: #639; }
}`);
    expect(split(once)).toBe(once);
  });

  it('returns CSS with no priority layers unchanged', () => {
    const css = '@layer reset{body{margin:0}}';
    expect(split(css)).toBe(css);
  });

  it('refuses to guess when the library prefix is itself an atom prefix', () => {
    const css = '@layer priority2 { .x1n0khkq { color: #639; } }';
    expect(splitStylexLayers(css, {...OPTIONS, libraryPrefix: 'x1'})).toBe(css);
  });
});
