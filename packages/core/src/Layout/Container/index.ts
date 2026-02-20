/**
 * @file index.ts
 * @input Imports Container components
 * @output Re-exports XDSCard, XDSSection and container utility
 * @position Entry point for Layout/Container module
 *
 * XDSCard and XDSSection have their own top-level modules.
 * These re-exports preserve backward compatibility for '@xds/core/Layout' imports.
 *
 * SYNC: When modified, update /packages/core/src/Layout/Container/README.md
 */

export {XDSCard} from '../../Card';
export type {XDSCardProps} from '../../Card';

export {XDSSection} from '../../Section';
export type {XDSSectionProps, XDSSectionVariant} from '../../Section';

export type {SizeValue} from '../../utils/types';
