// Copyright (c) Meta Platforms, Inc. and affiliates.

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {describe, expect, it} from 'vitest';

import {
  buildVercelSandbox,
  sandboxBuildSteps,
} from '../scripts/build-vercel.mjs';

const root = path.resolve(import.meta.dirname, '../../..');
const config = JSON.parse(
  fs.readFileSync(path.join(root, 'apps/sandbox/vercel.json'), 'utf8'),
);

describe('standalone Sandbox Vercel project', () => {
  it('uses the Other/static preset and installs from the workspace', () => {
    expect(config.framework).toBeNull();
    expect(config.installCommand).toContain(
      'cd ../.. && node scripts/clean-workspace-node-modules.mjs',
    );
    expect(config.installCommand).toContain(
      'pnpm install --force --frozen-lockfile',
    );
    expect(config.buildCommand).toBe(
      'cd ../.. && node apps/sandbox/scripts/build-vercel.mjs',
    );
    expect(config.buildCommand.length).toBeLessThanOrEqual(256);
    expect(config.outputDirectory).toBe('out');
    expect(config.trailingSlash).toBe(true);
  });

  it('builds only Sandbox dependencies in order, with a scoped static-export base path', () => {
    expect(sandboxBuildSteps.map(step => step.name)).toEqual([
      'build plugin',
      'core',
      'lab',
      'charts',
      'Sandbox theme dependencies',
      'CLI theme templates',
      'CLI API types',
      'Sandbox static export',
    ]);
    const names = sandboxBuildSteps.map(step => step.args.join(' ')).join('\n');
    for (const unrelated of [
      '@astryxdesign/richtext',
      '@astryxdesign/vega',
      '@astryxdesign/theme-probe',
    ]) {
      expect(names).not.toContain(unrelated);
    }
    const scratch = fs.mkdtempSync(
      path.join(os.tmpdir(), 'sandbox-vercel-config-'),
    );
    try {
      const exportDir = path.join(scratch, 'apps/sandbox/out');
      fs.mkdirSync(exportDir, {recursive: true});
      fs.writeFileSync(path.join(exportDir, 'index.html'), 'static Sandbox');
      const environment = {
        CI: '1',
        VERCEL_ENV: 'preview',
        NODE_OPTIONS: '--trace-uncaught',
      };
      const calls = [];
      buildVercelSandbox(
        scratch,
        (binary, args, options) => calls.push({binary, args, options}),
        environment,
      );
      expect(calls.map(call => call.args)).toEqual(
        sandboxBuildSteps.map(step => step.args),
      );
      expect(
        calls.every(
          call => call.binary === 'pnpm' && call.options.cwd === scratch,
        ),
      ).toBe(true);
      for (const call of calls.slice(0, -1))
        expect(call.options.env).toBe(environment);
      const finalEnv = calls.at(-1).options.env;
      expect(finalEnv).toMatchObject({
        CI: '1',
        VERCEL_ENV: 'preview',
        SANDBOX_BASE_PATH: '/sandbox',
        SANDBOX_TEMPLATE_ASSETS_BASE_PATH: '/sandbox/template-assets',
      });
      expect(finalEnv.NODE_OPTIONS).toMatch(
        /--trace-uncaught.*--max-old-space-size=4096/,
      );
      expect(environment.SANDBOX_BASE_PATH).toBeUndefined();
    } finally {
      fs.rmSync(scratch, {recursive: true, force: true});
    }
  });

  it('refuses an accidental Next adapter project rather than running a broken nested build', () => {
    expect(() =>
      buildVercelSandbox(
        root,
        () => {
          throw new Error('must not run');
        },
        {NEXT_ADAPTER_PATH: '/outer/adapter'},
      ),
    ).toThrow(/Framework Preset=Other/);
    expect(() =>
      buildVercelSandbox(
        root,
        () => {
          throw new Error('must not run');
        },
        {NEXT_ADAPTER_VERCEL_CONFIG: 'outer-config'},
      ),
    ).toThrow(/Framework Preset=Other/);
  });

  it('serves static export directories and assets under /sandbox without intercepting other paths', () => {
    expect(config.rewrites).toEqual([
      {source: '/sandbox', destination: '/index.html'},
      {source: '/sandbox/:path*', destination: '/:path*'},
    ]);
    expect(config.buildCommand).not.toContain('astryx-canary.vercel.app');
  });

  it('builds Next 15 export bytes with a /sandbox asset base, not a server runtime', () => {
    const env = {
      ...process.env,
      NODE_ENV: 'production',
      SANDBOX_BASE_PATH: '/sandbox',
    };
    delete env.TURBOPACK;
    const stdout = execFileSync(
      process.execPath,
      [
        '--input-type=module',
        '-e',
        "import config from './apps/sandbox/next.config.mjs'; console.log(JSON.stringify({output:config.output,basePath:config.basePath,trailingSlash:config.trailingSlash,assetBase:config.env.NEXT_PUBLIC_BASE_PATH}))",
      ],
      {cwd: root, env, encoding: 'utf8'},
    );
    expect(JSON.parse(stdout.trim().split('\n').at(-1))).toEqual({
      output: 'export',
      basePath: '/sandbox',
      trailingSlash: true,
      assetBase: '/sandbox',
    });
  });
});
