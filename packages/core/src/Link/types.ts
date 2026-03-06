/**
 * @file types.ts
 * @input React ElementType
 * @output Exports XDSLinkComponentType
 * @position Shared types for polymorphic link infrastructure
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Link/index.ts
 * - /packages/core/src/Link/Link.doc.mjs
 */

import type {ElementType} from 'react';

/**
 * A component that can be used as a link.
 * Accepts at minimum: href, className, style, children.
 *
 * Uses `ElementType` (not `ComponentType`) so that `'a'` (the string)
 * is also valid, which is the default.
 */
export type XDSLinkComponentType = ElementType;
