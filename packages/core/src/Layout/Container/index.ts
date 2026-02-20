/**
 * @file index.ts
 * @input Imports Container components
 * @output Exports XDSCard (from Card module), XDSSection components and types
 * @position Entry point for Layout/Container module
 *
 * SYNC: When modified, update /packages/core/src/Layout/Container/README.md
 */

export {XDSCard} from '../../Card';
export type {XDSCardProps, SizeValue} from '../../Card';

export {XDSSection} from './XDSSection';
export type {XDSSectionProps, XDSSectionVariant} from './XDSSection';
