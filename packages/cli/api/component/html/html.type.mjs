// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @typedef {object} ComponentHtmlListEntry
 * @property {string} name
 * @property {string} file
 */

/**
 * @typedef {object} ComponentHtmlListResponse
 * @property {'component.html.list'} type
 * @property {ComponentHtmlListEntry[]} data
 */

/**
 * @typedef {object} ComponentHtmlResponse
 * @property {'component.html'} type
 * @property {{component: string, file: string, source: string}} data
 */

/**
 * @typedef {object} ComponentHtmlOptions
 * @property {string} [cwd]
 * @property {boolean} [list]
 */

export {};
