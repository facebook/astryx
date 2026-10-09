// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file iconComponentType.ts
 * @input An opaque supplied component value
 * @output A public React component-kind guard without opening lazy payloads
 * @position Server-safe guard for supplied parameterized Icon artwork
 */
import type {ComponentType} from 'react';

export function isIconComponent(
  value: unknown,
): value is ComponentType<{weight?: number}> {
  if (typeof value === 'function') {
    return true;
  }
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  const tag = Object.getOwnPropertyDescriptor(value, '$$typeof');
  if (!tag || !('value' in tag)) {
    return false;
  }
  if (tag.value === Symbol.for('react.lazy')) {
    // The public kind is sufficient. Payload/init fields are never inspected.
    return true;
  }
  if (tag.value === Symbol.for('react.forward_ref')) {
    const render = Object.getOwnPropertyDescriptor(value, 'render');
    return !!render && 'value' in render && typeof render.value === 'function';
  }
  if (tag.value === Symbol.for('react.memo')) {
    const type = Object.getOwnPropertyDescriptor(value, 'type');
    return (
      !!type &&
      'value' in type &&
      type.value !== value &&
      isIconComponent(type.value)
    );
  }
  return false;
}
