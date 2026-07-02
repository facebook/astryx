// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Source invariants for the Table server-client boundary.
 *
 * The Table barrel (index.ts) must stay free of 'use client' so the pure
 * column utilities (proportional, pixel, generateColumns, paginateData)
 * remain callable from React Server Components; a directive on the barrel
 * marks them as client functions and they throw when called during a
 * server render (#3457). The client boundary is carried by each component
 * module instead, so this test pins both halves of that arrangement.
 */

import {describe, it, expect} from 'vitest';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {fileURLToPath} from 'node:url';

const tableDir = path.dirname(fileURLToPath(import.meta.url));

function hasUseClient(file: string): boolean {
  const content = fs.readFileSync(path.join(tableDir, file), 'utf-8');
  return /^\s*['"]use client['"];\s*$/m.test(content);
}

describe('Table RSC boundary', () => {
  it('keeps the barrel free of "use client" so column utilities stay server-safe', () => {
    expect(hasUseClient('index.ts')).toBe(false);
    expect(hasUseClient('columnUtils.ts')).toBe(false);
    expect(hasUseClient('types.ts')).toBe(false);
  });

  it('keeps the directive on the client component modules', () => {
    expect(hasUseClient('Table.tsx')).toBe(true);
    expect(hasUseClient('BaseTable.tsx')).toBe(true);
    expect(hasUseClient('TableCell.tsx')).toBe(true);
    expect(hasUseClient('TableContext.ts')).toBe(true);
  });
});
