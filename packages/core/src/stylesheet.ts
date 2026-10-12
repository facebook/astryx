// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file stylesheet.ts
 * @input A precompiled package stylesheet (`astryx.css`, `lab.css`,
 *   `charts.css` or `richtext.css`) and the module files a production build
 *   contains.
 * @output That stylesheet with only the rules those modules use.
 * @position Node.js build-time helper behind the `@astryxdesign/core/stylesheet`
 *   subpath. It is never part of the package's root entry, so browser bundles
 *   never load it.
 *
 * The package build writes `<stylesheet>.json` beside each stylesheet: the
 * stylesheet's digest, where its rules sit, and the rules each module renders
 * with. That data is private to this module.
 *
 * SYNC: scripts/build-css.mjs (writes the data this module reads)
 */

import {createHash} from 'node:crypto';
import {readFileSync, realpathSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

interface StylesheetIndex {
  sha256: string;
  rules: {start: number; count: number};
  modules: Record<string, number[]>;
}

function toPath(file: string | URL): string {
  // Read `href` rather than test `instanceof URL`: a URL can come from another
  // realm, such as a test environment's own URL class.
  const value = typeof file === 'string' ? file : file.href;
  return value.startsWith('file:') ? fileURLToPath(value) : path.resolve(value);
}

function realPath(file: string): string | null {
  try {
    return realpathSync(file);
  } catch {
    return null;
  }
}

function readIndex(stylesheet: string, css: string): StylesheetIndex {
  let index: StylesheetIndex;
  try {
    index = JSON.parse(readFileSync(`${stylesheet}.json`, 'utf8'));
  } catch (error) {
    throw new Error(
      `${stylesheet} has no subset data beside it (${stylesheet}.json), so it cannot be subset.`,
      {cause: error},
    );
  }
  if (createHash('sha256').update(css).digest('hex') !== index.sha256) {
    throw new Error(
      `${stylesheet} differs from the stylesheet its subset data describes. Reinstall or rebuild the package instead of editing the stylesheet.`,
    );
  }
  return index;
}

/**
 * Returns a precompiled Astryx stylesheet with only the rules the given
 * modules use, for an app that loads it in place of the whole stylesheet.
 *
 * Pass every module file the app's production build contains, from every
 * bundle that renders Astryx. Paths outside the stylesheet's package, and
 * package modules that use no styles, change nothing. Retained rules keep
 * their text and order, so every element those modules render computes the
 * same styles as with the whole stylesheet. Listing every module returns the
 * whole stylesheet unchanged.
 *
 * A subset matches only the package version it came from: regenerate it on
 * every build. Subset each stylesheet you load (`astryx.css`, and `lab.css`,
 * `charts.css` or `richtext.css`) with the same list.
 *
 * Throws when the stylesheet cannot be read, has no subset data, or differs
 * from the stylesheet that data describes.
 *
 * @param stylesheet - Path or `file:` URL of a precompiled package stylesheet.
 * @param modules - Paths or `file:` URLs of the module files the build
 *   contains. Relative paths resolve against the working directory.
 * @returns The subset stylesheet.
 *
 * @example
 * ```
 * import {subsetStylesheet} from '@astryxdesign/core/stylesheet';
 *
 * const css = subsetStylesheet(
 *   import.meta.resolve('@astryxdesign/core/astryx.css'),
 *   moduleFiles,
 * );
 * ```
 */
export function subsetStylesheet(
  stylesheet: string | URL,
  modules: Iterable<string | URL>,
): string {
  if (typeof modules === 'string') {
    throw new TypeError(
      'subsetStylesheet: modules must be a list of module files, not one path.',
    );
  }

  const file = toPath(stylesheet);
  let css: string;
  try {
    css = readFileSync(file, 'utf8');
  } catch (error) {
    throw new Error(`Cannot read the stylesheet ${file}.`, {cause: error});
  }
  const index = readIndex(file, css);

  // A bundler may report a module through a symlink or by its real path.
  const directories = [
    ...new Set([path.dirname(file), path.dirname(realpathSync(file))]),
  ];
  const moduleKey = (candidate: string | null): string | null => {
    if (candidate == null) {
      return null;
    }
    for (const directory of directories) {
      const relative = path.relative(directory, candidate);
      if (
        relative !== '' &&
        !relative.startsWith('..') &&
        !path.isAbsolute(relative)
      ) {
        return relative.split(path.sep).join('/');
      }
    }
    return null;
  };

  const kept = new Set<number>();
  for (const module of modules) {
    const modulePath = toPath(module);
    const key = moduleKey(modulePath) ?? moduleKey(realPath(modulePath));
    if (key != null && Object.hasOwn(index.modules, key)) {
      for (const rule of index.modules[key]) {
        kept.add(rule);
      }
    }
  }

  const {start, count} = index.rules;
  return css
    .split('\n')
    .filter(
      (_, line) =>
        line < start || line >= start + count || kept.has(line - start),
    )
    .join('\n');
}
