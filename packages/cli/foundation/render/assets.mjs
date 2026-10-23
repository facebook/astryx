// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Local files as data: URIs for `astryx experimental render`, so the
 * rendered page needs nothing beside it.
 *
 * @position foundation/render — used by page-worker.mjs and render-page.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';

/** The largest single file inlined into a rendered page. */
export const MAX_ASSET_BYTES = 8 * 1024 * 1024;

/** @type {Record<string, string>} */
const MIME = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  woff: 'font/woff',
  woff2: 'font/woff2',
  ttf: 'font/ttf',
  otf: 'font/otf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
};

/** @param {string} file */
export const isAssetPath = file =>
  Object.hasOwn(MIME, path.extname(file).slice(1).toLowerCase());

/** An error carrying a render error code. */
export class RenderAssetError extends Error {
  /**
   * @param {string} code
   * @param {string} message
   * @param {Record<string, unknown>} [detail]
   */
  constructor(code, message, detail) {
    super(message);
    this.code = code;
    this.detail = detail;
  }
}

/**
 * Read a local file as a data: URI.
 * @param {string} file absolute path
 * @returns {string}
 */
export function assetDataUri(file) {
  /** @type {fs.Stats} */
  let stat;
  try {
    stat = fs.statSync(file);
  } catch {
    throw new RenderAssetError(
      'ERR_FILE_NOT_FOUND',
      `The page uses ${file}, which does not exist`,
      {module: file},
    );
  }
  if (stat.size > MAX_ASSET_BYTES) {
    throw new RenderAssetError(
      'ERR_RENDER_ASSET_TOO_LARGE',
      `${path.basename(file)} is ${(stat.size / 1048576).toFixed(1)} MB; a rendered page inlines files up to ${MAX_ASSET_BYTES / 1048576} MB each. Use a smaller copy of it.`,
      {file, bytes: stat.size, limit: MAX_ASSET_BYTES},
    );
  }
  const mime = MIME[path.extname(file).slice(1).toLowerCase()] ?? 'application/octet-stream';
  return `data:${mime};base64,${fs.readFileSync(file).toString('base64')}`;
}
