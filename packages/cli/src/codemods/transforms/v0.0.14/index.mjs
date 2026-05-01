/**
 * @file v0.0.14 transform manifest
 *
 * Lists all codemods for the v0.0.14 release in the order they should run.
 */

import renameActionProps, {
  meta as renameActionPropsMeta,
} from './rename-action-props.mjs';

export default [
  {
    name: 'rename-action-props',
    transform: renameActionProps,
    meta: renameActionPropsMeta,
  },
];
