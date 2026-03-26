/**
 * @file v0.0.8 transform manifest
 *
 * Lists all codemods for the v0.0.8 release in the order they should run.
 */

import renameEndSlotToEndContent, {
  meta as endSlotMeta,
} from './rename-endslot-to-endcontent.mjs';

import migrateTokenRenames, {
  meta as migrateTokenRenamesMeta,
} from './migrate-token-renames.mjs';

export default [
  {
    name: 'rename-endslot-to-endcontent',
    transform: renameEndSlotToEndContent,
    meta: endSlotMeta,
  },
  {
    name: 'migrate-token-renames',
    transform: migrateTokenRenames,
    meta: migrateTokenRenamesMeta,
  },
];
