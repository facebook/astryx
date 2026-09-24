// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Build and stage Storybook in the existing Vercel docsite preview.
 * @input VERCEL_ENV and the Storybook static build.
 * @output apps/docsite/public/storybook only in preview/canary deployments.
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

export function buildStorybookPreview(deploymentEnv, root, run = execFileSync) {
  const destination = path.join(root, 'apps/docsite/public/storybook');
  if (deploymentEnv !== 'preview') {
    // Release docs must never package an earlier cached preview.
    fs.rmSync(destination, {recursive: true, force: true});
    return;
  }

  try {
    const output = run('pnpm', ['-F', '@astryxdesign/storybook', 'build'], {
      cwd: root,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (output) process.stdout.write(output);
  } catch (error) {
    const detail = [error.stdout, error.stderr]
      .filter(Boolean)
      .join('\n')
      .slice(-12000);
    throw new Error(
      `Storybook preview build failed:\n${detail || error.message}`,
      {cause: error},
    );
  }
  stageStorybook(path.join(root, 'apps/storybook/dist'), destination);
}

if (
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  const root = path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    '../../..',
  );
  buildStorybookPreview(process.env.VERCEL_ENV, root);
}
