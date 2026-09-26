// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.0.10 transform manifest
 *
 * Lists all codemods for the v0.0.10 release in the order they should run.
 */

import removeSizeProps, {
  meta as removeSizePropsMeta,
} from './remove-size-props.mjs';

export default [
  {
    name: 'remove-size-props',
    transform: removeSizeProps,
    meta: removeSizePropsMeta,
  },
];
