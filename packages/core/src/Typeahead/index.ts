'use client';

/**
 * @file index.ts
 * @input Typeahead components and types
 * @output Exports all Typeahead module public API
 * @position Entry point for Typeahead module
 *
 * SYNC: When adding new Typeahead files, update exports here
 */

// Shared types
export type {XDSSearchableItem, XDSSearchSource} from './types';

// Base (unstyled) typeahead
export {XDSBaseTypeahead} from './XDSBaseTypeahead';
export type {XDSBaseTypeaheadProps} from './XDSBaseTypeahead';

// Styled typeahead
export {XDSTypeahead} from './XDSTypeahead';
export type {
  XDSTypeaheadProps,
  XDSTypeaheadSize,
  XDSTypeaheadStatus,
  XDSTypeaheadStatusType,
} from './XDSTypeahead';

// Typeahead item
export {XDSTypeaheadItem} from './XDSTypeaheadItem';
export type {XDSTypeaheadItemProps} from './XDSTypeaheadItem';
