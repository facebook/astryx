// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file themeMotionMark.test.tsx
 * @input vitest (jsdom), React Testing Library, react-dom/server, Theme and
 *   defineTheme
 * @output Checks `spec:AST-108` FR6's root mark: `reducedMotion: 'always'`
 *   marks the Theme wrapper (in a server render too, so nothing changes at
 *   hydration) and, for the root theme, `<html>`, so portaled layers reduce
 *   their motion; `'system'` marks nothing; a child theme inherits the setting
 *   from the theme it extends; the mark leaves with the theme; a theme that
 *   sets tempo or character writes them, for the animator, on the same
 *   elements
 * @position Testing; validates Theme.tsx's use of themeMotion.ts
 */

import {render} from '@testing-library/react';
import {renderToString} from 'react-dom/server';
import {afterEach, describe, expect, it} from 'vitest';
import {defineTheme} from './defineTheme';
import {Theme} from './Theme';

const MARK = 'data-astryx-reduced-motion';

const always = defineTheme({
  name: 'StillAlways',
  motion: {reducedMotion: 'always'},
});
const system = defineTheme({name: 'StillSystem', motion: {tempo: 1.2}});

afterEach(() => {
  document.documentElement.removeAttribute(MARK);
});

describe('the reduced-motion mark (spec:AST-108 FR6)', () => {
  it("'always' marks the wrapper and, at the root, <html>; the mark leaves with the theme", () => {
    const {container, unmount} = render(
      <Theme theme={always}>
        <p>content</p>
      </Theme>,
    );
    expect(
      container.querySelector('[data-astryx-theme]')?.hasAttribute(MARK),
    ).toBe(true);
    expect(document.documentElement.hasAttribute(MARK)).toBe(true);
    unmount();
    expect(document.documentElement.hasAttribute(MARK)).toBe(false);
  });

  it("'system' marks nothing", () => {
    const {container} = render(
      <Theme theme={system}>
        <p>content</p>
      </Theme>,
    );
    expect(
      container.querySelector('[data-astryx-theme]')?.hasAttribute(MARK),
    ).toBe(false);
    expect(document.documentElement.hasAttribute(MARK)).toBe(false);
  });

  it('a nested theme marks its own wrapper only', () => {
    const {container} = render(
      <Theme theme={system}>
        <Theme theme={always}>
          <p>content</p>
        </Theme>
      </Theme>,
    );
    const wrappers = container.querySelectorAll('[data-astryx-theme]');
    expect(wrappers[0].hasAttribute(MARK)).toBe(false);
    expect(wrappers[1].hasAttribute(MARK)).toBe(true);
    expect(document.documentElement.hasAttribute(MARK)).toBe(false);
  });

  it('a theme extending an always theme keeps it unless it says otherwise', () => {
    const child = defineTheme({
      name: 'StillChild',
      extends: always,
      motion: {tempo: 0.9},
    });
    const freed = defineTheme({
      name: 'StillFreed',
      extends: always,
      motion: {reducedMotion: 'system'},
    });
    const markOf = (theme: typeof child) =>
      render(
        <Theme theme={theme}>
          <p>content</p>
        </Theme>,
      )
        .container.querySelector('[data-astryx-theme]')
        ?.hasAttribute(MARK);
    expect(markOf(child)).toBe(true);
    expect(markOf(freed)).toBe(false);
  });

  it('the server renders the mark, so hydration changes nothing', () => {
    const marked = renderToString(
      <Theme theme={always}>
        <p>content</p>
      </Theme>,
    );
    const plain = renderToString(
      <Theme theme={system}>
        <p>content</p>
      </Theme>,
    );
    expect(marked).toContain(`${MARK}=""`);
    expect(plain).not.toContain(MARK);
  });
});

describe('the motion knobs the animator reads (spec:AST-108 FR3)', () => {
  const TEMPO = 'data-astryx-motion-tempo';
  const CHARACTER = 'data-astryx-motion-character';
  const html = () => document.documentElement;

  afterEach(() => {
    html().removeAttribute(TEMPO);
    html().removeAttribute(CHARACTER);
  });

  it('a theme that sets tempo or character writes them on its wrapper and, at the root, <html>; they leave with the theme', () => {
    const lively = defineTheme({
      name: 'KnobsLively',
      motion: {tempo: 1.2, character: 'crisp'},
    });
    const {container, unmount} = render(
      <Theme theme={lively}>
        <p>content</p>
      </Theme>,
    );
    const wrapper = container.querySelector('[data-astryx-theme]');
    expect(wrapper?.getAttribute(TEMPO)).toBe('1.2');
    expect(wrapper?.getAttribute(CHARACTER)).toBe('crisp');
    expect(html().getAttribute(TEMPO)).toBe('1.2');
    expect(html().getAttribute(CHARACTER)).toBe('crisp');
    unmount();
    expect(html().hasAttribute(TEMPO)).toBe(false);
    expect(html().hasAttribute(CHARACTER)).toBe(false);
  });

  it('writes tempo clamped, and nothing for a theme that sets neither or only a duration scale', () => {
    const knobsOf = (motion: Parameters<typeof defineTheme>[0]['motion']) => {
      const wrapper = render(
        <Theme theme={defineTheme({name: 'KnobsOf', motion})}>
          <p>content</p>
        </Theme>,
      ).container.querySelector('[data-astryx-theme]');
      return [wrapper?.getAttribute(TEMPO), wrapper?.getAttribute(CHARACTER)];
    };
    expect(knobsOf({tempo: 3})).toEqual(['1.5', null]);
    expect(knobsOf({character: 'standard'})).toEqual([null, null]);
    expect(knobsOf({fast: 100, medium: 250, ratio: 0.75})).toEqual([
      null,
      null,
    ]);
    expect(knobsOf(undefined)).toEqual([null, null]);
  });

  it('the server renders them, so hydration changes nothing', () => {
    const markup = renderToString(
      <Theme
        theme={defineTheme({
          name: 'KnobsServer',
          motion: {tempo: 0.8, character: 'expressive'},
        })}>
        <p>content</p>
      </Theme>,
    );
    expect(markup).toContain(`${TEMPO}="0.8"`);
    expect(markup).toContain(`${CHARACTER}="expressive"`);
  });
});
