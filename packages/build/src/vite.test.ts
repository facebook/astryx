// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.test.ts
 * @description Verifies CSS layer-order injection in the XDS Vite plugin.
 *   The library layer name is configurable (default `astryx-base`); the
 *   theme layer name is fixed at `astryx-theme`.
 */

import {describe, it, expect} from 'vitest';
import {astryxStylex} from './vite';

/** Pull the injected `@layer ...;` order statement out of the plugin set. */
function getLayerOrder(plugins: ReturnType<typeof astryxStylex>): string {
  const layerPlugin = plugins.find(p => p.name === 'astryx-css-layer-order');
  expect(layerPlugin, 'astryx-css-layer-order plugin should exist').toBeTruthy();
  const transform = (layerPlugin as any).transformIndexHtml;
  const tags =
    typeof transform === 'function' ? transform() : transform.handler();
  const styleTag = tags.find((t: any) => t.tag === 'style');
  expect(styleTag, 'a <style> tag should be injected').toBeTruthy();
  return styleTag.children as string;
}

describe('astryxStylex layer order (modern API)', () => {
  it('uses the astryx-* layer names (theme layer is astryx-theme)', () => {
    const order = getLayerOrder(astryxStylex());
    expect(order).toBe('@layer reset, astryx-base, astryx-theme, product;');
  });

  it('honors configured library and product layer names', () => {
    const order = getLayerOrder(
      astryxStylex({layers: {library: 'custom-base', product: 'app'}}),
    );
    // The theme layer stays astryx-theme regardless of other layer config.
    expect(order).toBe('@layer reset, custom-base, astryx-theme, app;');
  });
});

describe('astryxStylex layer order (legacy API)', () => {
  it('uses the astryx-* layer names (theme layer is astryx-theme)', () => {
    const order = getLayerOrder(astryxStylex({stylexOptions: {}}));
    expect(order).toBe('@layer reset, astryx-base, astryx-theme, product;');
  });
});
