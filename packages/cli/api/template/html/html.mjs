// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Vanilla standalone HTML projection for the template command.
 * @position api/template/html — routed by template.mjs when options.html is set
 */

import {AstryxError} from '../../error.mjs';
import {ERROR_CODES} from '../../../foundation/response/error-codes.mjs';
import {
  listVanillaTemplateHtml,
  readVanillaTemplateHtml,
} from '../_adapter.mjs';

export const ASTRYX_VANILLA_CDN_REF =
  'd5d638c97f617e7ac7dad7357e7acaabcbc7c6df';
export const ASTRYX_VANILLA_CDN_PLACEHOLDER = '__ASTRYX_VANILLA_CDN__';

/** @param {string} ref @returns {string} */
export function astryxVanillaCdnBase(ref) {
  if (
    !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(ref) ||
    ref.includes('..') ||
    ref.includes('//')
  ) {
    throw new AstryxError(
      `Invalid vanilla CDN ref "${ref}"`,
      undefined,
      ERROR_CODES.ERR_INVALID_ARGUMENT,
    );
  }
  return `https://cdn.jsdelivr.net/gh/facebook/astryx@${ref}/packages/vanilla/dist`;
}

/**
 * @param {string|undefined} name
 * @param {{cwd?: string, list?: boolean, cdnRef?: string}} [options]
 * @returns {import('./html.type.mjs').TemplateHtmlResponse | import('./html.type.mjs').TemplateHtmlListResponse}
 */
export function templateHtml(name, options = {}) {
  const {
    cwd = process.cwd(),
    list = false,
    cdnRef = ASTRYX_VANILLA_CDN_REF,
  } = options;
  if (list) {
    return {type: 'template.html.list', data: listVanillaTemplateHtml(cwd)};
  }
  const raw = readVanillaTemplateHtml(/** @type {string} */ (name), cwd);
  const cdnBase = astryxVanillaCdnBase(cdnRef);
  return {
    type: 'template.html',
    data: {
      template: raw.template,
      file: raw.file,
      cdnRef,
      cdnBase,
      source: raw.source.replaceAll(ASTRYX_VANILLA_CDN_PLACEHOLDER, cdnBase),
    },
  };
}
