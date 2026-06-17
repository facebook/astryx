// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.test.ts
 * @description Verifies CSS layer-order injection in the XDS Vite plugin.
 *   The theme layer name is intentionally NOT configurable — it stays
 *   `xds-theme` for the whole compatibility window and is rebranded only at
 *   the final cutover (XDS-prefix migration P2380608025), so consumers never
 *   have to touch their `@layer` order line until then.
 */

import {describe, it, expect} from 'vitest';
import {xdsStylex} from './vite';

/** Pull the injected `@layer ...;` order statement out of the plugin set. */
function getLayerOrder(plugins: ReturnType<typeof xdsStylex>): string {
  const layerPlugin = plugins.find(p => p.name === 'xds-css-layer-order');
  expect(layerPlugin, 'xds-css-layer-order plugin should exist').toBeTruthy();
  const transform = (layerPlugin as any).transformIndexHtml;
  const tags =
    typeof transform === 'function' ? transform() : transform.handler();
  const styleTag = tags.find((t: any) => t.tag === 'style');
  expect(styleTag, 'a <style> tag should be injected').toBeTruthy();
  return styleTag.children as string;
}

describe('xdsStylex layer order (modern API)', () => {
  it('uses the xds-* layer names (theme layer is xds-theme)', () => {
    const order = getLayerOrder(xdsStylex());
    expect(order).toBe('@layer reset, xds-base, xds-theme, product;');
  });

  it('honors configured library and product layer names', () => {
    const order = getLayerOrder(
      xdsStylex({layers: {library: 'astryx-base', product: 'app'}}),
    );
    // The theme layer stays xds-theme regardless of other layer config.
    expect(order).toBe('@layer reset, astryx-base, xds-theme, app;');
  });
});

describe('xdsStylex layer order (legacy API)', () => {
  it('uses the xds-* layer names (theme layer is xds-theme)', () => {
    const order = getLayerOrder(xdsStylex({stylexOptions: {}}));
    expect(order).toBe('@layer reset, xds-base, xds-theme, product;');
  });
});
