// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The `render` subject's adapter: its only access to the environment.
 * It reads the page or rendered file, runs the renderer, and writes results.
 *
 * @position api/render — adapter for api/render/render.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {
  PAGE_EXTENSIONS,
  RenderError,
  renderPage,
} from '../../foundation/render/render-page.mjs';
import {readSourceBlock} from '../../foundation/render/source-block.mjs';
import {isAstryxMarkup, rebuildPage} from '../../foundation/render/reverse.mjs';
import {cliVersion} from '../../foundation/integrations/cli-peer-version.mjs';

export {PAGE_EXTENSIONS};

/** @param {string} cwd @param {string} file */
const shown = (cwd, file) => {
  const rel = path.relative(cwd, file);
  return rel && !rel.startsWith('..') && !path.isAbsolute(rel)
    ? rel.split(path.sep).join('/')
    : file;
};

/**
 * Read a file the caller named, or throw ERR_FILE_NOT_FOUND.
 * @param {string} file absolute
 * @param {string} cwd
 * @returns {Buffer}
 */
function readInput(file, cwd) {
  try {
    if (!fs.statSync(file).isFile()) throw new Error('not a file');
    return fs.readFileSync(file);
  } catch {
    throw new AstryxError(
      `${shown(cwd, file)} does not exist`,
      [],
      ERROR_CODES.ERR_FILE_NOT_FOUND,
    );
  }
}

/**
 * Write a file, creating its folder.
 * @param {string} file absolute
 * @param {string | Buffer} content
 * @param {string} cwd
 */
function writeOutput(file, content, cwd) {
  try {
    fs.mkdirSync(path.dirname(file), {recursive: true});
    fs.writeFileSync(file, content);
  } catch (e) {
    throw new AstryxError(
      `Could not write ${shown(cwd, file)}: ${/** @type {Error} */ (e).message}`,
      [],
      ERROR_CODES.ERR_WRITE_FAILED,
    );
  }
}

/** @param {unknown} e */
function asAstryxError(e) {
  if (e instanceof RenderError) {
    const code = /** @type {import('../../foundation/response/error-codes.mjs').ErrorCode} */ (e.code);
    /** @type {{name: string, reason: string}[]} */
    const suggestions = [];
    if (e.code === 'ERR_RENDER_MISSING_DEPENDENCY' && typeof e.detail?.package === 'string') {
      suggestions.push({name: `npm install ${e.detail.package}`, reason: 'install the package the page imports'});
    }
    return new AstryxError(e.message, suggestions, code);
  }
  const err = /** @type {any} */ (e);
  if (typeof err?.code === 'string' && err.code.startsWith('ERR_RENDER_')) {
    return new AstryxError(err.message, [], err.code);
  }
  return e;
}

/**
 * Render a page module to one HTML file and write it.
 * @param {{cwd: string, input: string, output: string, title?: string}} args absolute paths
 * @returns {Promise<import('./render.type.mjs').RenderPageResponse['data']>}
 */
export async function renderToFile({cwd, input, output, title}) {
  readInput(input, cwd);
  /** @type {import('../../foundation/render/render-page.mjs').RenderedPage} */
  let page;
  try {
    page = await renderPage(input, {title, version: cliVersion()});
  } catch (e) {
    throw asAstryxError(e);
  }
  writeOutput(output, page.html, cwd);
  return {
    input: shown(cwd, input),
    output: shown(cwd, output),
    bytes: Buffer.byteLength(page.html),
    files: page.files,
    stylesheets: page.stylesheets,
    classes: page.classes,
    cssBytes: page.cssBytes,
    images: page.images,
    warnings: page.warnings,
  };
}

/**
 * Turn a rendered HTML file back into a page module.
 * @param {{cwd: string, input: string, output: string | undefined, overwrite: boolean}} args absolute paths
 * @returns {import('./render.type.mjs').RenderReverseResponse['data']}
 */
export function reverseToFile({cwd, input, output, overwrite}) {
  const html = readInput(input, cwd).toString('utf8');
  const block = readSourceBlock(html);
  /** @param {string} file */
  const refuseExisting = file => {
    if (!overwrite && fs.existsSync(file)) {
      throw new AstryxError(
        `${shown(cwd, file)} already exists; pass --overwrite to replace it`,
        [],
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  };
  if (block.found && 'damaged' in block) {
    throw new AstryxError(
      `${shown(cwd, input)} carries an Astryx page source, but ${block.damaged}, so it cannot be given back exactly.`,
      [],
      ERROR_CODES.ERR_RENDER_SOURCE_DAMAGED,
    );
  }
  if (block.found) {
    const {source} = block;
    const target = output ?? path.join(path.dirname(input), source.entry);
    const base = path.dirname(target);
    /** @type {{file: string, bytes: Buffer}[]} */
    const writes = [];
    source.files.forEach((f, i) => {
      const file = i === 0 ? target : path.resolve(base, ...f.path.split('/'));
      const rel = path.relative(cwd, file);
      if (i > 0 && (path.isAbsolute(f.path) || rel.startsWith('..') || path.isAbsolute(rel))) {
        throw new AstryxError(
          `${shown(cwd, input)} would write an embedded file outside the current folder (${f.path}); nothing was written. Run it from a folder that holds the page's project.`,
          [],
          ERROR_CODES.ERR_PATH_TRAVERSAL,
        );
      }
      writes.push({
        file,
        bytes: Buffer.from(f.base64, 'base64'),
      });
    });
    for (const w of writes) refuseExisting(w.file);
    for (const w of writes) writeOutput(w.file, w.bytes, cwd);
    return {
      input: shown(cwd, input),
      mode: 'embedded',
      output: shown(cwd, target),
      files: writes.map(w => shown(cwd, w.file)),
      exact: true,
    };
  }
  if (!isAstryxMarkup(html)) {
    throw new AstryxError(
      `${shown(cwd, input)} is not an Astryx page: it has no embedded source and no Astryx components to rebuild from.`,
      [
        {
          name: 'astryx build "<what the page is>"',
          reason: 'start an Astryx page from a description of it instead',
        },
      ],
      ERROR_CODES.ERR_RENDER_NOT_ASTRYX,
    );
  }
  const target = output ?? path.join(path.dirname(input), `${path.basename(input).replace(/\.[^.]+$/, '')}.tsx`);
  refuseExisting(target);
  const rebuilt = rebuildPage(html, cwd);
  writeOutput(target, rebuilt.source, cwd);
  return {
    input: shown(cwd, input),
    mode: 'rebuilt',
    output: shown(cwd, target),
    files: [shown(cwd, target)],
    exact: false,
    components: rebuilt.components,
    elements: rebuilt.elements,
    unknown: rebuilt.unknown,
    omitted: rebuilt.omitted,
  };
}
