// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file The `render` subject's adapter: its only access to the environment.
 * It reads the page or rendered file, runs the renderer, and writes results.
 *
 * @position api/render — adapter for api/render/render.mjs
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import {createRequire} from 'node:module';
import {AstryxError} from '../error.mjs';
import {ERROR_CODES} from '../../foundation/response/error-codes.mjs';
import {
  PAGE_EXTENSIONS,
  RenderError,
  renderPage,
} from '../../foundation/render/render-page.mjs';
import {readSourceBlock} from '../../foundation/render/source-block.mjs';
import {embeddedPathProblem} from '../../foundation/render/embedded-files.mjs';
import {reachableFiles, receivingAliases} from '../../foundation/render/embedded-imports.mjs';
import {isAstryxMarkup} from '../../foundation/render/html-reader.mjs';
import {rebuildPage} from '../../foundation/render/rebuild.mjs';
import {cliVersion} from '../../foundation/integrations/cli-peer-version.mjs';
import {assertWithin, PathSafetyError} from '../../foundation/fs/path-safety.mjs';

export {PAGE_EXTENSIONS, embeddedPathProblem};

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
 * Whether @astryxdesign/core resolves from a folder (or the nearest existing
 * folder above it).
 * @param {string} dir
 */
function resolvesCore(dir) {
  let d = dir;
  while (!fs.existsSync(d) && path.dirname(d) !== d) d = path.dirname(d);
  try {
    createRequire(path.join(d, 'noop.js')).resolve('@astryxdesign/core');
    return true;
  } catch {
    return false;
  }
}

/**
 * Refuse a write outside the current folder, symlinks followed (cli-surface
 * INV10).
 * @param {string} file absolute
 * @param {string} cwd
 * @param {string} what
 * @returns {string}
 */
function confined(file, cwd, what) {
  try {
    return assertWithin(file, cwd, {allowAbsolute: true, label: what});
  } catch (e) {
    if (e instanceof PathSafetyError) {
      throw new AstryxError(
        `${what} ${shown(cwd, file)} is outside the current folder; nothing was written. Write inside the folder you run the command from.`,
        [],
        ERROR_CODES.ERR_PATH_TRAVERSAL,
      );
    }
    throw e;
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
  confined(output, cwd, 'The output');
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
  /** @param {string[]} files */
  const refuseExisting = files => {
    if (overwrite) return;
    const existing = files.filter(file => fs.existsSync(file));
    if (existing.length > 0) {
      throw new AstryxError(
        `${existing.map(file => shown(cwd, file)).join(', ')} already exist${existing.length === 1 ? 's' : ''}; nothing was written. Pass --overwrite to replace ${existing.length === 1 ? 'it' : 'them'}.`,
        [],
        ERROR_CODES.ERR_FILE_EXISTS,
      );
    }
  };
  /** A page is never written over a configuration file such as vite.config.ts. @param {string} file */
  const refuseConfigTarget = file => {
    const problem = embeddedPathProblem(path.basename(file), {page: true});
    if (problem) {
      throw new AstryxError(
        `${shown(cwd, file)} is not a page module file name a reverse writes (${problem.reason}); nothing was written.`,
        [],
        ERROR_CODES.ERR_INVALID_ARGUMENT,
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
    // The entry name comes from the file, so only its base name is used.
    const requested = output ?? path.join(path.dirname(input), path.basename(source.entry));
    // A file someone sends is untrusted: it may carry only what a render
    // embeds (the page, and the stylesheets, JSON and images it imports).
    source.files.forEach((f, i) => {
      const problem = embeddedPathProblem(f.path, {page: i === 0});
      if (problem) {
        throw new AstryxError(
          `${shown(cwd, input)} carries ${problem.reason}, which a render never embeds; nothing was written.`,
          [],
          ERROR_CODES[problem.code],
        );
      }
    });
    refuseConfigTarget(requested);
    const seen = new Set();
    for (const f of source.files) {
      const key = f.path.toLowerCase();
      if (seen.has(key)) {
        throw new AstryxError(
          `${shown(cwd, input)} lists ${f.path} more than once, which a render never does; nothing was written.`,
          [],
          ERROR_CODES.ERR_RENDER_SOURCE_DAMAGED,
        );
      }
      seen.add(key);
    }
    // Only files the page reaches through its own imports are written: a
    // file the page never imports is not part of it, whatever its name.
    const reached = reachableFiles(source.files, {aliases: receivingAliases(path.dirname(requested))});
    const stray = source.files.filter(f => !reached.has(f.path)).map(f => f.path);
    if (stray.length > 0) {
      throw new AstryxError(
        `${shown(cwd, input)} carries ${stray.length === 1 ? 'a file' : 'files'} the page does not import (${stray.join(', ')}), which a render never embeds; nothing was written. A file reached through a path alias needs the same alias in this project's tsconfig.json or jsconfig.json.`,
        [],
        ERROR_CODES.ERR_RENDER_SOURCE_DAMAGED,
      );
    }
    // Each file the page reaches by a relative import goes where that import
    // finds it from the page's new folder, so every relative import still
    // resolves wherever the page lands. A file reached through an alias also
    // goes where this project's alias points. When the layout would leave
    // the current folder, it is kept under the requested page's folder.
    const entryDir = path.posix.dirname(source.files[0].path);
    /** @param {string} anchor @param {string} p */
    const placeFrom = (anchor, p) => path.resolve(anchor, path.posix.relative(entryDir, p));
    const inside = (/** @type {string} */ file) => {
      const rel = path.relative(cwd, file);
      return !rel.startsWith('..') && !path.isAbsolute(rel);
    };
    let anchor = path.dirname(requested);
    const layout = source.files.filter(f => reached.get(f.path)?.relative);
    if (!layout.every(f => inside(placeFrom(anchor, f.path)))) {
      anchor = path.join(path.dirname(requested), ...entryDir.split('/').filter(seg => seg !== '.'));
    }
    const target = path.join(anchor, path.basename(requested));
    /** @type {{file: string, bytes: Buffer}[]} */
    const writes = [];
    const placed = new Set();
    source.files.forEach((f, i) => {
      const reach = /** @type {import('../../foundation/render/embedded-imports.mjs').Reach} */ (reached.get(f.path));
      const spots = [
        ...(i === 0 ? [target] : reach.relative ? [placeFrom(anchor, f.path)] : []),
        ...reach.aliased,
      ];
      for (const file of spots) {
        if (placed.has(file)) continue;
        placed.add(file);
        confined(file, cwd, i === 0 ? 'The page' : 'The embedded file');
        writes.push({file, bytes: Buffer.from(f.base64, 'base64')});
      }
    });
    refuseExisting(writes.map(w => w.file));
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
      `${shown(cwd, input)} is not an Astryx page: it has no embedded source and no Astryx components to rebuild from. To start an Astryx page like it, run astryx build "<what the page is>".`,
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
  refuseConfigTarget(target);
  confined(target, cwd, 'The page');
  refuseExisting([target]);
  // Components resolve from where the page will live, then from the HTML
  // file's folder, then from the current folder.
  const from =
    [path.dirname(target), path.dirname(input), cwd].find(d => resolvesCore(d)) ?? cwd;
  const rebuilt = rebuildPage(html, from);
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
