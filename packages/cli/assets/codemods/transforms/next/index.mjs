// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file next transform manifest
 *
 * Staged codemods for the next release. The Version Packages PR promotes
 * this file into the resolved version folder.
 */

import renameDropdownMenuRadioDotTarget, {
  meta as renameDropdownMenuRadioDotTargetMeta,
} from './rename-dropdown-menu-radio-dot-target.mjs';

export default [
  {
    name: 'rename-dropdown-menu-radio-dot-target',
    transform: renameDropdownMenuRadioDotTarget,
    meta: renameDropdownMenuRadioDotTargetMeta,
  },
];
