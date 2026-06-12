// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file Compression round-trip and backward-compat tests.
 * Run: pnpm -F @xds/docsite test
 */

import {describe, it, expect} from 'vitest';
import {compressCode, decompressCode} from '../lib/compress';
import {compressToEncodedURIComponent} from 'lz-string';

describe('compress', () => {
  const SAMPLE = `import {XDSButton} from '@xds/core/Button';
export default function Demo() {
  return <XDSButton label="Hello" variant="primary" />;
}`;

  it('round-trips code through compress/decompress', () => {
    const compressed = compressCode(SAMPLE);
    const decompressed = decompressCode(compressed);
    expect(decompressed).toBe(SAMPLE);
  });

  it('produces shorter output than lz-string', () => {
    const fflateLen = compressCode(SAMPLE).length;
    const lzLen = compressToEncodedURIComponent(SAMPLE).length;
    expect(fflateLen).toBeLessThan(lzLen);
  });

  it('decompresses legacy lz-string URLs', () => {
    const lzCompressed = compressToEncodedURIComponent(SAMPLE);
    const decompressed = decompressCode(lzCompressed);
    expect(decompressed).toBe(SAMPLE);
  });

  it('returns null for garbage input', () => {
    expect(decompressCode('not-valid-at-all-!!!!')).toBeNull();
  });
});
