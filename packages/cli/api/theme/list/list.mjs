// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Theme-list projections. `themeList()` retains its historical synchronous
 * bundled-only API contract. `themeListAvailable()` is the project-aware command
 * seam that adds installed integration themes and owner packages.
 */

import {listAvailableThemes, listThemes} from '../_adapter.mjs';

/**
 * List themes bundled with this CLI build.
 * @returns {import('../theme.type.mjs').ThemeListResponse}
 */
export function themeList() {
  return {
    type: 'theme.list',
    data: listThemes().map(theme => ({
      slug: theme.slug,
      displayName: theme.displayName,
      description: theme.description,
      maintained: theme.maintained,
    })),
  };
}

/**
 * List bundled and installed integration themes available to this project.
 * @param {{cwd?: string, package?: string}} [options]
 * @returns {Promise<import('../theme.type.mjs').ThemeListResponse>}
 */
export async function themeListAvailable(options = {}) {
  const themes = await listAvailableThemes(options.cwd);
  return {
    type: 'theme.list',
    data: themes
      .filter(theme => options.package == null || theme.package === options.package)
      .map(theme => ({
        slug: theme.slug,
        displayName: theme.displayName,
        description: theme.description,
        maintained: theme.maintained,
        package: theme.package,
      })),
  };
}
