// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Vite virtual inventory integration under Storybook's application root.
 * @input Actual repository discovery and generated owner import URLs
 * @output Transformable owner imports even when Vite root is not the repository
 * @position Existing Storybook config Node test lane; no browser/screenshot claim
 */
import path from 'node:path';
import {createServer} from 'vite';
import {expect, it} from 'vitest';
import {iconRoleInventory} from './icon-role-inventory.mjs';
import {
  discoverIconRoles,
  inventoryFixture,
} from '../../../scripts/lib/icon-role-inventory.mjs';

it.each(['apps/storybook', 'apps/storybook/.storybook'])(
  'serves generated rows and resolves owner modules from nested root %s',
  async appRoot => {
    const root = path.resolve(import.meta.dirname, '../../..');
    const server = await createServer({
      configFile: false,
      root: path.join(root, appRoot),
      plugins: [iconRoleInventory(root)],
      resolve: {
        alias: {
          '@astryxdesign/core/Icon': path.join(
            root,
            'packages/core/src/Icon/index.ts',
          ),
        },
      },
      optimizeDeps: {noDiscovery: true},
      server: {watch: null},
    });
    try {
      const result = await server.transformRequest('virtual:astryx-icon-roles');
      expect(result?.code).toContain('export const slots');
      for (const slot of discoverIconRoles(root).slots)
        expect(result?.code).toContain(slot.slot);
      // Vite may rewrite an in-root /@fs URL to /stories/...; follow the emitted
      // import rather than asserting an incidental URL representation.
      const importUrl = result?.code.match(/^import "([^"]+)";/)?.[1];
      expect(importUrl).toBeDefined();
      const owner = await server.transformRequest(importUrl);
      expect(owner?.code).toContain('declareComponentIconRole');
      expect(result?.code).toContain(inventoryFixture);
    } finally {
      await server.close();
    }
  },
  15000,
);
