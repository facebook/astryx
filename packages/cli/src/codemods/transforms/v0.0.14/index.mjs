/**
 * @file v0.0.14 transform manifest
 *
 * Lists all codemods for the v0.0.14 release in the order they should run.
 */

import renameAttachmentsToDrawer, {
  meta as renameAttachmentsToDrawerMeta,
} from './rename-attachments-to-drawer.mjs';

export default [
  {
    name: 'rename-attachments-to-drawer',
    transform: renameAttachmentsToDrawer,
    meta: renameAttachmentsToDrawerMeta,
  },
];
