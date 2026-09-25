// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Contract for every path in the original Next static export.
 * @input Checked Next HTML manifest, authored pages and generated wrappers.
 * @output Fails if a deep link, layout group or trailing slash disappears.
 * @position Collected by the repository's node Vitest project.
 */

import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';
import {categories} from './app/sandboxPages';
import {canHydrate} from './hydration-policy';
import {
  discoverRoutes,
  exportedHtmlPath,
  templateAssetBase,
} from '../scripts/route-manifest.mjs';
import oracle from '../scripts/next-export-routes.json';

const app = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'app');
const routes = discoverRoutes(
  app,
  categories.map(category => category.slug),
);

// The former Next export also emitted a synthetic /404/ page. The Vite exporter
// emits it separately from the application routes, alongside 404.html.
describe('Sandbox static export contract', () => {
  it('matches every Next HTML route rather than just representative samples', () => {
    expect([...routes.map(item => item.route), '/404/'].sort()).toEqual(
      oracle.routes,
    );
    expect(routes.length).toBe(oracle.routes.length - 1);
  });

  it('preserves nested, fullscreen, raw, category, and audit layouts', () => {
    expect(routes.find(item => item.route === '/')).toMatchObject({
      group: 'sandbox',
    });
    expect(
      routes.find(item => item.route === '/pages/motion-lab/bugs/'),
    ).toMatchObject({group: 'sandbox'});
    expect(
      routes.find(item => item.route === '/pages/component-scores/'),
    ).toMatchObject({group: 'sandbox'});
    expect(
      routes.find(item => item.route === '/pages/mobile-prototypes/'),
    ).toMatchObject({group: 'raw'});
    expect(
      routes.find(item => item.route === '/templates/work-item-detail/'),
    ).toMatchObject({group: 'fullscreen'});
    expect(
      routes.find(item => item.route === '/components-patterns/'),
    ).toMatchObject({slug: 'components-patterns'});
    expect(exportedHtmlPath('/templates/TopNavHeadingShowcase/')).toBe(
      'templates/TopNavHeadingShowcase/index.html',
    );
    expect(exportedHtmlPath('/')).toBe('index.html');
  });

  it('prefixes template images exactly once for /sandbox/ while leaving local paths portable', () => {
    expect(templateAssetBase('')).toBe('');
    expect(templateAssetBase('/sandbox')).toBe('/sandbox/template-assets');
    expect(
      templateAssetBase('/sandbox', '/preview/sandbox/template-assets'),
    ).toBe('/preview/sandbox/template-assets');
  });

  it('avoids mismatched hydration for query-dependent Shell Lab and embed URLs', () => {
    expect(canHydrate('/pages/shell-lab/', '?variant=wash')).toBe(false);
    expect(canHydrate('/templates/login-sso/', '?embed=1&theme=stone')).toBe(
      false,
    );
    expect(canHydrate('/pages/component-scores/', '?filter=all')).toBe(true);
    expect(canHydrate('/pages/shell-lab/', '')).toBe(true);
  });

  it('does not turn unknown URLs, dynamic segments or traversal into a 200 fallback', () => {
    expect(routes.some(item => item.route === '/pages/does-not-exist/')).toBe(
      false,
    );
    expect(() => exportedHtmlPath('/../outside/')).toThrow();
    expect(() => exportedHtmlPath('/pages/no-slash')).toThrow();
  });
});
