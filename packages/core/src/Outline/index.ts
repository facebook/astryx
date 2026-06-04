// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file index.ts
 * @input Imports XDSOutline, outline hooks, parser utility, and types
 * @output Exports XDSOutline component, OutlineItem type, and outline helpers
 * @position Component entry point for Outline
 *
 * SYNC: When modified, update /packages/core/src/Outline/Outline.doc.mjs
 */

export {XDSOutline} from './XDSOutline';
export type {XDSOutlineProps, XDSOutlineDensity} from './XDSOutline';
export type {OutlineItem} from './types';
export {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
export {useOutlineFromMarkdown} from './useOutlineFromMarkdown';
export {useOutlineFromDOM} from './useOutlineFromDOM';
