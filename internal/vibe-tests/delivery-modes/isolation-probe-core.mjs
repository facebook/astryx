// Copyright (c) Meta Platforms, Inc. and affiliates.

import * as fs from 'node:fs';
import * as path from 'node:path';

const fsp = fs.promises;

export async function scanVisibleProcesses({
  procRoot = '/proc',
  token,
  projectDir,
}) {
  let entries = [];
  try {
    entries = await fsp.readdir(procRoot, {withFileTypes: true});
  } catch {
    return {
      visibleProcessCount: 0,
      siblingCmdlineVisible: false,
      siblingRootReadable: false,
    };
  }

  const processIds = entries
    .filter(entry => entry.isDirectory() && /^\d+$/.test(entry.name))
    .map(entry => entry.name);
  let siblingCmdlineVisible = false;
  let siblingRootReadable = false;
  const relativeProject = projectDir.replace(/^\/+/, '');

  for (const pid of processIds) {
    try {
      const cmdline = (await fsp.readFile(path.join(procRoot, pid, 'cmdline')))
        .toString('utf8')
        .replaceAll('\0', ' ');
      if (cmdline.includes(token)) {
        siblingCmdlineVisible = true;
      }
    } catch {
      // Inaccessible processes are isolated for this probe.
    }
    try {
      const marker = await fsp.readFile(
        path.join(
          procRoot,
          pid,
          'root',
          relativeProject,
          '.isolation-probe-marker',
        ),
        'utf8',
      );
      if (marker === token) {
        siblingRootReadable = true;
      }
    } catch {
      // Inaccessible roots are isolated for this probe.
    }
  }

  return {
    visibleProcessCount: processIds.length,
    siblingCmdlineVisible,
    siblingRootReadable,
  };
}
