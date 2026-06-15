// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file compress.ts
 * @input Raw playground source code (string)
 * @output URL-safe compressed string (base64url-encoded deflate)
 * @position lib/ — shared compression utilities for playground URL encoding.
 *
 * Uses fflate (deflate level 9 + base64url) which produces ~30-40% shorter
 * output than lz-string for typical JSX/TSX playground code.
 *
 * Decompression supports both the new fflate format and legacy lz-string URLs
 * so existing shared links continue to work.
 */

import {deflateSync, inflateSync} from 'fflate';
import {decompressFromEncodedURIComponent} from 'lz-string';

/**
 * Compress source code to a URL-safe string (base64url-encoded deflate).
 */
export function compressCode(code: string): string {
  const encoded = new TextEncoder().encode(code);
  const deflated = deflateSync(encoded, {level: 9});
  return bufferToBase64Url(deflated);
}

/**
 * Decompress a URL param back to source code.
 * Handles both new (fflate/base64url) and legacy (lz-string) formats.
 */
export function decompressCode(compressed: string): string | null {
  // Try fflate first (base64url → inflate)
  try {
    const bytes = base64UrlToBuffer(compressed);
    const inflated = inflateSync(bytes);
    return new TextDecoder().decode(inflated);
  } catch {
    // Fall through to lz-string for legacy URLs
  }

  // Legacy: lz-string encoded URI component
  try {
    return decompressFromEncodedURIComponent(compressed);
  } catch {
    return null;
  }
}

function bufferToBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function base64UrlToBuffer(str: string): Uint8Array {
  const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}
