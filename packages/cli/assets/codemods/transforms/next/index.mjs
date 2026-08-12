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
import removeIndicatorA11yProps, {
  meta as removeIndicatorA11yPropsMeta,
} from './remove-indicator-a11y-props.mjs';

export default [
  {
    name: 'rename-dropdown-menu-radio-dot-target',
    transform: renameDropdownMenuRadioDotTarget,
    meta: renameDropdownMenuRadioDotTargetMeta,
  },
  {
    name: 'remove-indicator-a11y-props',
    transform: removeIndicatorA11yProps,
    meta: removeIndicatorA11yPropsMeta,
  },
];
