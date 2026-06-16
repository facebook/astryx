// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vite.test.ts
 * @description Verifies CSS layer-order injection in the XDS Vite plugin,
 *   including the configurable theme layer added for the XDS-prefix migration
 *   (P2380608025). Default theme layer is `xds-theme`; consumers may opt into
 *   a rebranded layer (e.g. `astryx-theme`) before final cutover.
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
  it('defaults to the legacy xds-* layer names', () => {
    const order = getLayerOrder(xdsStylex());
    expect(order).toBe('@layer reset, xds-base, xds-theme, product;');
  });

  it('honors a configured theme layer (astryx-theme opt-in)', () => {
    const order = getLayerOrder(xdsStylex({layers: {theme: 'astryx-theme'}}));
    expect(order).toBe('@layer reset, xds-base, astryx-theme, product;');
  });

  it('honors all configured layer names together', () => {
    const order = getLayerOrder(
      xdsStylex({
        layers: {library: 'astryx-base', theme: 'astryx-theme', product: 'app'},
      }),
    );
    expect(order).toBe('@layer reset, astryx-base, astryx-theme, app;');
  });
});

describe('xdsStylex layer order (legacy API)', () => {
  it('defaults to the legacy xds-* layer names', () => {
    const order = getLayerOrder(xdsStylex({stylexOptions: {}}));
    expect(order).toBe('@layer reset, xds-base, xds-theme, product;');
  });

  it('honors a configured theme layer', () => {
    const order = getLayerOrder(
      xdsStylex({stylexOptions: {}, layers: {theme: 'astryx-theme'}}),
    );
    expect(order).toBe('@layer reset, xds-base, astryx-theme, product;');
  });
});
