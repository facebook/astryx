// Copyright (c) Meta Platforms, Inc. and affiliates.

import {afterEach, describe, expect, it, vi} from 'vitest';
import {getScrollableAncestor} from './getScrollableAncestor';

function mount(html: string): HTMLElement {
  const root = document.createElement('div');
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

/** jsdom has no layout engine: give an element a real overflow (or none). */
function setOverflow(
  el: Element | null,
  scrollHeight: number,
  clientHeight: number,
) {
  Object.defineProperty(el, 'scrollHeight', {
    configurable: true,
    value: scrollHeight,
  });
  Object.defineProperty(el, 'clientHeight', {
    configurable: true,
    value: clientHeight,
  });
}

describe('getScrollableAncestor', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('returns the nearest overflowing ancestor whose overflow-y can scroll', () => {
    const root = mount(`
      <div id="outer" style="overflow-y: scroll">
        <div id="wrapper">
          <div id="inner" style="overflow-y: auto">
            <p id="target">text</p>
          </div>
        </div>
      </div>`);
    setOverflow(root.querySelector('#outer'), 4000, 500);
    setOverflow(root.querySelector('#inner'), 900, 500);

    expect(getScrollableAncestor(root.querySelector('#target'))).toBe(
      root.querySelector('#inner'),
    );
  });

  it('starts at the parent, never the element itself', () => {
    const root = mount(`
      <div id="scroller" style="overflow-y: auto">
        <div id="self" style="overflow-y: auto"></div>
      </div>`);
    setOverflow(root.querySelector('#scroller'), 4000, 500);
    setOverflow(root.querySelector('#self'), 4000, 500);

    expect(getScrollableAncestor(root.querySelector('#self'))).toBe(
      root.querySelector('#scroller'),
    );
  });

  it('returns null without a scrolling ancestor', () => {
    const root = mount(`<div><p id="target">text</p></div>`);
    setOverflow(root, 4000, 500);

    expect(getScrollableAncestor(root.querySelector('#target'))).toBeNull();
    expect(getScrollableAncestor(null)).toBeNull();
  });

  it('accepts the deprecated overflow-y: overlay', () => {
    const root = mount(`<div id="legacy"><p id="target">text</p></div>`);
    const legacy = root.querySelector('#legacy') as HTMLElement;
    setOverflow(legacy, 4000, 500);
    // jsdom rejects `overlay` as an inline value; older Chromium still
    // computes it for overlay scrollbars, so stub the computed style.
    const realGetComputedStyle = window.getComputedStyle.bind(window);
    vi.spyOn(window, 'getComputedStyle').mockImplementation((el, pseudo) =>
      el === legacy
        ? ({overflowY: 'overlay'} as CSSStyleDeclaration)
        : realGetComputedStyle(el, pseudo ?? undefined),
    );

    expect(getScrollableAncestor(root.querySelector('#target'))).toBe(legacy);
  });

  it('skips a scroller that does not overflow yet and keeps climbing', () => {
    const root = mount(`
      <div id="outer" style="overflow-y: auto">
        <div id="inner" style="overflow-y: auto"><p id="target">text</p></div>
      </div>`);
    setOverflow(root.querySelector('#outer'), 4000, 500);
    setOverflow(root.querySelector('#inner'), 500, 500);

    expect(getScrollableAncestor(root.querySelector('#target'))).toBe(
      root.querySelector('#outer'),
    );
  });

  it('returns null when nothing overflows', () => {
    const root = mount(`
      <div style="overflow-y: auto"><p id="target">text</p></div>`);

    expect(getScrollableAncestor(root.querySelector('#target'))).toBeNull();
  });

  it('accepts a scroller with no overflow yet when requireOverflow is false', () => {
    // A list that has not overflowed its scroller still needs that
    // scroller, not the page, as its compensation target.
    const root = mount(`
      <div id="outer" style="overflow-y: auto">
        <div id="inner" style="overflow-y: auto"><p id="target">text</p></div>
      </div>`);
    setOverflow(root.querySelector('#outer'), 4000, 500);
    setOverflow(root.querySelector('#inner'), 500, 500);

    expect(
      getScrollableAncestor(root.querySelector('#target'), {
        requireOverflow: false,
      }),
    ).toBe(root.querySelector('#inner'));
  });
});
