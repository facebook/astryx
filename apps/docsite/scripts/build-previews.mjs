// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Build and stage Storybook and Vite Sandbox in the existing Vercel docsite preview.
 * @input VERCEL_ENV, Storybook static build, and Sandbox Vite static build.
 * @output apps/docsite/public/{storybook,sandbox} only in preview/canary deployments.
 * @position Build-time staging before the docsite Next.js build; CI retains its own visual artifact.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function stageStorybook(source, destination) {
  const index = path.join(source, 'index.html');
  if (!fs.existsSync(index) || !fs.statSync(index).isFile()) {
    throw new Error(`Storybook build has no index.html: ${index}`);
  }
  const html = fs.readFileSync(index, 'utf8');
  const head = html.match(/<head(?:\s[^>]*)?>/i)?.[0];
  if (!head || /<base\b/i.test(html)) {
    throw new Error(
      'Storybook index.html must have a head without a base element',
    );
  }

  // Next.js redirects /storybook/ to /storybook. Fix the base for relative
  // manager, iframe, and asset URLs without changing Storybook's CI build.
  fs.rmSync(destination, {recursive: true, force: true});
  fs.cpSync(source, destination, {recursive: true});
  fs.writeFileSync(
    indexPath(destination),
    html.replace(head, `${head}\n    <base href="/storybook/" />`),
  );
}

function indexPath(directory) {
  return path.join(directory, 'index.html');
}

export function stageSandbox(source, destination) {
  for (const relative of ['index.html', '404.html', '404/index.html']) {
    const file = path.join(source, relative);
    if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {
      throw new Error(`Sandbox build has no ${relative}: ${file}`);
    }
  }
  // The Vite export already uses /sandbox/ for JS, CSS, template assets and
  // fullscreen embeds. Copy the physical tree unchanged: missing paths must
  // stay missing rather than falling through to an SPA shell.
  fs.rmSync(destination, {recursive: true, force: true});
  fs.cpSync(source, destination, {recursive: true});
}

function runPreviewBuild(run, root, name, args, env = process.env) {
  try {
    const output = run('pnpm', args, {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
      env,
    });
    if (output) process.stdout.write(output);
  } catch (error) {
    const detail = [error.stdout, error.stderr]
      .filter(Boolean)
      .join('\n')
      .slice(-12000);
    throw new Error(
      `${name} preview build failed:\n${detail || error.message}`,
      {
        cause: error,
      },
    );
  }
}

export function buildPreviews(deploymentEnv, root, run = execFileSync) {
  const publicDir = path.join(root, 'apps/docsite/public');
  const storybookDestination = path.join(publicDir, 'storybook');
  const sandboxDestination = path.join(publicDir, 'sandbox');
  if (deploymentEnv !== 'preview') {
    // Release docs must never package an earlier cached preview.
    fs.rmSync(storybookDestination, {recursive: true, force: true});
    fs.rmSync(sandboxDestination, {recursive: true, force: true});
    return;
  }

  // Remove cached previews before either build: a failed build must not leave
  // an older static tree that the subsequent Next build could accidentally ship.
  fs.rmSync(storybookDestination, {recursive: true, force: true});
  fs.rmSync(sandboxDestination, {recursive: true, force: true});
  runPreviewBuild(run, root, 'Storybook', [
    '-F',
    '@astryxdesign/storybook',
    'build',
  ]);
  runPreviewBuild(
    run,
    root,
    'Sandbox',
    ['-F', '@astryxdesign/sandbox', 'build'],
    {...process.env, SANDBOX_BASE_PATH: '/sandbox'},
  );
  stageStorybook(path.join(root, 'apps/storybook/dist'), storybookDestination);
  stageSandbox(path.join(root, 'apps/sandbox/out'), sandboxDestination);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  buildPreviews(process.env.VERCEL_ENV, root);
}
