// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file core-interception.test.mjs
 * @input interceptCore with a stand-in theme namespace and a root loader; jiti
 *   evaluating modules through the interception's virtual modules
 * @output The root namespace is read only when a theme module requires the
 *   root, once, with its own exports and `defineTheme` wrapped; a root that
 *   does not load falls back to the theme namespace; jiti reads a virtual
 *   module only when a module requires it, so a theme that imports only the
 *   theme subpath never loads the root
 * @position Unit test of packages/cli/api/theme/build/core-interception.mjs
 */

import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';
import {createJiti} from 'jiti';
import {afterEach, describe, expect, it, vi} from 'vitest';
import {interceptCore} from './core-interception.mjs';

const themeNamespace = () => ({
  defineTheme: input => ({...input, defined: true}),
  themeOnly: 'theme',
});
const rootNamespace = () => ({
  defineTheme: input => ({...input, defined: true}),
  Button: 'root-only',
});

let dir;
afterEach(() => {
  if (dir) fs.rmSync(dir, {recursive: true, force: true});
  dir = undefined;
});

describe('interceptCore', () => {
  it('reads the root only when it is asked for, once', () => {
    const loadRoot = vi.fn(rootNamespace);
    const {modules, observed} = interceptCore(themeNamespace(), loadRoot);
    expect(modules['@astryxdesign/core/theme'].themeOnly).toBe('theme');
    expect('@astryxdesign/core' in modules).toBe(true);
    expect(loadRoot).not.toHaveBeenCalled();

    const root = modules['@astryxdesign/core'];
    expect(root.Button).toBe('root-only');
    expect(observed(root.defineTheme({name: 'ocean'}))).toBe(true);
    expect(modules['@astryxdesign/core']).toBe(root);
    expect(loadRoot).toHaveBeenCalledTimes(1);
  });

  it('falls back to the theme namespace when the root does not load', () => {
    const {modules} = interceptCore(themeNamespace(), () => null);
    expect(modules['@astryxdesign/core'].themeOnly).toBe('theme');
  });

  it('still takes a root namespace itself', () => {
    const {modules} = interceptCore(themeNamespace(), rootNamespace());
    expect(modules['@astryxdesign/core'].Button).toBe('root-only');
  });

  it('loads the root through jiti only for a module that requires it', async () => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'astryx-intercept-'));
    fs.writeFileSync(
      path.join(dir, 'theme-only.ts'),
      "import {defineTheme} from '@astryxdesign/core/theme';\nexport default defineTheme({name: 'ocean'});\n",
    );
    fs.writeFileSync(
      path.join(dir, 'root.ts'),
      "import {Button, defineTheme} from '@astryxdesign/core';\nexport default defineTheme({name: String(Button)});\n",
    );
    const loadRoot = vi.fn(rootNamespace);
    const {modules} = interceptCore(themeNamespace(), loadRoot);
    const jiti = createJiti(import.meta.url, {
      moduleCache: false,
      virtualModules: modules,
    });

    const themeOnly = await jiti.import(path.join(dir, 'theme-only.ts'), {
      default: true,
    });
    expect(themeOnly).toMatchObject({name: 'ocean', defined: true});
    expect(loadRoot).not.toHaveBeenCalled();

    const root = await jiti.import(path.join(dir, 'root.ts'), {default: true});
    expect(root).toMatchObject({name: 'root-only', defined: true});
    expect(loadRoot).toHaveBeenCalledTimes(1);
  });
});
