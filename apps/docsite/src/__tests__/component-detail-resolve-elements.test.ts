// Copyright (c) Meta Platforms, Inc. and affiliates.

import {isValidElement, type ReactElement} from 'react';
import {describe, expect, it, vi} from 'vitest';
import {resolveValue} from '../components/component-detail/resolveElements';

vi.mock('@xds/core', () => ({
  XDSBadge: () => null,
  XDSIcon: () => null,
  XDSSideNavItem: () => null,
}));

describe('component detail element resolution', () => {
  it('resolves descriptor arrays from playground defaults into React elements', () => {
    const resolved = resolveValue([
      {__element: 'XDSSideNavItem', props: {label: 'Dashboard'}},
      {__element: 'XDSSideNavItem', props: {label: 'Projects'}},
    ]);

    expect(Array.isArray(resolved)).toBe(true);
    const items = resolved as ReactElement<Record<string, unknown>>[];
    expect(items.every(item => isValidElement(item))).toBe(true);
    expect(items[0].props).toMatchObject({label: 'Dashboard'});
    expect(items[1].props).toMatchObject({label: 'Projects'});
  });

  it('resolves descriptors nested inside plain object props', () => {
    const resolved = resolveValue({
      before: {__element: 'XDSIcon', props: {icon: 'check', size: 'sm'}},
      children: [{__element: 'XDSBadge', props: {label: '3'}}],
    }) as {
      before: ReactElement<Record<string, unknown>>;
      children: ReactElement<Record<string, unknown>>[];
    };

    expect(isValidElement(resolved.before)).toBe(true);
    expect(resolved.before.props).toMatchObject({icon: 'check', size: 'sm'});
    expect(isValidElement(resolved.children[0])).toBe(true);
    expect(resolved.children[0].props).toMatchObject({label: '3'});
  });
});
