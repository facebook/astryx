// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file layerHost.test.ts
 * @input Tests resolveLayerHost
 * @output Coverage for which ancestor a layer is hosted in
 * @position Test for /packages/core/src/Layer/layerHost.ts
 */

import {describe, it, expect, afterEach} from 'vitest';
import {resolveLayerHost} from './layerHost';

function mount(html: string): HTMLElement {
  const root = document.createElement('div');
  root.id = 'root';
  root.innerHTML = html;
  document.body.appendChild(root);
  return root;
}

afterEach(() => {
  document.getElementById('root')?.remove();
});

describe('resolveLayerHost', () => {
  it('returns null without a trigger', () => {
    expect(resolveLayerHost(null)).toBeNull();
  });

  it('hosts in the parent when the parent can hold the layer', () => {
    const root = mount('<div id="host"><button id="t">t</button></div>');
    const host = resolveLayerHost(root.querySelector('#t'));

    expect(host).toBe(root.querySelector('#host'));
  });

  it.each([
    ['paragraph', '<p><span id="t">t</span></p>'],
    ['heading', '<h2><span id="t">t</span></h2>'],
    ['link', '<a href="#x"><span id="t">t</span></a>'],
    ['button', '<button><span id="t">t</span></button>'],
    ['label', '<label><span id="t">t</span></label>'],
    [
      'nested inline formatting',
      '<p><em><b><span id="t">t</span></b></em></p>',
    ],
  ])('walks out of a %s', (_name, markup) => {
    const root = mount(`<div id="host">${markup}</div>`);
    const host = resolveLayerHost(root.querySelector('#t'));

    expect(host).toBe(root.querySelector('#host'));
  });

  it('stops at the nearest safe ancestor rather than the body', () => {
    const root = mount(
      '<section id="outer"><li id="host"><p><span id="t">t</span></p></li></section>',
    );
    const host = resolveLayerHost(root.querySelector('#t'));

    // The nearest safe ancestor keeps the layer inside the trigger's theme
    // scope and next to it in the tab order.
    expect(host).toBe(root.querySelector('#host'));
    expect(host).not.toBe(document.body);
  });
});
