// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file touch.ts
 * @input The gathered touch and gesture module (touch-support/touchModule)
 * @output `@astryxdesign/core/internal/touch`: touchModule and its type, for
 *   Lab components
 * @position An internal entry reserved for Astryx's own packages:
 *   undocumented, outside the public API and its compatibility promise,
 *   versioned in lockstep with Core, and allowed by lint only in Core and Lab
 *   (architecture:react-component-runtime INV13). Core components import the
 *   module by relative path; a bundler keeps one copy per page either way.
 *
 * SYNC: When modified, update scripts/touch-support-bundle.test.mjs.
 */

export {touchModule} from '../touch-support/touchModule';
export type {TouchModule} from '../touch-support/touchModule';
