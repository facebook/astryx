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

import renameImperativeRefToHandleRef, {
  meta as renameImperativeRefToHandleRefMeta,
} from './rename-imperative-ref-to-handleRef.mjs';

import renameStackElementToAs, {
  meta as renameStackElementToAsMeta,
} from './rename-stack-element-to-as.mjs';

import migrateItemChildrenToEndContent, {
  meta as migrateItemChildrenToEndContentMeta,
} from './migrate-item-children-to-endcontent.mjs';

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
  {
    name: 'rename-imperative-ref-to-handleRef',
    transform: renameImperativeRefToHandleRef,
    meta: renameImperativeRefToHandleRefMeta,
  },
  {
    name: 'rename-stack-element-to-as',
    transform: renameStackElementToAs,
    meta: renameStackElementToAsMeta,
  },
  {
    name: 'migrate-item-children-to-endcontent',
    transform: migrateItemChildrenToEndContent,
    meta: migrateItemChildrenToEndContentMeta,
  },
];
