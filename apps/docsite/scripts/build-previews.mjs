// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Build and stage Storybook and Sandbox only for Vercel previews.
 * @input VERCEL_ENV, apps/storybook/dist and apps/sandbox/out; Sandbox uses /sandbox as basePath.
 * @output apps/docsite/public/storybook and apps/docsite/public/sandbox in preview builds only.
 * @position Build-time preview orchestration before the existing docsite Next.js build.
 */

import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function clearPreviews(publicDir) {
  for (const name of ['storybook', 'sandbox']) {
    fs.rmSync(path.join(publicDir, name), {recursive: true, force: true});
  }
}

export function stagePreviews(storybookSource, sandboxSource, publicDir) {
  const exports = [
    {name: 'Storybook', source: storybookSource},
    {name: 'Sandbox', source: sandboxSource},
  ];

  // Check both exports before removing either staged copy. A failed build must
  // never leave a deployment with one fresh preview and one stale preview.
  for (const {name, source} of exports) {
    const index = path.join(source, 'index.html');
    if (!fs.existsSync(index) || !fs.statSync(index).isFile()) {
      throw new Error(`${name} build has no index.html: ${index}`);
    }
  }

  // Next.js redirects /storybook/ to /storybook; without a base element,
  // Storybook's ./sb-manager and ./iframe.html URLs would load from the root.
  const storybookIndex = fs.readFileSync(
    path.join(storybookSource, 'index.html'),
    'utf8',
  );
  const head = storybookIndex.match(/<head(?:\s[^>]*)?>/i)?.[0];
  if (!head || /<base\b/i.test(storybookIndex)) {
    throw new Error(
      'Storybook index.html must have a head without a base element',
    );
  }

  clearPreviews(publicDir);
  for (const {name, source} of exports) {
    fs.cpSync(source, path.join(publicDir, name.toLowerCase()), {
      recursive: true,
    });
  }
  fs.writeFileSync(
    path.join(publicDir, 'storybook/index.html'),
    storybookIndex.replace(head, `${head}\n    <base href="/storybook/" />`),
  );
}

function runPreviewBuild(run, root, packageName, env = process.env) {
  const args = ['-F', packageName, 'build'];
  try {
    const output = run('pnpm', args, {
      cwd: root,
      env,
      encoding: 'utf8',
      maxBuffer: 64 * 1024 * 1024,
    });
    if (output) process.stdout.write(output);
  } catch (error) {
    // execFileSync with inherited stdio throws with null stdout/stderr, hiding
    // the build error behind its generic stack. Keep the actionable tail.
    const detail = [error.stdout, error.stderr]
      .filter(Boolean)
      .join('\n')
      .slice(-12000);
    throw new Error(
      `${packageName} preview build failed (${error.status ?? error.signal ?? 'unknown exit'}):\n${detail || error.message}`,
      {cause: error},
    );
  }
}

export function buildPreviews(deploymentEnv, root, run = execFileSync) {
  const publicDir = path.join(root, 'apps/docsite/public');
  if (deploymentEnv !== 'preview') {
    // Never package a cached preview into a production docs release.
    clearPreviews(publicDir);
    return;
  }

  runPreviewBuild(run, root, '@astryxdesign/storybook');
  runPreviewBuild(run, root, '@astryxdesign/sandbox', {
    ...process.env,
    SANDBOX_BASE_PATH: '/sandbox',
    SANDBOX_TEMPLATE_ASSETS_BASE_PATH: '/sandbox/template-assets',
    NODE_OPTIONS:
      `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=8192`.trim(),
  });
  stagePreviews(
    path.join(root, 'apps/storybook/dist'),
    path.join(root, 'apps/sandbox/out'),
    publicDir,
  );
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
