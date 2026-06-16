// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Timestamp component
 * @output Exports all Timestamp module public API
 * @position Entry point for Timestamp module
 *
 * SYNC: When adding new Timestamp files, update exports here
 */

export {XDSTimestamp} from './XDSTimestamp';
export type {XDSTimestampProps, XDSTimestampFormat} from './XDSTimestamp';


// <compat-aliases:start> — generated, do not edit by hand
// Unprefixed compatibility aliases (XDS-prefix migration P2380608025).
// Prefixed names above remain canonical + module-augmentation targets.
// These bare re-exports reference the SAME values/types.
// Regenerate: node scripts/generate-compat-aliases.mjs
export {
  XDSTimestamp as Timestamp,
} from '.';
export type {
  XDSTimestampFormat as TimestampFormat,
  XDSTimestampProps as TimestampProps,
} from '.';
// <compat-aliases:end>
