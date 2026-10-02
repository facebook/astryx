// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Vanilla HTML projection for the component command.
 * @position api/component/html — routed by component.mjs when options.html is set
 */

import {
  listVanillaComponentHtml,
  readVanillaComponentHtml,
} from '../_adapter.mjs';

/**
 * @param {string|undefined} name
 * @param {{cwd?: string, list?: boolean}} [options]
 * @returns {import('./html.type.mjs').ComponentHtmlResponse | import('./html.type.mjs').ComponentHtmlListResponse}
 */
export function componentHtml(name, options = {}) {
  const {cwd = process.cwd(), list = false} = options;
  if (list) {
    return {type: 'component.html.list', data: listVanillaComponentHtml(cwd)};
  }
  const data = readVanillaComponentHtml(/** @type {string} */ (name), cwd);
  return {type: 'component.html', data};
}
