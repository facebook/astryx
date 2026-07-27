// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.7 transform manifest
 *
 * Lists all codemods for the v0.1.7 release in the order they should run.
 */

import migrateTableTablePropsToDirectProps, {
  meta as migrateTableTablePropsToDirectPropsMeta,
} from './migrate-table-tableprops-to-direct-props.mjs';
import renameTableRenderPropsStylesToXstyle, {
  meta as renameTableRenderPropsStylesToXstyleMeta,
} from './rename-table-renderprops-styles-to-xstyle.mjs';

export default [
  {
    name: 'migrate-table-tableprops-to-direct-props',
    transform: migrateTableTablePropsToDirectProps,
    meta: migrateTableTablePropsToDirectPropsMeta,
  },
  {
    name: 'rename-table-renderprops-styles-to-xstyle',
    transform: renameTableRenderPropsStylesToXstyle,
    meta: renameTableRenderPropsStylesToXstyleMeta,
  },
];
