// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file useOutlineFromMarkdown.ts
 * @input Uses React, parseOutlineFromMarkdown
 * @output Exports useOutlineFromMarkdown hook
 * @position Hook utility; consumed by applications and Outline examples
 *
 * SYNC: When modified, update these files to stay in sync:
 * - /packages/core/src/Outline/Outline.doc.mjs
 * - /packages/core/src/Outline/index.ts
 */

import {useMemo} from 'react';
import {parseOutlineFromMarkdown} from './parseOutlineFromMarkdown';
import type {OutlineItem} from './types';

/** Extract a stable outline from a Markdown string. */
export function useOutlineFromMarkdown(markdown: string): OutlineItem[] {
  return useMemo(() => parseOutlineFromMarkdown(markdown), [markdown]);
}
