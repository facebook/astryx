// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.0.15 transform manifest
 *
 * Lists all codemods for the v0.0.15 release in the order they should run.
 */

import renameDatePickerToInput, {
  meta as renameDatePickerToInputMeta,
} from './rename-date-picker-to-input.mjs';

import renameIsStreamingToIsStopShown, {
  meta as renameIsStreamingToIsStopShownMeta,
} from './rename-isStreaming-to-isStopShown.mjs';

export default [
  {
    name: 'rename-date-picker-to-input',
    transform: renameDatePickerToInput,
    meta: renameDatePickerToInputMeta,
  },
  {
    name: 'rename-isStreaming-to-isStopShown',
    transform: renameIsStreamingToIsStopShown,
    meta: renameIsStreamingToIsStopShownMeta,
  },
];
