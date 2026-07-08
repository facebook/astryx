// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.4 transform manifest
 *
 * Lists all codemods for the v0.1.4 release in the order they should run.
 */

import migrateTableProps, {
  meta as migrateTablePropsMeta,
} from './migrate-table-props.mjs';

export default [
  {
    name: 'migrate-table-props',
    transform: migrateTableProps,
    meta: migrateTablePropsMeta,
  },
];
