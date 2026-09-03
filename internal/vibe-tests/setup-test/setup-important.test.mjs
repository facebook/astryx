// Copyright (c) Meta Platforms, Inc. and affiliates.

import {describe, expect, it} from 'vitest';
import {
  cssPropertyVocabulary,
  importantDeclarationLines,
  isCssPropertyName,
} from './setup-important.mjs';

const lines = (file, source) =>
  [...importantDeclarationLines(file, source)].sort(
    (left, right) => left - right,
  );

/**
 * The comment that made a real operator run fail three of its cells.
 *
 * This is the shape a `guest-contained` executor produces when it follows the
 * guidance: it documents the portal tradeoff it accepted and lists the things
 * it deliberately did *not* do, one of which is reaching for `!important`. The
 * lexical check read the word and failed the run for saying it.
 */
const GUEST_CONTAINED_COMMENT = `import {useEffect} from 'react';
import {Theme, neutralTheme} from '@astryxdesign/core';

/**
 * Keep the design system inside this region.
 *
 * A root provider syncs \`data-astryx-theme\` onto the document element, and the
 * theme's \`@scope\` rules key off that attribute, so leaving it in place themes
 * the whole document. There is no supported prop that opts out; removing the
 * attribute and observing for its return is a workaround, not a configuration.
 *
 * TRADEOFF: with the attribute gone, content portaled to \`document.body\` falls
 * outside every scope root and loses its theme tokens. This region renders a
 * button and its tooltip, both of which stay in-subtree, so containment wins
 * here. If it ever needs toasts, wrap it in a layer provider that keeps the
 * viewport in the subtree, or accept an unthemed toast — do not re-add a global
 * attribute under another name, copy theme variables onto \`body\`, or paper over
 * it with \`!important\` overrides.
 */
export function AstryxRegion({mode, children}) {
  useEffect(() => {
    const root = document.documentElement;
    const strip = () => root.removeAttribute('data-astryx-theme');
    strip();
    const observer = new MutationObserver(strip);
    observer.observe(root, {attributes: true, attributeFilter: ['data-astryx-theme']});
    return () => observer.disconnect();
  }, []);
  return (
    <Theme theme={neutralTheme} mode={mode}>
      {children}
    </Theme>
  );
}
`;
describe('CSS property vocabulary', () => {
  it('reads the browser property list rather than a hand-written one', () => {
    const vocabulary = cssPropertyVocabulary();
    expect(vocabulary).not.toBeNull();
    // Large enough to be the real list, and carrying both spellings.
    expect(vocabulary.size).toBeGreaterThan(400);
    expect(vocabulary.has('backgroundColor')).toBe(true);
    expect(vocabulary.has('background-color')).toBe(true);
    // Including the ones a hand-written list would have missed.
    expect(isCssPropertyName('scrollbarGutter')).toBe(true);
    expect(isCssPropertyName('--brand-accent')).toBe(true);
    expect(isCssPropertyName('label')).toBe(false);
  });
});

describe('!important in stylesheets', () => {
  it.each([
    {name: 'a declaration', css: '.host { color: red !important; }', at: [1]},
    {
      name: 'a declaration nested in an at-rule',
      css: '@media (min-width: 40rem) {\n  .host {\n    gap: 0 !important;\n  }\n}',
      at: [3],
    },
  ])('finds $name', ({css, at}) => {
    expect(lines('host.css', css)).toEqual(at);
  });

  it.each([
    {
      name: 'a comment warning against it',
      css: '/* Never use !important in this file. */\n.host { color: red; }',
    },
    {
      name: 'a value string that merely spells it',
      css: '.host::after { content: "!important"; }',
    },
  ])('ignores $name', ({css}) => {
    expect(lines('host.css', css)).toEqual([]);
  });

  it('falls back to a conservative scan when the parser cannot read the file', () => {
    // SCSS line comments defeat the CSS parser; the fallback must still find
    // the declaration and must still skip the comment.
    const scss =
      '// !important is banned\n.host {\n  color: red !important;\n}';
    expect(lines('host.scss', scss)).toEqual([3]);
  });

  it('does not exempt a stylesheet because a comment mentions the flag', () => {
    const css = [
      '/* The design system forbids !important; this file predates that. */',
      '.host {',
      '  color: red !important;',
      '}',
    ].join('\n');
    expect(lines('host.css', css)).toEqual([3]);
  });
});

