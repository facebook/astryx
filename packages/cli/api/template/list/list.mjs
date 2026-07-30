// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file `template.list` leaf — list discovered templates (page + block),
 * optionally narrowed by `--type` / `--package`.
 *
 * @position api/template/list — pure projection over an already-discovered
 *   template set; the template dispatcher routes `--list` (and the no-name,
 *   no-skeleton default) here.
 */

import {pkgOf} from '../_adapter.mjs';

/**
 * Project a discovered template set into the `template.list` envelope.
 * @param {import('../_adapter.mjs').DiscoveredTemplate[]} templates
 * @param {{type?: 'page' | 'block', package?: string}} [options]
 * @returns {import('../../../types/template').TemplateListResponse}
 */
export function templateList(templates, options = {}) {
  const {type, package: packageFilter} = options;
  let filtered = templates;
  if (type) filtered = filtered.filter(t => t.type === type);
  if (packageFilter) filtered = filtered.filter(t => pkgOf(t) === packageFilter);
  return {
    type: 'template.list',
    data: filtered.map(t => ({
      id: t.dirName,
      name: t.name,
      // `displayName` retained for back-compat with existing consumers.
      displayName: t.name,
      description: t.description,
      type: t.type,
      package: pkgOf(t),
      category: t.category || undefined,
      componentsUsed: t.componentsUsed ?? undefined,
      // Discovery always sets isReady (defaulting to true), so `?? true` never
      // changes the emitted value — it only satisfies the required-boolean
      // field type where the DiscoveredTemplate typedef leaves it optional.
      isReady: t.isReady ?? true,
      scaffold: t.scaffold ?? false,
    })),
  };
}
