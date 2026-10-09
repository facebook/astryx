// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Ephemeral icon inventory module for the existing Storybook Vite builder.
 * @input Canonical component declarations, discovered by the repository conformance reader
 * @output Owner side-effect imports and generated slot rows; nothing written to disk
 * @position Storybook-only plugin; no registry, manifest or public Core API
 */
import path from 'node:path';
import {
  discoverIconRoles,
  generateIconInventoryModule,
  iconSourceFiles,
} from '../../../scripts/lib/icon-role-inventory.mjs';

const id = 'virtual:astryx-icon-roles';
const resolved = '\0' + id;

/** @param {string} root @returns {import('vite').Plugin} */
export function iconRoleInventory(root) {
  return {
    name: 'astryx-icon-role-inventory',
    resolveId(source) {
      if (source === id) return resolved;
    },
    load(source) {
      if (source !== resolved) return;
      const files = iconSourceFiles(root);
      for (const file of files) this.addWatchFile(path.join(root, file));
      return generateIconInventoryModule(discoverIconRoles(root, files), root);
    },
    configureServer(server) {
      // Add/remove declarations as well as edit them; never serve a stale roster.
      server.watcher.on('all', (_event, file) => {
        if (
          !/\.tsx?$/.test(file) ||
          (!file.includes('/src/') && !file.includes('/icon-role-inventory/'))
        )
          return;
        const module = server.moduleGraph.getModuleById(resolved);
        if (module) {
          server.moduleGraph.invalidateModule(module);
          server.ws.send({type: 'full-reload'});
        }
      });
    },
  };
}
