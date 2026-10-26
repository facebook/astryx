// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.ts
 * @input The touch module's registry hook and type (touch-support/)
 * @output `@astryxdesign/core/internal/touch`: useTouchSupport and the touch
 *   module's type, for Core and Lab components
 * @position An internal entry reserved for Astryx's own packages:
 *   undocumented, outside the public API and its compatibility promise,
 *   versioned in lockstep with Core, and allowed by lint only in Core and Lab
 *   (architecture:react-component-runtime INV13). The public entry is
 *   `@astryxdesign/core/touch-support`.
 *
 * SYNC: When modified, update scripts/touch-support-bundle.test.mjs.
 */

export {useTouchSupport} from '../touch-support/useTouchSupport';
export type {TouchModule} from '../touch-support/touchModule';
