// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Tour, TourStep, useTour
 * @output Re-exports the Tour lab experiment's public API
 * @position Lab entry point for the Tour directory
 *
 * SYNC: When modified, update /packages/lab/src/Tour/Tour.doc.mjs
 */

export {Tour} from './Tour';
export type {TourProps} from './Tour';

export {TourStep} from './TourStep';
export type {TourStepProps} from './TourStep';

export {useTour} from './useTour';
export type {UseTourReturn} from './useTour';

export type {TourDismissSource} from './TourContext';
