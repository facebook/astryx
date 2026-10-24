// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerExitCopy.test.ts
 * @input vitest (jsdom), layerExitCopy
 * @output Checks the static copy a closing layer leaves for its close to
 *   play on: out of reach and out of the accessibility tree, no ids and no
 *   popover, on the layer's box even inside a containing block, scrolled
 *   where the layer was
 * @position Testing; the menu's and the popover's closes on a real
 *   compositor are proven in their own browser specs
 */

import {afterEach, describe, expect, it} from 'vitest';
import {placeLayerExitCopy} from './layerExitCopy';

const BOX = {left: 41, top: 204, width: 320, height: 253};
const ATTRIBUTE = 'data-test-exit';

function layer(): HTMLElement {
  const host = document.createElement('section');
  document.body.appendChild(host);
  const element = document.createElement('div');
  element.id = 'layer';
  element.setAttribute('popover', 'auto');
  element.style.setProperty('position-anchor', '--trigger');
  element.style.setProperty('scale', '0.5 0.4');
  element.style.setProperty('opacity', '0.3');
  element.style.setProperty('transition', 'opacity 1s');
  element.innerHTML =
    '<div id="dialog" role="dialog"><div id="list" class="list"><p>One</p></div></div>';
  host.appendChild(element);
  return element;
}

/** jsdom has no layout: a copy stands where its inline box says, shifted. */
function standAt(copy: HTMLElement, shift = {x: 0, y: 0}) {
  copy.getBoundingClientRect = () => {
    const left = parseFloat(copy.style.left) + shift.x;
    const top = parseFloat(copy.style.top) + shift.y;
    const width = parseFloat(copy.style.width);
    const height = parseFloat(copy.style.height);
    return {
      left,
      top,
      width,
      height,
      x: left,
      y: top,
      right: left + width,
      bottom: top + height,
      toJSON: () => ({}),
    };
  };
}

describe('placeLayerExitCopy', () => {
  const originalAfter = Element.prototype.after;
  afterEach(() => {
    Element.prototype.after = originalAfter;
    document.body.innerHTML = '';
  });

  /** Places the copy, giving it a layout box as it is inserted. */
  function place(element: HTMLElement, shift?: {x: number; y: number}) {
    Element.prototype.after = function (this: Element, ...nodes) {
      for (const node of nodes) {
        if (node instanceof HTMLElement) {
          standAt(node, shift);
        }
      }
      return originalAfter.apply(this, nodes);
    };
    return placeLayerExitCopy(element, BOX, ATTRIBUTE);
  }

  it('puts a static copy right after the layer, out of reach and out of the accessibility tree', () => {
    const element = layer();
    const copy = place(element);
    expect(copy.previousElementSibling).toBe(element);
    expect(copy.hasAttribute(ATTRIBUTE)).toBe(true);
    expect(copy.getAttribute('aria-hidden')).toBe('true');
    expect(copy.hasAttribute('inert')).toBe(true);
    expect(copy.hasAttribute('popover')).toBe(false);
    expect(copy.id).toBe('');
    expect(copy.querySelectorAll('[id]')).toHaveLength(0);
    // The content is the layer's, classes and all.
    expect(copy.querySelector('.list')?.textContent).toBe('One');
    expect(copy.style.getPropertyValue('pointer-events')).toBe('none');
    expect(copy.style.getPropertyValue('display')).toBe('block');
  });

  it('stands on the layer\u2019s box, free of the live layer\u2019s anchoring and motion', () => {
    const element = layer();
    const copy = place(element);
    expect(copy.style.getPropertyValue('position')).toBe('fixed');
    expect(copy.style.getPropertyValue('left')).toBe('41px');
    expect(copy.style.getPropertyValue('top')).toBe('204px');
    expect(copy.style.getPropertyValue('width')).toBe('320px');
    expect(copy.style.getPropertyValue('height')).toBe('253px');
    for (const property of [
      'position-anchor',
      'scale',
      'opacity',
      'transition',
    ]) {
      expect(copy.style.getPropertyValue(property), property).toBe('');
    }
    expect(copy.style.getPropertyValue('animation-name')).toBe('none');
  });

  it('corrects for an ancestor that is a containing block for fixed boxes', () => {
    const element = layer();
    // A transformed ancestor moves the fixed copy 30 px right and 12 px down.
    const copy = place(element, {x: 30, y: 12});
    expect(copy.style.getPropertyValue('left')).toBe('11px');
    expect(copy.style.getPropertyValue('top')).toBe('192px');
  });

  it('keeps scrolled content where it was scrolled to', () => {
    const element = layer();
    const list = element.querySelector<HTMLElement>('.list')!;
    list.scrollTop = 120;
    const copy = place(element);
    expect(copy.querySelector<HTMLElement>('.list')!.scrollTop).toBe(120);
  });
});
