// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Stage the built Storybook in the existing Vercel docsite deployment.
 * @input apps/storybook/dist, produced by the docsite Vercel build command.
 * @output apps/docsite/public/storybook, served at /storybook/ on that deployment.
 * @position Build-time static asset staging; CI visual checks use their own artifact.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

export function stageStorybook(source, destination) {
  if (!fs.statSync(path.join(source, 'index.html')).isFile()) {
    throw new Error('Storybook build has no index.html');
  }
  fs.rmSync(destination, {recursive: true, force: true});
  fs.cpSync(source, destination, {recursive: true});
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
  stageStorybook(
    path.join(root, 'apps/storybook/dist'),
    path.join(root, 'apps/docsite/public/storybook'),
  );
}