describe('!important in scripts', () => {
  it('does not fire on the comment that failed real runs', () => {
    expect(lines('AstryxRegion.tsx', GUEST_CONTAINED_COMMENT)).toEqual([]);
  });

  it.each([
    {
      name: 'a JSDoc block',
      source:
        '/**\n * Do not paper over it with\n * !important.\n */\nexport const a = 1;',
    },
    {
      name: 'a prose string',
      source: 'export const RULE = "reviewers reject !important overrides";',
    },
  ])('ignores $name', ({source}) => {
    expect(lines('App.tsx', source)).toEqual([]);
  });

  it('finds a declaration assembled across a template interpolation', () => {
    // The parser sees two literal fragments, neither of which carries a whole
    // declaration; the flag is only visible once they are read as one value.
    expect(
      lines('App.tsx', 'const sheet = `.host { color: ${token} !important; }`;'),
    ).toEqual([1]);
  });
});

describe('!important in markup', () => {
  it('finds a style attribute and ignores an HTML comment', () => {
    const html = [
      '<!-- !important is banned in this template -->',
      '<div style="color: red !important">host</div>',
    ].join('\n');
    expect(lines('index.html', html)).toEqual([2]);
  });

  it.each([
    {
      name: 'a style element',
      html: '<style>\n  .host { color: red !important; }\n</style>',
    },
    {
      name: 'a script element',
      html: '<script>\n  el.style.setProperty("color", "red", "important");\n</script>',
    },
  ])('routes $name to the analyzer that owns it', ({html}) => {
    expect(lines('index.html', html)).toEqual([2]);
  });
});

/**
 * Every extension the detector claims to route, in one table.
 *
 * `.tsx`, `.css` and `.html` above are the shapes the real runs produced; the
 * routing table also claims plain and module JavaScript, JSX, and the two
 * single-file component formats, and an extension that falls through it is
 * scanned lexically instead — which is the false positive this whole file
 * exists to prevent. Each row is the pair that matters: the comment alone says
 * nothing, and the same comment above a real override still reports the
 * override.
 */
describe('the extensions the routing table claims', () => {
  it.each([
    {
      file: 'setup.js',
      comment: '// Do not paper over it with !important.',
      applied: 'const patch = {color: "red !important"};',
    },
    {
      file: 'Region.jsx',
      comment: '// The guidance says never to reach for !important.',
      applied: 'export const Badge = () => <b style={{color: "red !important"}} />;',
    },
    {
      file: 'theme.mjs',
      comment: '// !important is banned in this file.',
      applied: 'root.style.setProperty("color", "red", "important");',
    },
    {
      file: 'theme.cjs',
      comment: '/* Reviewers reject !important overrides. */',
      applied: 'module.exports = `.host { color: red !important; }`;',
    },
    {
      file: 'App.vue',
      comment: '<!-- !important is banned in this template -->',
      applied: '<div style="color: red !important">host</div>',
    },
    {
      file: 'App.svelte',
      comment: '<!-- reviewers reject !important -->',
      applied: '<style>.host { color: red !important; }</style>',
    },
  ])('reads a comment and an override apart in $file', ({file, comment, applied}) => {
    expect(lines(file, comment)).toEqual([]);
    expect(lines(file, `${comment}\n${applied}`)).toEqual([2]);
  });
});

/**
 * Mutations of the real false-positive fixture.
 *
 * Ignoring comments and prose is only safe if a real override cannot hide in
 * one. Each mutation keeps the comment exactly as the executor wrote it and
 * adds a genuine override through one of the three ways a literal counts as
 * applied CSS — a style-object value, a stylesheet string, and the
 * `setProperty` priority argument the old lexical scan could not see at all.
 */
describe('mutations of the real false-positive fixture', () => {
  it.each([
    {
      name: 'a style object below the comment',
      extra: 'const patch = {color: "red !important"};\n',
    },
    {
      name: 'an injected stylesheet',
      extra: 'const sheet = `.host { color: red !important; }`;\n',
    },
    {
      name: 'a runtime setProperty',
      extra: 'root.style.setProperty("color", "red", "important");\n',
    },
  ])('still catches $name', ({extra}) => {
    const found = lines('AstryxRegion.tsx', `${GUEST_CONTAINED_COMMENT}${extra}`);
    expect(found).toHaveLength(1);
    // The finding is on the added code, never on the comment above it.
    expect(found[0]).toBeGreaterThan(
      GUEST_CONTAINED_COMMENT.split('\n').length - 2,
    );
  });

  it.each([
    {
      name: 'directly below a comment that disclaims it',
      source:
        '/** Do not paper over it with !important. */\nconst patch = {color: "red !important"};',
      at: [2],
    },
    {
      name: 'on the same line as a comment that excuses it',
      source:
        'const patch = {color: "red !important"}; // sanctioned !important',
      at: [1],
    },
  ])('catches an override written $name', ({source, at}) => {
    expect(lines('AstryxRegion.tsx', source)).toEqual(at);
  });
});
