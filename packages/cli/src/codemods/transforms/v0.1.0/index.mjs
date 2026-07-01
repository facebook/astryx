// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file v0.1.0 transform manifest
 *
 * Lists all codemods for the v0.1.0 release in the order they should run.
 */

import dropXdsPrefixImports, {
  meta as dropXdsPrefixImportsMeta,
} from './drop-xds-prefix-imports.mjs';

import migrateXdsModuleSpecifiers, {
  meta as migrateXdsModuleSpecifiersMeta,
} from './migrate-xds-module-specifiers.mjs';

export default [
  {
    // XDS-prefix migration (P2380608025). Mandatory in v0.1.0: the release
    // dropped the prefixed compatibility aliases (useXDSTheme, XDSButton,
    // XDSIconRegistry, ...), so consumers upgrading from 0.0.x MUST rewrite
    // prefixed imports to their bare names.
    //
    // Ordered BEFORE migrate-xds-module-specifiers so it sees `@xds/core`
    // imports (its source matcher) and un-prefixes the identifiers first;
    // the specifier codemod then rewrites the paths to `@astryxdesign/core`.
    // The runner preserves this array order (see runner.mjs).
    name: 'drop-xds-prefix-imports',
    transform: dropXdsPrefixImports,
    meta: dropXdsPrefixImportsMeta,
  },
  {
    name: 'migrate-xds-module-specifiers',
    transform: migrateXdsModuleSpecifiers,
    meta: migrateXdsModuleSpecifiersMeta,
  },
];
