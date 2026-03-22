'use client';

/**
 * @file index.ts
 * @input Imports from TabList component files
 * @output Exports XDSTabList, XDSTab, XDSTabMenu and their types
 * @position Component entry point; re-exported by /packages/core/src/index.ts
 *
 * SYNC: When modified, update this header and /packages/core/src/TabList/TabList.doc.mjs
 */

export {XDSTabList} from './XDSTabList';
export type {XDSTabListProps} from './XDSTabList';

export {XDSTab} from './XDSTab';
export type {XDSTabProps} from './XDSTab';

export {XDSTabMenu} from './XDSTabMenu';
export type {XDSTabMenuProps, XDSTabMenuOption} from './XDSTabMenu';

export type {XDSTabListSize} from './XDSTabListContext';
