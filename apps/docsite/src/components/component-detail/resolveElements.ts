/**
 * Resolves ElementDescriptor objects into React elements at runtime.
 * Shared between InteractivePreview (for playground defaults) and
 * PlaygroundPropsTable (for slot element controls).
 */

import {createElement, type ComponentType} from 'react';
import * as XDSCore from '@xds/core';
import type {ElementDescriptor} from '../../generated/componentRegistry';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyComponent = ComponentType<any>;

export function getXDSComponent(name: string): AnyComponent | null {
  // Try both with and without XDS prefix
  const withPrefix = `XDS${name}` as keyof typeof XDSCore;
  const direct = name as keyof typeof XDSCore;
  const value = XDSCore[withPrefix] ?? XDSCore[direct];
  return typeof value === 'function' ? (value as AnyComponent) : null;
}

export function isElementDescriptor(v: unknown): v is ElementDescriptor {
  return v != null && typeof v === 'object' && '__element' in v;
}

export function resolveElementDescriptor(
  desc: ElementDescriptor,
): React.ReactNode {
  const Comp = getXDSComponent(desc.__element.replace(/^XDS/, ''));
  const tag = Comp ?? desc.__element;

  let children: React.ReactNode = undefined;
  if (desc.children != null) {
    if (typeof desc.children === 'string') {
      children = desc.children;
    } else if (Array.isArray(desc.children)) {
      children = desc.children.map((c, i) =>
        typeof c === 'string'
          ? c
          : createElement('span', {key: i}, resolveElementDescriptor(c)),
      );
    } else {
      children = resolveElementDescriptor(desc.children);
    }
  }

  return createElement(tag, desc.props ?? {}, children);
}

export function resolveValue(v: unknown): unknown {
  if (isElementDescriptor(v)) return resolveElementDescriptor(v);
  return v;
}
