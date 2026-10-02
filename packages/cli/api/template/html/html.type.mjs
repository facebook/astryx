// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @typedef {object} TemplateHtmlListEntry
 * @property {string} id
 * @property {string} file
 */

/**
 * @typedef {object} TemplateHtmlListResponse
 * @property {'template.html.list'} type
 * @property {TemplateHtmlListEntry[]} data
 */

/**
 * @typedef {object} TemplateHtmlResponse
 * @property {'template.html'} type
 * @property {{template: string, file: string, cdnRef: string, cdnBase: string, source: string}} data
 */

/**
 * @typedef {object} TemplateHtmlOptions
 * @property {string} [cwd]
 * @property {boolean} [list]
 * @property {string} [cdnRef]
 */

export {};
