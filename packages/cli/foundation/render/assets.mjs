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

/**
 * Whether bytes really are the image, font or media file their extension
 * says: their leading bytes match that format (an SVG is XML with an <svg>
 * element). A received file's carried assets are written only when they are.
 * @param {string} file name, for its extension
 * @param {Buffer} bytes
 */
export function isAssetBytes(file, bytes) {
  const ext = path.extname(file).slice(1).toLowerCase();
  const at = (/** @type {number} */ i, /** @type {string} */ text) =>
    bytes.subarray(i, i + text.length).toString('latin1') === text;
  switch (ext) {
    case 'png':
      return at(0, '\x89PNG\r\n\x1a\n');
    case 'jpg':
    case 'jpeg':
      return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
    case 'gif':
      return at(0, 'GIF87a') || at(0, 'GIF89a');
    case 'webp':
      return at(0, 'RIFF') && at(8, 'WEBP');
    case 'avif':
      return at(4, 'ftyp') && (at(8, 'avif') || at(8, 'avis'));
    case 'bmp':
      return at(0, 'BM');
    case 'ico':
      return bytes[0] === 0 && bytes[1] === 0 && bytes[2] === 1 && bytes[3] === 0;
    case 'svg': {
      const head = bytes.subarray(0, 4096).toString('utf8').replace(/^\uFEFF/, '').trimStart();
      return head.startsWith('<') && /<svg[\s>]/i.test(head);
    }
    case 'woff':
      return at(0, 'wOFF');
    case 'woff2':
      return at(0, 'wOF2');
    case 'ttf':
      return at(0, '\x00\x01\x00\x00') || at(0, 'true');
    case 'otf':
      return at(0, 'OTTO');
    case 'mp4':
      return at(4, 'ftyp');
    case 'webm':
      return bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3;
    case 'mp3':
      return at(0, 'ID3') || (bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0);
    case 'wav':
      return at(0, 'RIFF') && at(8, 'WAVE');
    default:
      return false;
  }
}
